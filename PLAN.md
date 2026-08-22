# 📋 خطة تنفيذ ومتابعة مشروع منصة العناية بالشعر والبشرة (Store + Home Sessions + Centers Directory)

> **الحالة العامة**: 🚀 قيد التشغيل والتطوير المستمر  
> **الستاك**: Angular 22 (Standalone + Signals) + Supabase (PostgreSQL, Auth, RLS, Storage)  
> **المراحل المكتملة**:
> 1. 🟢 المرحلة الأولى: المتجر الإلكتروني لمنتجات العناية الأصلية
> 2. 🟢 المرحلة الثانية: سوق الجلسات المنزلية والفريلانسرز (On-demand Home Care)
> 3. 🟢 المرحلة الثالثة: دليل المراكز الشريكة وتتبع أكواد الإحالة والخصم (Beauty Centers Directory & Referral Tracking)

---

## 🎯 الأهداف المحققة في المنصة المتكاملة

1. **المتجر الإلكتروني (E-Commerce Store - Phase 1)**:
   - كتالوج منتجات متكامل مع البحث والفلترة حسب الأقسام ونوع البشرة والشعر.
   - سلة شراء تفاعلية (Cart Drawer) وشريط الشحن المجاني وأكواد الخصم.
   - تدفق إتمام الطلب والدفع مع تسجيل نقاط الولاء (Loyalty Points).

2. **سوق الخدمات والجلسات المنزلية (Home Care Marketplace - Phase 2)**:
   - طلب جلسات منزلية (بروتين وترميم شعر، هيدرافيشال، فيلر، بكجات عرايس).
   - طابور الترشيح والمطابقة الذكية للأدمن بناءً على المسافة الجغرافية بالكيلومتر والتقييم والتخصص.
   - دورة حياة الحجز كاملة (`requested ➔ offered ➔ confirmed ➔ in_progress ➔ completed`).
   - بوابة الأخصائيات والفريلانسرز (`/provider`) لإدارة الجلسات والأرباح واحتساب عمولة المنصة (15%).

3. **دليل المراكز الشريكة ونظام تتبع الإحالات (Beauty Centers Directory - Phase 3)**:
   - **دليل المراكز (`/centers`)**: استعراض الصالونات والسبا المعتمدة بالقرب من العميلة (التجمع، المعادي، الشيخ زايد، بني سويف) مع فلاتر الخدمات وساعات العمل.
   - **بروفايل المركز وقائمة الخدمات (`/centers/:id`)**: معرض الصور، تفاصيل الخدمات ونطاقات الأسعار، وزر الحصول على كود الخصم الحصري (e.g. `LETOILE15`).
   - **صفحة أكوادي وإحالاتي (`/centers/my-codes`)**: استعراض الأكواد الصادرة للعميلة وإبرازها للمركز.
   - **بوابة المركز الشريك (`/center`)**: تأكيد/رفض استخدام الكود وإدخال قيمة الخدمة لاحتساب عمولة المنصة آلياً عبر الـ Trigger، وإدارة الخدمات والأسعار.
   - **لوحة تحكم الإدارة (`/admin`)**: متابعة وتدقيق الإحالات المعلقة (`claimed`) وعمولات المنصة والتسويات المالية.

---

## 📊 مسار المهام والإنجاز (Milestones & Tasks)

### 🟢 المرحلة 1: تهيئة المشروع وبيئة العمل
- [x] إعداد مستودع Git وربط الـ Remote.
- [x] تهيئة مشروع Angular 22 (Standalone Components + SCSS + Routing).
- [x] تثبيت مكتبة `@supabase/supabase-js`.
- [x] إنشاء ملف `PLAN.md` وملف `README.md`.
- [x] إنشاء ملف `supabase/schema.sql` بكامل الجداول والـ Enums و RLS.

