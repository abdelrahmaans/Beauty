-- =============================================================================
-- BEAUTY PLATFORM: DEMO SEED DATA (CATEGORIES, PRODUCTS, PROVIDERS, CENTERS, ETC.)
-- Execute in Supabase SQL Editor for testing.
-- =============================================================================

-- 1. Insert Categories
insert into categories (id, name, name_en, slug, description, image_url, sort_order, is_active)
values
  ('11111111-1111-1111-1111-111111111101', 'العناية بالشعر', 'Hair Care', 'hair-care', 'شامبوهات وسيرومات وترميم الشعر', 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=600&q=80', 1, true),
  ('11111111-1111-1111-1111-111111111102', 'العناية بالبشرة', 'Skin Care', 'skin-care', 'غسول للبشرة وسيروم فيتامين سي ونضارة', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80', 2, true),
  ('11111111-1111-1111-1111-111111111103', 'الترطيب وحماية الشمس', 'Moisturizers & Sun Protection', 'moisturizers-sunscreen', 'صن بلوك واسع المدى ومرطبات مكثفة', 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80', 3, true)
on conflict (id) do nothing;

-- 2. Insert Products
insert into products (id, category_id, name, name_en, slug, description, brand, price, discount_price, stock_quantity, sku, is_active, is_featured, rating_avg, reviews_count, main_image)
values
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111101', 'سيروم الأرجان والكيراتين لترميم الشعر التالف', 'Pure Argan & Keratin Restorative Hair Serum', 'argan-keratin-hair-serum', 'علاج تقصف وهيشان الشعر وحمايته من الحرارة اليومية.', 'RoseÉlixir Botanicals', 480.00, 390.00, 45, 'BEA-HAIR-001', true, true, 4.9, 38, 'https://images.unsplash.com/photo-1608248597359-53e7787f7d45?auto=format&fit=crop&w=800&q=80'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111102', 'سيروم فيتامين C المركز بنسبة 15% مع الهيالورونيك', 'Radiance Boost 15% Vitamin C + Hyaluronic Serum', 'vitamin-c-hyaluronic-serum', 'يمنح البشرة إشراقة فورية ويوحد لون البشرة.', 'Lumière Glow Skin', 550.00, 460.00, 30, 'BEA-SKIN-002', true, true, 4.8, 52, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111101', 'شامبو الميزوثيرابي وإكليل الجبل لتحفيز نمو الشعر', 'Rosemary & Biotin Anti-Hair Loss Shampoo', 'rosemary-biotin-shampoo', 'شامبو طبيعي خالٍ تماماً من السلفات معزز بالبيوتين.', 'Botanica Herbals', 340.00, 290.00, 60, 'BEA-HAIR-003', true, true, 4.7, 29, 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=800&q=80')
on conflict (id) do nothing;

-- 3. Insert Coupons
insert into coupons (id, code, discount_type, value, min_order_amount, is_active)
values
  ('33333333-3333-3333-3333-333333333301', 'BEAUTY10', 'percentage', 10, 300, true),
  ('33333333-3333-3333-3333-333333333302', 'GLOW50', 'fixed', 50, 500, true)
on conflict (id) do nothing;

-- 4. Demo Partner Center & Services
insert into providers (id, type, status, display_name, phone, city, address_line, lat, lng, rating_avg, rating_count, is_available, avatar_url, bio, specialties)
values
  ('44444444-4444-4444-4444-444444444401', 'center', 'trusted', 'L’Étoile Beauty & Spa Lounge', '01055667788', 'التجمع الخامس، القاهرة الجديدة', 'ميدان داون تاون، شارع التسعين الجنوبي', 30.0194, 31.4385, 4.96, 142, true, 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80', 'وجهة الجمال والسبا الفاخرة في القاهرة الجديدة.', array['علاجات الشعر والبروتين', 'جلسات تنظيف وبشرة زجاجية', 'حمام مغربي وسبا'])
on conflict (id) do nothing;

insert into referral_codes (id, provider_id, code, discount_description, discount_percentage, commission_rate, is_active)
values
  ('55555555-5555-5555-5555-555555555501', '44444444-4444-4444-4444-444444444401', 'LETOILE15', 'خصم حصري 15% على جميع خدمات السبا والشعر', 15, 10, true)
on conflict (id) do nothing;

insert into center_services (id, provider_id, service_name, description, price_from, price_to, is_active, category)
values
  ('66666666-6666-6666-6666-666666666601', '44444444-4444-4444-4444-444444444401', 'جلسة البروتين والكافيار الملكي لفرد وترميم الشعر', 'فحص إلكتروني للشعر وجلسة علاجية بمواد أصلية.', 1400, 2200, true, 'hair')
on conflict (id) do nothing;
