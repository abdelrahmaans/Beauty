-- =============================================================================
-- منصة العناية بالشعر والبشرة — PostgreSQL Database Schema for Supabase
-- Phase 1 (E-Commerce Store) + Prepared Phase 2 (Centers & Home Services)
-- =============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================================================
-- 1. ENUMS
-- =============================================================================
create type user_role as enum ('customer', 'admin');
create type discount_type as enum ('percentage', 'fixed');
create type order_status as enum ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
create type payment_status as enum ('unpaid', 'paid', 'refunded');
create type provider_type as enum ('freelancer', 'center');
create type provider_status as enum ('pending', 'verified', 'trusted', 'suspended');
create type booking_status as enum ('requested', 'offered', 'confirmed', 'in_progress', 'completed', 'cancelled', 'reported');
create type payout_status as enum ('pending', 'paid');
create type points_source as enum ('order', 'booking', 'redemption', 'manual');

-- =============================================================================
-- 5. PHASE 4 TABLES (PROMOTIONAL BANNERS)
-- =============================================================================

create type banner_type as enum ('coupon', 'announcement');
create type banner_placement as enum ('homepage');

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  type banner_type not null,
  placement banner_placement not null default 'homepage',
  title text not null,
  subtitle text,
  image_storage_path text not null,
  cta_text text,
  cta_link text,
  coupon_id uuid references coupons(id),
  is_active boolean not null default true,
  start_at timestamptz,
  end_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint coupon_required_for_coupon_type
    check (type != 'coupon' or coupon_id is not null)
);

create index if not exists idx_banners_active_homepage
  on banners (placement, is_active, sort_order)
  where is_active = true;

alter table banners enable row level security;

drop policy if exists "read active banners" on banners;
create policy "read active banners" on banners
  for select using (true);

drop policy if exists "admin manages banners" on banners;
create policy "admin manages banners" on banners
  for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create or replace view active_banners as
select *
from banners
where is_active = true
  and (start_at is null or start_at <= now())
  and (end_at is null or end_at >= now())
order by sort_order asc;

-- =============================================================================
-- 6. PHASE 5 TABLES (MANUAL PAYMENT PROOF SYSTEM)
-- =============================================================================

create type payment_reference_type as enum ('order', 'booking');
create type payment_proof_status as enum ('pending_review', 'approved', 'rejected');
create type payment_channel as enum ('bank_transfer', 'instapay', 'vodafone_cash', 'other');

