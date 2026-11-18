
-- ============================================================
-- SHREEM SOLUTIONS
-- Initial Supabase Database Migration
-- Version: 001
-- Run once on a fresh Supabase project
-- ============================================================

-- 1. EXTENSIONS
create extension if not exists pgcrypto;

-- ============================================================
-- 2. COMMON UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 3. USER PROFILES AND ROLES
-- ============================================================

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  phone text,
  role text not null default 'viewer'
    check (role in (
      'super_admin',
      'admin',
      'sales',
      'content_editor',
      'viewer'
    )),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'viewer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Role-check helper. Used by RLS policies.
create or replace function public.has_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = any(allowed_roles)
      and is_active = true
  );
$$;

-- ============================================================
-- 4. PRODUCT CATEGORIES
-- ============================================================

create table public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 5. PRODUCTS
-- ============================================================

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id)
    on delete set null,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  specifications jsonb not null default '{}'::jsonb,
  origin_country text,
  target_markets text[] not null default '{}',
  featured_image_url text,
  is_featured boolean not null default false,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  seo_title text,
  seo_description text,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 6. PRODUCT IMAGES
-- Multiple images for each product
-- ============================================================

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id)
    on delete cascade,
  storage_path text not null,
  image_url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_featured boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 7. BLOG CATEGORIES
-- ============================================================

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 8. BLOG POSTS
-- ============================================================

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.blog_categories(id)
    on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null default '',
  featured_image_url text,
  author_id uuid references public.profiles(id) on delete set null,
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'published', 'archived')),
  published_at timestamptz,
  tags text[] not null default '{}',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 9. LEADS / CRM
-- ============================================================

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  country text,
  city text,
  website text,
  product_interest text,
  estimated_value numeric(14,2),
  currency text not null default 'USD',
  source text not null default 'manual',
  status text not null default 'new'
    check (status in (
      'new',
      'contacted',
      'qualified',
      'negotiation',
      'won',
      'lost'
    )),
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high')),
  assigned_to uuid references public.profiles(id) on delete set null,
  next_follow_up_at timestamptz,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 10. CONTACT MESSAGES
-- Public website contact form submissions
-- ============================================================

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company_name text,
  country text,
  subject text,
  message text not null,
  status text not null default 'unread'
    check (status in (
      'unread',
      'read',
      'replied',
      'archived'
    )),
  assigned_to uuid references public.profiles(id) on delete set null,
  replied_at timestamptz,
  internal_notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 11. PRODUCT ENQUIRIES
-- ============================================================

create table public.product_enquiries (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id)
    on delete set null,
  name text not null,
  email text not null,
  phone text,
  company_name text,
  country text,
  quantity text,
  message text,
  status text not null default 'new'
    check (status in (
      'new',
      'contacted',
      'quoted',
      'converted',
      'closed'
    )),
  assigned_to uuid references public.profiles(id) on delete set null,
  internal_notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 12. WEBSITE SETTINGS
-- Only explicitly public settings are exposed to visitors.
-- ============================================================

create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null default '{}'::jsonb,
  is_public boolean not null default false,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- 13. ACTIVITY LOGS
-- ============================================================

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  description text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 14. INDEXES
-- ============================================================

create index products_category_idx
  on public.products(category_id);
create index products_status_idx
  on public.products(status);
create index products_featured_idx
  on public.products(is_featured);
create index product_images_product_idx
  on public.product_images(product_id, sort_order);
create index blog_posts_status_idx
  on public.blog_posts(status);
create index blog_posts_published_idx
  on public.blog_posts(published_at desc);
create index leads_status_idx
  on public.leads(status);
create index leads_assigned_idx
  on public.leads(assigned_to);
create index leads_follow_up_idx
  on public.leads(next_follow_up_at);
create index contact_messages_status_idx
  on public.contact_messages(status);
create index product_enquiries_status_idx
  on public.product_enquiries(status);
create index activity_logs_created_idx
  on public.activity_logs(created_at desc);

