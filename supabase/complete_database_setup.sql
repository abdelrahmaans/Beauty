-- =============================================================================
-- منصة بيوتي (BEAUTY PLATFORM) - الإعداد الشامل لقاعدة البيانات وحل مشاكل الـ CRUD
-- انسخ هذا الكود بالكامل ونفذه في: Supabase Dashboard -> SQL Editor -> Run
-- =============================================================================

-- =============================================================================
-- الخطوة 1: إضافة وتوسيع جميع الأعمدة في جداول قاعدة البيانات لتطابق الفرونت إند
-- =============================================================================

-- 1. ترقية جدول التصنيفات (categories)
ALTER TABLE IF EXISTS categories ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE IF EXISTS categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE IF EXISTS categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
ALTER TABLE IF EXISTS categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. ترقية جدول المنتجات (products)
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS ingredients TEXT;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS how_to_use TEXT;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS rating_avg NUMERIC(3,2) DEFAULT 5.0;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 0;
ALTER TABLE IF EXISTS products ADD COLUMN IF NOT EXISTS main_image TEXT;

-- 3. ترقية جدول مقدمي الخدمة والمراكز (providers)
ALTER TABLE IF EXISTS providers ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE IF EXISTS providers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE IF EXISTS providers ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'القاهرة';
ALTER TABLE IF EXISTS providers ADD COLUMN IF NOT EXISTS address_line TEXT;
ALTER TABLE IF EXISTS providers ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT true;
ALTER TABLE IF EXISTS providers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE IF EXISTS providers ADD COLUMN IF NOT EXISTS opening_hours TEXT;

-- 4. ترقية جدول أكواد الإحالة (referral_codes)
ALTER TABLE IF EXISTS referral_codes ADD COLUMN IF NOT EXISTS discount_description TEXT;
ALTER TABLE IF EXISTS referral_codes ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC(5,2);

-- 5. ترقية جدول الكوبونات (coupons)
ALTER TABLE IF EXISTS coupons ADD COLUMN IF NOT EXISTS min_order_amount NUMERIC(10,2) DEFAULT 0;
ALTER TABLE IF EXISTS coupons ADD COLUMN IF NOT EXISTS max_discount_amount NUMERIC(10,2);
ALTER TABLE IF EXISTS coupons ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- 6. ترقية جدول خدمات المركز (center_services)
ALTER TABLE IF EXISTS center_services ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE IF EXISTS center_services ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'hair';

-- 6. ترقية وتوسيع جدول الطلبات (orders)
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS shipping_full_name TEXT;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS shipping_city TEXT DEFAULT 'القاهرة';
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(10,2) DEFAULT 0;
ALTER TABLE IF EXISTS orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 7. ترقية جدول المستخدمين (profiles)
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'القاهرة';
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS address_line TEXT;
ALTER TABLE IF EXISTS profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- =============================================================================
-- الخطوة 2: دالة التحقق من صلاحيات الأدمن (Security Definer)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- =============================================================================
-- الخطوة 3: إنشاء الجداول الجديدة غير الموجودة (Banners & Payment Proofs)
-- =============================================================================