create table if not exists payment_proofs (
  id uuid primary key default gen_random_uuid(),
  reference_type payment_reference_type not null,
  reference_id uuid not null,
  user_id uuid not null references profiles(id),
  channel payment_channel not null,
  sender_name text,
  amount_claimed numeric(10,2) not null,
  receipt_storage_path text not null,
  status payment_proof_status not null default 'pending_review',
  admin_note text,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_payment_proofs_pending
  on payment_proofs (status, created_at)
  where status = 'pending_review';

create or replace function apply_payment_approval()
returns trigger language plpgsql as $$
begin
  if new.status = 'approved' and (old.status is distinct from 'approved') then
    new.reviewed_at := now();

    if new.reference_type = 'order' then
      update orders set payment_status = 'paid', status = 'confirmed'
      where id = new.reference_id;

    elsif new.reference_type = 'booking' then
      update bookings set payment_status = 'paid', status = 'confirmed'
      where id = new.reference_id;
    end if;
  end if;

  if new.status = 'rejected' and (old.status is distinct from 'rejected') then
    new.reviewed_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists trg_apply_payment_approval on payment_proofs;
create trigger trg_apply_payment_approval
before update on payment_proofs
for each row execute function apply_payment_approval();

alter table payment_proofs enable row level security;

drop policy if exists "own payment proofs" on payment_proofs;
create policy "own payment proofs" on payment_proofs
  for select using (
    auth.uid() = user_id
    or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

drop policy if exists "customer submits proof" on payment_proofs;
create policy "customer submits proof" on payment_proofs
  for insert with check (auth.uid() = user_id);

-- Function: get_my_dashboard_context for role and status routing
create or replace function get_my_dashboard_context()
returns json
language plpgsql security definer as $$
declare
  v_profile profiles;
  v_provider providers;
begin
  select * into v_profile from profiles where id = auth.uid();

  if v_profile.role = 'admin' then
    return json_build_object('view', 'admin', 'status', 'verified');
  end if;

  select * into v_provider from providers where user_id = auth.uid() limit 1;

  if v_provider.id is not null then
    return json_build_object(
      'view', case v_provider.type
        when 'freelancer' then 'provider'
        when 'center' then 'center'
        else 'customer'
      end,
      'provider_id', v_provider.id,
      'status', v_provider.status  -- pending / verified / trusted / suspended
    );
  end if;

  return json_build_object('view', 'customer', 'status', 'verified');
end;
$$;

-- =============================================================================
-- 2. CORE TABLES (PHASE 1 - STORE)
-- =============================================================================

-- PROFILES (Linked to Supabase auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  avatar_url text,
  lat double precision,
  lng double precision,
  address_line text,
  city text,
  loyalty_points int not null default 0 check (loyalty_points >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile trigger on auth.user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', 'مستخدم جديد'), 'customer');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- CATEGORIES (Hierarchical: Hair Care, Skin Care, Moisturizers, Treatments...)
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  slug text not null unique,
  description text,
  image_url text,
  parent_category_id uuid references categories(id) on delete set null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- PRODUCTS
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  name_en text,
  slug text not null unique,
  description text,
  ingredients text,
  how_to_use text,
  brand text,
  price numeric(10,2) not null check (price >= 0),
  discount_price numeric(10,2) check (discount_price >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  sku text unique,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  rating_avg numeric(3,2) default 5.0,
  reviews_count int default 0,
  main_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- PRODUCT IMAGES
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  storage_path text not null,
  sort_order int not null default 0
);

-- CART ITEMS
create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity int not null check (quantity > 0),
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- COUPONS
create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type discount_type not null default 'percentage',
  value numeric(10,2) not null check (value > 0),
  min_order_amount numeric(10,2) default 0,
  max_discount_amount numeric(10,2),
  expiry_date date,
  usage_limit int,
  times_used int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ORDERS
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  coupon_id uuid references coupons(id),
  status order_status not null default 'pending',
  payment_status payment_status not null default 'unpaid',
  payment_method text not null default 'cash_on_delivery',
  shipping_full_name text not null,
  shipping_phone text not null,
  shipping_address text not null,
  shipping_city text not null default 'القاهرة',
  shipping_lat double precision,
  shipping_lng double precision,
  subtotal numeric(10,2) not null,
  discount_amount numeric(10,2) not null default 0,
  shipping_fee numeric(10,2) not null default 0,
  total_price numeric(10,2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ORDER ITEMS
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity int not null check (quantity > 0),
  price_at_purchase numeric(10,2) not null
);

-- REVIEWS
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);

-- LOYALTY POINTS LOG
create table if not exists loyalty_points_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  points int not null,
  source points_source not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);

-- =============================================================================
-- 3. PHASE 2 TABLES (HOME CARE SESSIONS & PROVIDERS MARKETPLACE)
-- =============================================================================

-- PROVIDERS (Freelancers & Beauty Centers)
create table if not exists providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade unique,
  type provider_type not null default 'freelancer',
  status provider_status not null default 'pending',
  display_name text not null,
  bio text,
  specialties text[] default '{}',
  lat double precision,
  lng double precision,
  city text default 'القاهرة',
  rating_avg numeric(3,2) default 5.0,
  rating_count int default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);

-- PROVIDER DOCUMENTS (National ID, Certificates)
create table if not exists provider_documents (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  doc_type text not null, -- 'national_id' | 'certificate' | 'other'
  title text not null,
  storage_path text not null,
  reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

-- BOOKINGS
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  provider_id uuid references providers(id),
  service_type text not null,
  status booking_status not null default 'requested',
  requested_area text not null,
  customer_phone text,
  scheduled_at timestamptz,
  agreed_price numeric(10,2),
  notes text,
  payment_status payment_status not null default 'unpaid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- BOOKING REVIEWS (Session Reviews & Ratings)
create table if not exists booking_reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  user_id uuid not null references profiles(id),
  provider_id uuid not null references providers(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (booking_id)
);

-- BOOKING REPORTS (Issue reports sent directly to Admin)
create type report_status as enum ('open', 'in_review', 'resolved');

create table if not exists booking_reports (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  reported_by uuid not null references profiles(id),
  description text not null,
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);

-- NOTIFICATIONS (In-app notifications for customer & provider)
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  related_booking_id uuid references bookings(id),
  created_at timestamptz not null default now()
);

-- COMMISSIONS
create table if not exists commissions (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  session_value numeric(10,2) not null,
  commission_rate numeric(5,2) not null default 15.00, -- 15% standard rate
  commission_amount numeric(10,2) not null,
  payout_status payout_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- Trigger: Update provider rating_avg and rating_count automatically on new review
create or replace function update_provider_rating()
returns trigger language plpgsql as $$
begin
  update providers
  set
    rating_avg = coalesce((select avg(rating) from booking_reviews where provider_id = new.provider_id), 5.0),
    rating_count = (select count(*) from booking_reviews where provider_id = new.provider_id)
  where id = new.provider_id;
  return new;
end;
$$;

drop trigger if exists trg_update_provider_rating on booking_reviews;
create trigger trg_update_provider_rating
after insert or update on booking_reviews
for each row execute function update_provider_rating();


-- =============================================================================
-- 4. PHASE 3 TABLES (BEAUTY CENTERS DIRECTORY & REFERRAL TRACKING)
-- =============================================================================

-- CENTER SERVICES (Offered by beauty centers with price ranges)
create table if not exists center_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  service_name text not null,
  description text,
  price_from numeric(10,2),
  price_to numeric(10,2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- REFERRAL CODES (Unique per center with commission rate)
create table if not exists referral_codes (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references providers(id) on delete cascade,
  code text not null unique,
  discount_description text,
  commission_rate numeric(5,2) not null default 10.00, -- e.g. 10%
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- REFERRAL REDEMPTIONS (Tracking customer claims & center confirmations)
create type redemption_status as enum ('claimed', 'confirmed_by_center', 'rejected', 'paid_out');

create table if not exists referral_redemptions (
  id uuid primary key default gen_random_uuid(),
  referral_code_id uuid not null references referral_codes(id) on delete cascade,
  user_id uuid not null references profiles(id),
  provider_id uuid not null references providers(id),
  status redemption_status not null default 'claimed',
  estimated_value numeric(10,2),
  commission_amount numeric(10,2),
  notes text,
  claimed_at timestamptz not null default now(),
  confirmed_at timestamptz
);

-- Trigger: Calculate referral commission automatically upon center confirmation
create or replace function calculate_referral_commission()
returns trigger language plpgsql as $$
declare
  v_rate numeric;
begin
  if new.status = 'confirmed_by_center' and (old.status is distinct from 'confirmed_by_center') then
    select commission_rate into v_rate from referral_codes where id = new.referral_code_id;
    new.commission_amount := coalesce(new.estimated_value, 0) * (coalesce(v_rate, 10.00) / 100);
    new.confirmed_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_calculate_referral_commission on referral_redemptions;
create trigger trg_calculate_referral_commission
before update on referral_redemptions
for each row execute function calculate_referral_commission();

create or replace function suggest_providers_for_booking(
  p_service_type text,
  p_lat double precision,
  p_lng double precision,
  p_max_distance_km numeric default 25
)
returns table (
  provider_id uuid,
  display_name text,
  rating_avg numeric,
  distance_km numeric
)
language sql stable as $$
  select id, display_name, rating_avg, distance_km
  from (
    select
      p.id,
      p.display_name,
      p.rating_avg,
      (6371 * acos(
        cos(radians(p_lat)) * cos(radians(p.lat)) *
        cos(radians(p.lng) - radians(p_lng)) +
        sin(radians(p_lat)) * sin(radians(p.lat))
      )) as distance_km
    from providers p
    where p.status in ('verified', 'trusted')
      and p_service_type = any(p.specialties)
  ) candidates
  where distance_km <= p_max_distance_km
  order by rating_avg desc, distance_km asc
  limit 10;
$$;

-- =============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table cart_items enable row level security;
alter table coupons enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table loyalty_points_log enable row level security;
alter table providers enable row level security;
alter table bookings enable row level security;
alter table commissions enable row level security;

-- Profiles: Users see/edit own profile, admins can read all
create policy "profiles_select_own" on profiles for select using (
  auth.uid() = id or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

-- Categories & Products: Public Read, Admin Write
create policy "categories_read_public" on categories for select using (true);
create policy "categories_admin_all" on categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "products_read_public" on products for select using (true);
create policy "products_admin_all" on products for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "product_images_read_public" on product_images for select using (true);
create policy "product_images_admin_all" on product_images for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Cart: User only
create policy "cart_items_all_own" on cart_items for all using (auth.uid() = user_id);

-- Coupons: Public read active coupons, admin manage
create policy "coupons_read_active" on coupons for select using (is_active = true);
create policy "coupons_admin_all" on coupons for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Orders & Order Items
create policy "orders_select_own_or_admin" on orders for select using (
  auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "orders_insert_own" on orders for insert with check (auth.uid() = user_id);
create policy "orders_admin_update" on orders for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

create policy "order_items_select" on order_items for select using (
  exists (select 1 from orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin')))
);
create policy "order_items_insert" on order_items for insert with check (
  exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid())
);

-- Reviews: Public Read, Authenticated Insert
create policy "reviews_read_public" on reviews for select using (true);
create policy "reviews_insert_own" on reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update_own" on reviews for update using (auth.uid() = user_id);

-- Loyalty Points Log
create policy "loyalty_log_select_own" on loyalty_points_log for select using (
  auth.uid() = user_id or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Storage Buckets Setup Note:
-- Bucket 'product-images' (public)
-- Bucket 'provider-documents' (private, admin only)
