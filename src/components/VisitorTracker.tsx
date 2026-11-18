
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

const VISITOR_KEY = "shreem_analytics_visitor_id";

function getVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_KEY);

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, visitorId);
  }

  return visitorId;
}

export default function VisitorTracker() {
  const location = useLocation();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const pagePath = location.pathname;

    // Prevent duplicate tracking during React Strict Mode.
    if (lastTrackedPath.current === pagePath) return;
    lastTrackedPath.current = pagePath;

    try {
      const visitorId = getVisitorId();

      let referrer: string | null = null;

      if (document.referrer) {
        try {
          referrer = new URL(document.referrer).hostname;
        } catch {
          referrer = null;
        }
      }

      void supabase.from("website_visits").insert({
        visitor_id: visitorId,
        page_path: pagePath,
        referrer,
      }).then(({ error }) => {
        if (error) {
          console.warn("Website analytics tracking failed:", error.message);
        }
      });
    } catch (error) {
      console.warn("Unable to initialize website analytics:", error);
    }
  }, [location.pathname]);

  return null;
}