-- ============================================================
-- 15. UPDATED_AT TRIGGERS
-- ============================================================

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger categories_updated_at
before update on public.product_categories
for each row execute function public.set_updated_at();

create trigger products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.set_updated_at();

create trigger leads_updated_at
before update on public.leads
for each row execute function public.set_updated_at();

create trigger site_settings_updated_at
before update on public.site_settings
for each row execute function public.set_updated_at();

-- ============================================================
-- 16. ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.leads enable row level security;
alter table public.contact_messages enable row level security;
alter table public.product_enquiries enable row level security;
alter table public.site_settings enable row level security;
alter table public.activity_logs enable row level security;

-- ============================================================
-- 17. PROFILE POLICIES
-- ============================================================

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy "Super admins can read all profiles"
on public.profiles
for select
to authenticated
using (public.has_role(array['super_admin']));

create policy "Super admins can update profiles"
on public.profiles
for update
to authenticated
using (public.has_role(array['super_admin']))
with check (public.has_role(array['super_admin']));

-- ============================================================
-- 18. PRODUCT CATEGORY POLICIES
-- ============================================================

create policy "Public can read active categories"
on public.product_categories
for select
to anon, authenticated
using (
  is_active = true
  or public.has_role(array['super_admin', 'admin', 'content_editor'])
);

create policy "Editors can manage categories"
on public.product_categories
for all
to authenticated
using (
  public.has_role(array['super_admin', 'admin', 'content_editor'])
)
with check (
  public.has_role(array['super_admin', 'admin', 'content_editor'])
);

-- ============================================================
-- 19. PRODUCT POLICIES
-- ============================================================

create policy "Public can read published products"
on public.products
for select
to anon, authenticated
using (
  status = 'published'
  or public.has_role(array['super_admin', 'admin', 'content_editor', 'sales'])
);

create policy "Editors can manage products"
on public.products
for all
to authenticated
using (
  public.has_role(array['super_admin', 'admin', 'content_editor'])
)
with check (
  public.has_role(array['super_admin', 'admin', 'content_editor'])
);

-- ============================================================
-- 20. PRODUCT IMAGE POLICIES
-- ============================================================

create policy "Public can read images of published products"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and p.status = 'published'
  )
  or public.has_role(array['super_admin', 'admin', 'content_editor', 'sales'])
);

create policy "Editors can manage product images"
on public.product_images
for all
to authenticated
using (
  public.has_role(array['super_admin', 'admin', 'content_editor'])
)
with check (
  public.has_role(array['super_admin', 'admin', 'content_editor'])
);

-- ============================================================
-- 21. BLOG CATEGORY POLICIES
-- ============================================================

create policy "Public can read blog categories"
on public.blog_categories
for select
to anon, authenticated
using (true);

create policy "Editors can manage blog categories"
on public.blog_categories
for all
to authenticated
using (
  public.has_role(array['super_admin', 'admin', 'content_editor'])
)
with check (
  public.has_role(array['super_admin', 'admin', 'content_editor'])
);

-- ============================================================
-- 22. BLOG POST POLICIES
-- ============================================================

create policy "Public can read published blog posts"
on public.blog_posts
for select
to anon, authenticated
using (
  (
    status = 'published'
    and published_at is not null
    and published_at <= now()
  )
  or public.has_role(array['super_admin', 'admin', 'content_editor'])
);

create policy "Editors can manage blog posts"
on public.blog_posts
for all
to authenticated
using (
  public.has_role(array['super_admin', 'admin', 'content_editor'])
)
with check (
  public.has_role(array['super_admin', 'admin', 'content_editor'])
);

-- ============================================================
-- 23. LEAD POLICIES
-- ============================================================

create policy "Sales team can read leads"
on public.leads
for select
to authenticated
using (
  public.has_role(array['super_admin', 'admin'])
  or (
    public.has_role(array['sales'])
    and assigned_to = (select auth.uid())
  )
);