-- جدول البانرات الإعلانية (banners)
CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'announcement',
  placement text NOT NULL DEFAULT 'homepage',
  title text NOT NULL,
  subtitle text,
  image_storage_path text NOT NULL,
  cta_text text,
  cta_link text,
  coupon_id uuid REFERENCES coupons(id) ON DELETE SET NULL,
  center_id uuid REFERENCES providers(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  start_at timestamptz,
  end_at timestamptz,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "banners_select_public" ON public.banners;
CREATE POLICY "banners_select_public" ON public.banners FOR SELECT USING (true);
DROP POLICY IF EXISTS "banners_admin_all" ON public.banners;
CREATE POLICY "banners_admin_all" ON public.banners FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- جدول إثباتات الدفع اليدوي (payment_proofs)
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_type text NOT NULL, -- 'order' | 'booking'
  reference_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel text NOT NULL, -- 'instapay' | 'vodafone_cash' | 'bank_transfer'
  sender_name text,
  amount_claimed numeric(10,2) NOT NULL,
  receipt_storage_path text NOT NULL,
  status text NOT NULL DEFAULT 'pending_review', -- 'pending_review' | 'approved' | 'rejected'
  admin_note text,
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_proofs_select" ON public.payment_proofs;
CREATE POLICY "payment_proofs_select" ON public.payment_proofs FOR SELECT USING (
  auth.uid() = user_id OR public.is_admin()
);
DROP POLICY IF EXISTS "payment_proofs_insert" ON public.payment_proofs;
CREATE POLICY "payment_proofs_insert" ON public.payment_proofs FOR INSERT WITH CHECK (
  auth.uid() = user_id OR public.is_admin()
);
DROP POLICY IF EXISTS "payment_proofs_update" ON public.payment_proofs;
CREATE POLICY "payment_proofs_update" ON public.payment_proofs FOR UPDATE USING (
  public.is_admin()
);

-- =============================================================================
-- الخطوة 4: إصلاح سياسات الـ CRUD للجداول الأساسية
-- =============================================================================
DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;
CREATE POLICY "categories_admin_all" ON public.categories FOR ALL 
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "products_admin_all" ON public.products;
CREATE POLICY "products_admin_all" ON public.products FOR ALL 
USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "providers_admin_all" ON public.providers;
CREATE POLICY "providers_admin_all" ON public.providers FOR ALL 
USING (auth.uid() = user_id OR public.is_admin()) WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "center_services_all" ON public.center_services;
CREATE POLICY "center_services_all" ON public.center_services FOR ALL 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "referral_codes_all" ON public.referral_codes;
CREATE POLICY "referral_codes_all" ON public.referral_codes FOR ALL 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "referral_redemptions_all" ON public.referral_redemptions;
CREATE POLICY "referral_redemptions_all" ON public.referral_redemptions FOR ALL 
USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "bookings_all_access" ON public.bookings;
CREATE POLICY "bookings_all_access" ON public.bookings FOR ALL 
USING (
  auth.uid() = user_id 
  OR public.is_admin() 
  OR EXISTS (SELECT 1 FROM providers WHERE providers.id = bookings.provider_id AND providers.user_id = auth.uid())
) WITH CHECK (true);

-- =============================================================================
-- الخطوة 5: إدخال البيانات الحية (Seed Data) لتسميع المتجر والداشبورد مباشرة
-- =============================================================================

-- أ) التصنيفات
INSERT INTO public.categories (id, name, name_en, slug, description, image_url, sort_order, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'العناية بالشعر', 'Hair Care', 'hair-care', 'شامبوهات وسيرومات وترميم الشعر التالف', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80', 1, true),
  ('11111111-1111-1111-1111-111111111102', 'العناية بالبشرة', 'Skin Care', 'skin-care', 'غسول للبشرة وسيروم فيتامين سي ونضارة', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80', 2, true),
  ('11111111-1111-1111-1111-111111111103', 'الترطيب وحماية الشمس', 'Moisturizers & Sun Protection', 'moisturizers-sunscreen', 'صن بلوك واسع المدى ومرطبات مكثفة', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 3, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  image_url = EXCLUDED.image_url;

-- ب) المنتجات
INSERT INTO public.products (id, category_id, name, name_en, slug, description, brand, price, discount_price, stock_quantity, sku, is_active, is_featured, rating_avg, reviews_count, main_image)
VALUES
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'سيروم الأرجان والكيراتين لترميم الشعر التالف', 'Pure Argan & Keratin Restorative Hair Serum', 'argan-keratin-hair-serum', 'علاج تقصف وهيشان الشعر وحمايته من الحرارة اليومية مع تغذية الجذور بعمق.', 'RoseÉlixir Botanicals', 480.00, 390.00, 45, 'BEA-HAIR-001', true, true, 4.9, 38, 'https://images.unsplash.com/photo-1608248597359-53e7787f7d45?auto=format&fit=crop&w=800&q=80'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'سيروم فيتامين C المركز بنسبة 15% مع الهيالورونيك', 'Radiance Boost 15% Vitamin C + Hyaluronic Serum', 'vitamin-c-hyaluronic-serum', 'يمنح البشرة إشراقة فورية، يوحد اللون، ويعزز الكولاجين الطبيعي لنضارة فائقة.', 'Lumière Glow Skin', 550.00, 460.00, 30, 'BEA-SKIN-002', true, true, 4.8, 52, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101', 'شامبو الميزوثيرابي وإكليل الجبل لتحفيز نمو الشعر', 'Rosemary & Biotin Anti-Hair Loss Shampoo', 'rosemary-biotin-shampoo', 'شامبو طبيعي خالٍ تماماً من السلفات، معزز بخلاصة الروزماري والبيوتين لوقف التساقط.', 'Botanica Herbals', 340.00, 290.00, 60, 'BEA-HAIR-003', true, true, 4.7, 29, 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  stock_quantity = EXCLUDED.stock_quantity;

-- ج) كوبونات الخصم
INSERT INTO public.coupons (id, code, discount_type, value, min_order_amount, is_active)
VALUES
  ('33333333-3333-3333-3333-333333333301', 'BEAUTY10', 'percentage', 10, 300, true),
  ('33333333-3333-3333-3333-333333333302', 'GLOW50', 'fixed', 50, 500, true)
ON CONFLICT (id) DO NOTHING;

-- د) تحديث بيانات مركز التجميل الشريك والأخصائية المعتمدة
UPDATE public.providers
SET
  display_name = 'L’Étoile Beauty & Spa Lounge',
  phone = '01055667788',
  city = 'التجمع الخامس، القاهرة الجديدة',
  address_line = 'ميدان داون تاون، شارع التسعين الجنوبي',
  lat = 30.0194,
  lng = 31.4385,
  rating_avg = 4.96,
  rating_count = 142,
  is_available = true,
  avatar_url = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80',
  bio = 'وجهة الجمال والسبا الفاخرة في القاهرة الجديدة مع نخبة من خبيرات التجميل المعتمدات.',
  specialties = array['علاجات الشعر والبروتين', 'جلسات تنظيف وبشرة زجاجية', 'حمام مغربي وسبا']