### 🟢 المرحلة 2: البنية التحتية والربط مع Supabase (Core Architecture)
- [x] إعداد ملفات البيئة `environment.ts` و `environment.development.ts`.
- [x] إنشاء `SupabaseService` كـ Client رئيسي مع fallback آمن للتطوير.
- [x] إنشاء `AuthService` مع إدارة الحالة عبر Signals ومفتاح التبديل الرباعي السريع (عميلة / أخصائية / مركز شريك / أدمن).
- [x] إنشاء الـ Models والـ Types لجميع الكيانات (Store + Phase 2 Bookings + Phase 3 Centers & Referrals).
- [x] إنشاء الـ Guards (`authGuard`, `adminGuard`).
- [x] إنشاء الـ Mock Data الغنية للمنتجات والجلسات والمراكز والأخصائيات المعتمدات في مصر.

### 🟢 المرحلة 3: نظام التصميم والمكونات المشتركة (Design System & UI Components)
- [x] ضبط نظام الألوان (Rose gold / Warm neutrals / Emerald accents / Dark-Light theme).
- [x] خطوط عربية فاخرة (Cairo / Plus Jakarta Sans) ودعم RTL كامل.
- [x] مكونات UI المشتركة (Navbar, Footer, ProductCard, CartDrawer).

### 🟢 المرحلة 4: خدمات المتجر وإدارة الحالة (Store Services with Signals)
- [x] `ProductsService`, `CartService`, `CouponsService`, `OrdersService`.

### 🟢 المرحلة 5: صفحات المتجر للعملاء (Customer Storefront Pages)
- [x] **HomeComponent**, **CatalogComponent**, **ProductDetailsComponent**, **CheckoutComponent**.

### 🟢 المرحلة 6: لوحة تحكم الإدارة المركزية (Admin Dashboard)
- [x] لوحة الإحصائيات (Overview Analytics): مبيعات المتجر، طلبات الجلسات، المراكز الشريكة، عمولات المنصة.
- [x] إدارة المنتجات، الطلبات، والكوبونات.
- [x] طابور الترشيح والمطابقة الذكية للجلسات المنزلية.
- [x] شاشة متابعة وتدقيق إحالات المراكز وتنبيهات التدقيق (Audit Alerts) وتسجيل التحصيل.

### 🟢 المرحلة 7: حساب العميل وتاريخ الطلبات ونقاط الولاء
- [x] الملف الشخصي، تتبع الطلبات، ومحفظة نقاط الولاء.

### 🟢 المرحلة 8: سوق الجلسات المنزلية وبوابة الفريلانسرز (Phase 2 - Home Care Sessions)
- [x] صفحة طلب الجلسة المنزلية (`/booking/request`).
- [x] صفحة متابعة الجلسات وتأكيد العرض والتقييم (`/booking/my-bookings`).
- [x] بوابة الأخصائيات والفريلانسرز ومتابعة الأرباح (`/provider`).

### 🟢 المرحلة 9: دليل المراكز الشريكة وبوابة المركز وتتبع الإحالات (Phase 3 - Centers Directory)
- [x] **دليل المراكز والبحث الجغرافي (`/centers`)**: فلاتر المحافظات ونوع العناية والبحث اللحظي.
- [x] **بروفايل المركز الشريك (`/centers/:id`)**: معرض الصور، قائمة الخدمات والأسعار، واستخراج كود الخصم.
- [x] **صفحة أكوادي وإحالاتي (`/centers/my-codes`)**: استعراض الأكواد الصادرة للعميلة ومشاركتها مع المركز.
- [x] **بوابة المركز الشريك (`/center`)**:
  - تأكيد استخدام الكود وإدخال قيمة الفاتورة أو الرفض.
  - إدارة الخدمات وقوائم الأسعار التقديرية.
  - كشف حساب العمولات وسجل التحويلات المالية.
- [x] **قاعدة البيانات (`supabase/schema.sql`)**:
  - جداول `center_services`, `referral_codes`, `referral_redemptions`.
  - تريجر `calculate_referral_commission` لحساب العمولة آلياً عند التأكيد.
  - سياسات RLS الكاملة.

---

## 📝 سجل الـ Commits المنجزة
- `fe88cb5`: `feat: initial store setup with Angular 22 standalone, Supabase integration, luxury UI and admin dashboard`
- `b916fba`: `docs: update PLAN.md with completed store MVP milestones and budget optimization`
- `f360f67`: `feat(phase2): implement home care sessions marketplace, specialist portal, matching queue, and booking lifecycle`
- `feat(phase3): implement partner beauty centers directory, referral discount codes, center portal and commission tracking`