create policy "Sales team can create leads"
on public.leads
for insert
to authenticated
with check (
  public.has_role(array['super_admin', 'admin', 'sales'])
);

create policy "Sales team can update leads"
on public.leads
for update
to authenticated
using (
  public.has_role(array['super_admin', 'admin'])
  or (
    public.has_role(array['sales'])
    and assigned_to = (select auth.uid())
  )
)
with check (
  public.has_role(array['super_admin', 'admin'])
  or (
    public.has_role(array['sales'])
    and assigned_to = (select auth.uid())
  )
);

create policy "Admins can delete leads"
on public.leads
for delete
to authenticated
using (public.has_role(array['super_admin', 'admin']));

-- ============================================================
-- 24. CONTACT MESSAGE POLICIES
-- ============================================================

create policy "Public can submit contact messages"
on public.contact_messages
for insert
to anon, authenticated
with check (true);

create policy "Staff can read contact messages"
on public.contact_messages
for select
to authenticated
using (
  public.has_role(array['super_admin', 'admin'])
  or (
    public.has_role(array['sales'])
    and assigned_to = (select auth.uid())
  )
);

create policy "Staff can update contact messages"
on public.contact_messages
for update
to authenticated
using (
  public.has_role(array['super_admin', 'admin'])
  or (
    public.has_role(array['sales'])
    and assigned_to = (select auth.uid())
  )
)
with check (
  public.has_role(array['super_admin', 'admin'])
  or (
    public.has_role(array['sales'])
    and assigned_to = (select auth.uid())
  )
);

-- ============================================================
-- 25. PRODUCT ENQUIRY POLICIES
-- ============================================================

create policy "Public can submit product enquiries"
on public.product_enquiries
for insert
to anon, authenticated
with check (true);

create policy "Staff can read product enquiries"
on public.product_enquiries
for select
to authenticated
using (
  public.has_role(array['super_admin', 'admin'])
  or (
    public.has_role(array['sales'])
    and assigned_to = (select auth.uid())
  )
);

create policy "Staff can update product enquiries"
on public.product_enquiries
for update
to authenticated
using (
  public.has_role(array['super_admin', 'admin'])
  or (
    public.has_role(array['sales'])
    and assigned_to = (select auth.uid())
  )
)
with check (
  public.has_role(array['super_admin', 'admin'])
  or (
    public.has_role(array['sales'])
    and assigned_to = (select auth.uid())
  )
);

-- ============================================================
-- 26. WEBSITE SETTINGS POLICIES
-- ============================================================

create policy "Public can read public website settings"
on public.site_settings
for select
to anon, authenticated
using (
  is_public = true
  or public.has_role(array['super_admin', 'admin'])
);

create policy "Admins can manage website settings"
on public.site_settings
for all
to authenticated
using (public.has_role(array['super_admin', 'admin']))
with check (public.has_role(array['super_admin', 'admin']));

-- ============================================================
-- 27. ACTIVITY LOG POLICIES
-- ============================================================

create policy "Admins can read activity logs"
on public.activity_logs
for select
to authenticated
using (public.has_role(array['super_admin', 'admin']));

create policy "Authenticated staff can create activity logs"
on public.activity_logs
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and public.has_role(array[
    'super_admin',
    'admin',
    'sales',
    'content_editor'
  ])
);

-- ============================================================
-- 28. PRODUCT IMAGE STORAGE BUCKET
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view product image files"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "Editors can upload product image files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.has_role(array['super_admin', 'admin', 'content_editor'])
);

create policy "Editors can update product image files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and public.has_role(array['super_admin', 'admin', 'content_editor'])
)
with check (
  bucket_id = 'product-images'
  and public.has_role(array['super_admin', 'admin', 'content_editor'])
);

create policy "Editors can delete product image files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and public.has_role(array['super_admin', 'admin', 'content_editor'])
);

-- ============================================================
-- END OF INITIAL MIGRATION
-- ============================================================