WHERE id = 'b7daf8cf-1d5e-45ce-bb4f-137fbdf51fb8' OR user_id = '568d3382-67d0-48bc-a616-1a5ce2e89290';

UPDATE public.providers
SET
  display_name = 'خبير التجميل سارة إبراهيم',
  phone = '01122334455',
  city = 'القاهرة الجديدة، التجمع الخامس',
  address_line = 'التجمع الخامس',
  lat = 30.0263,
  lng = 31.4967,
  rating_avg = 4.95,
  rating_count = 87,
  is_available = true,
  avatar_url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
  bio = 'أخصائية معتمدة في جلسات ترميم الشعر، المعالجات الملكية، وتنظيف البشرة العميق.',
  specialties = array['علاجات الشعر والبروتين', 'جلسات تنظيف وبشرة زجاجية']
WHERE id = 'c1ab26dc-33dd-452b-b1d3-89e959033175' OR user_id = '093a1f80-58f2-4ae8-a2be-db7891753aa4';

INSERT INTO public.referral_codes (id, provider_id, code, discount_description, discount_percentage, commission_rate, is_active)
VALUES
  ('55555555-5555-5555-5555-555555555501', 'b7daf8cf-1d5e-45ce-bb4f-137fbdf51fb8', 'LETOILE15', 'خصم حصري 15% على جميع خدمات السبا والشعر', 15, 10, true)
ON CONFLICT (id) DO UPDATE SET
  code = EXCLUDED.code,
  provider_id = EXCLUDED.provider_id;

INSERT INTO public.center_services (id, provider_id, service_name, description, price_from, price_to, is_active, category)
VALUES
  ('66666666-6666-6666-6666-666666666601', 'b7daf8cf-1d5e-45ce-bb4f-137fbdf51fb8', 'جلسة البروتين والكافيار الملكي لفرد وترميم الشعر', 'فحص إلكتروني للشعر وجلسة علاجية بمواد أصلية خالية من الفورمالين.', 1400, 2200, true, 'hair'),
  ('66666666-6666-6666-6666-666666666602', 'b7daf8cf-1d5e-45ce-bb4f-137fbdf51fb8', 'جلسة الهيدرافيشل لتنظيف ونضارة البشرة الزجاجية', 'تنظيف مسام عميق وإزالة الرؤوس السوداء مع سيروم الكولاجين.', 850, 1500, true, 'skin')
ON CONFLICT (id) DO NOTHING;

-- هـ) البانر الإعلاني الرئيسي
INSERT INTO public.banners (id, type, placement, title, subtitle, image_storage_path, cta_text, cta_link, is_active, sort_order)
VALUES
  ('77777777-7777-7777-7777-777777777701', 'announcement', 'homepage', 'عالم الجمال والعناية المتكاملة', 'مستحضرات أصلية 100% وجلسات عناية منزلية بأيدي أمهر المتخصصات', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80', 'تسوقي بالخصم الآن', '/products', true, 1)
ON CONFLICT (id) DO NOTHING;
