import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const allowedRoles = [
  "super_admin",
  "admin",
  "sales",
  "content_editor",
  "viewer",
];

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!supabaseUrl || !anonKey || !serviceKey) {
      throw new Error("Missing Supabase environment configuration");
    }

    const authorization = req.headers.get("Authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // Verify the caller's access token.
    const authClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: { Authorization: authorization },
      },
    });

    const {
      data: { user: actor },
      error: authError,
    } = await authClient.auth.getUser();

    if (authError || !actor) {
      return jsonResponse({ error: "Invalid session" }, 401);
    }

    // Privileged client stays on the server only.
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the caller's actual database role.
    const { data: actorProfile, error: profileError } = await admin
      .from("profiles")
      .select("id, role, is_active")
      .eq("id", actor.id)
      .single();

    console.log("MANAGE USERS AUTH CHECK:", {
      actorId: actor.id,
      profileId: actorProfile?.id ?? null,
      role: actorProfile?.role ?? null,
      isActive: actorProfile?.is_active ?? null,
      profileError: profileError
        ? {
            code: profileError.code,
            message: profileError.message,
          }
        : null,
    });

    if (
      profileError ||
      !actorProfile ||
      actorProfile.role !== "super_admin" ||
      actorProfile.is_active !== true
    ) {
      return jsonResponse(
        { error: "Only an active Super Admin can manage users." },
        403,
      );
    }

    const body = await req.json();
    const { action } = body;

    // List team members.
    if (action === "list") {
      const { data: profiles, error: usersError } = await admin
        .from("profiles")
        .select("id, full_name, role, is_active, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      const { data: authUsers, error: authUsersError } =
        await admin.auth.admin.listUsers({
          page: 1,
          perPage: 1000,
        });

      if (authUsersError) throw authUsersError;

      const users = (profiles ?? []).map((profile) => {
        const authUser = authUsers.users.find((item) => item.id === profile.id);

        return {
          ...profile,
          email: authUser?.email ?? "",
          last_sign_in_at: authUser?.last_sign_in_at ?? null,
        };
      });

      return jsonResponse({ users });
    }

    // Invite a new team member.
    if (action === "invite") {
      const fullName = String(body.full_name ?? "").trim();
      const email = String(body.email ?? "")
        .trim()
        .toLowerCase();
      const role = String(body.role ?? "viewer");

      if (!fullName || fullName.length > 120) {
        return jsonResponse({ error: "Enter a valid full name." }, 400);
      }

      if (
        !email ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return jsonResponse({ error: "Enter a valid email address." }, 400);
      }

      if (!allowedRoles.includes(role)) {
        return jsonResponse({ error: "Invalid role." }, 400);
      }

      const redirectTo = Deno.env.get("INVITE_REDIRECT_URL");

      const { data: invited, error: inviteError } =
        await admin.auth.admin.inviteUserByEmail(email, {
          data: {
            full_name: fullName,
          },
          ...(redirectTo ? { redirectTo } : {}),
        });

      if (inviteError) throw inviteError;

      if (!invited.user) {
        throw new Error("Invitation did not return a user.");
      }

      // The existing database trigger creates the profile as viewer.
      // Assign the requested role from this trusted server function.
      const { error: updateError } = await admin
        .from("profiles")
        .update({
          full_name: fullName,
          role,
          is_active: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", invited.user.id);

      if (updateError) throw updateError;

      const { error: logError } = await admin
        .from("user_activity_logs")
        .insert({
          actor_id: actor.id,
          target_user_id: invited.user.id,
          action: "user_invited",
          new_value: { email, full_name: fullName, role },
          details: `Invited ${email} as ${role}`,
        });

      if (logError) throw logError;

      return jsonResponse({
        success: true,
        message: `Invitation sent to ${email}.`,
        user_id: invited.user.id,
      });
    }

    // Change a user's role.
    if (action === "update_role") {
      const userId = String(body.user_id ?? "");
      const newRole = String(body.role ?? "");

      if (!userId || !allowedRoles.includes(newRole)) {
        return jsonResponse({ error: "Invalid user or role." }, 400);
      }

      if (userId === actor.id) {
        return jsonResponse(
          { error: "You cannot change your own role here." },
          400,
        );
      }

      const { data: target, error: targetError } = await admin
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", userId)
        .single();

      if (targetError || !target) {
        return jsonResponse({ error: "User not found." }, 404);
      }

      if (
        target.role === "super_admin" &&
        target.is_active &&
        newRole !== "super_admin"
      ) {
        const { count, error: countError } = await admin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "super_admin")
          .eq("is_active", true);

        if (countError) throw countError;

        if ((count ?? 0) <= 1) {
          return jsonResponse(
            { error: "You cannot remove the last active Super Admin." },
            400,
          );
        }
      }

      const { error: updateError } = await admin
        .from("profiles")
        .update({
          role: newRole,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      const { error: logError } = await admin
        .from("user_activity_logs")
        .insert({
          actor_id: actor.id,
          target_user_id: userId,
          action: "role_updated",
          old_value: { role: target.role },
          new_value: { role: newRole },
        });

      if (logError) throw logError;

      return jsonResponse({
        success: true,
        message: "User role updated.",
      });
    }

    // Activate or deactivate a team member.
    if (action === "set_active") {
      const userId = String(body.user_id ?? "");
      const isActive = body.is_active;

      if (!userId || typeof isActive !== "boolean") {
        return jsonResponse({ error: "Invalid user or status." }, 400);
      }

      if (userId === actor.id) {
        return jsonResponse(
          { error: "You cannot deactivate your own account." },
          400,
        );
      }

      const { data: target, error: targetError } = await admin
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", userId)
        .single();

      if (targetError || !target) {
        return jsonResponse({ error: "User not found." }, 404);
      }

      if (target.role === "super_admin" && target.is_active && !isActive) {
        const { count, error: countError } = await admin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "super_admin")
          .eq("is_active", true);

        if (countError) throw countError;

        if ((count ?? 0) <= 1) {
          return jsonResponse(
            { error: "You cannot deactivate the last active Super Admin." },
            400,
          );
        }
      }

      // Update the Auth ban as well as the application profile.
      const { error: banError } = await admin.auth.admin.updateUserById(
        userId,
        {
          ban_duration: isActive ? "none" : "876000h",
        },
      );

      if (banError) throw banError;

      const { error: updateError } = await admin
        .from("profiles")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        // Attempt to restore the previous Auth ban state.
        await admin.auth.admin.updateUserById(userId, {
          ban_duration: target.is_active ? "none" : "876000h",
        });

        throw updateError;
      }

      const { error: logError } = await admin
        .from("user_activity_logs")
        .insert({
          actor_id: actor.id,
          target_user_id: userId,
          action: isActive ? "user_activated" : "user_deactivated",
          old_value: { is_active: target.is_active },
          new_value: { is_active: isActive },
        });

      if (logError) throw logError;

      return jsonResponse({
        success: true,
        message: isActive
          ? "User account activated."
          : "User account deactivated.",
      });
    }

    return jsonResponse({ error: "Unknown action." }, 400);
  } catch (error) {
    console.error("manage-users error:", error);

    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected server error occurred.",
      },
      500,
    );
  }
});
