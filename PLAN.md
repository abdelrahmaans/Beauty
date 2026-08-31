# 📋 خطة تنفيذ ومتابعة مشروع منصة العناية بالشعر والبشرة (Store + Home Sessions + Centers + Banners + Mobile + Manual Payments)

> **الحالة العامة**: 🚀 قيد التشغيل والتطوير المستمر  
> **الستاك**: Angular 22 (Standalone + Signals) + Supabase (PostgreSQL, Auth, RLS, Storage)  
> **المراحل المكتملة**:
> 1. 🟢 المرحلة الأولى: المتجر الإلكتروني لمنتجات العناية الأصلية
> 2. 🟢 المرحلة الثانية: سوق الجلسات المنزلية والفريلانسرز (On-demand Home Care)
> 3. 🟢 المرحلة الثالثة: دليل المراكز الشريكة وتتبع أكواد الإحالة والخصم (Beauty Centers Directory & Referral Tracking)
> 4. 🟢 المرحلة الرابعة: البانرات الترويجية وتجاوب الجوال المتكامل (Promotional Banners & Mobile Drawer)
> 5. 🟢 المرحلة الخامسة: منظومة الدفع اليدوي المجاني وإثباتات التحويل (Manual Payment Proof System)

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
   - **دليل المراكز (`/centers`)**: استعراض الصالونات والسبا المعتمدة بالقرب من العميلة مع فلاتر الخدمات وساعات العمل.
   - **بروفايل المركز وقائمة الخدمات (`/centers/:id`)**: معرض الصور، تفاصيل الخدمات ونطاقات الأسعار، وزر الحصول على كود الخصم الحصري (e.g. `LETOILE15`).
   - **صفحة أكوادي وإحالاتي (`/centers/my-codes`)**: استعراض الأكواد الصادرة للعميلة وإبرازها للمركز.
   - **بوابة المركز الشريك (`/center`)**: تأكيد/رفض استخدام الكود وإدخال قيمة الخدمة لاحتساب عمولة المنصة آلياً عبر الـ Trigger، وإدارة الخدمات والأسعار.
   - **لوحة تحكم الإدارة (`/admin`)**: متابعة وتدقيق الإحالات المعلقة (`claimed`) وعمولات المنصة والتسويات المالية.

4. **البانرات الترويجية وقائمة الموبايل المتجاوبة (Phase 4 - Banners & Mobile Responsive)**:
   - **سلايدر البانرات في الصفحة الرئيسية (`homepage-banners`)**: كاروسيل أوتوماتيكي متجاوب بنوعين (كوبونات خصم تتيح النسخ والتطبيق الفوري + إعلانات وفعاليات موجهة).
   - **قائمة الموبايل الجانبية الفاخرة (Mobile Navigation Drawer)**: زر هامبرغر متجاوب يفتح قائمة جانبية منزلقة تضم بروفايل المستخدم، رصيد نقاط الولاء، بحث الجوال السريع، روابط كافة الخدمات، ومحول الأدوار السريع.
   - **إدارة البانرات في لوحة الأدمن (`/admin`)**: استعراض البانرات، زر تفعيل/تعطيل لحظي، ومودال إضافة وتعديل البانر وربطه بالكوبونات وتحديد فترة سريانه.

5. **منظومة الدفع اليدوي المجاني وإثباتات التحويل (Phase 5 - Manual Payment Proof System)**:
   - **قنوات تحويل مصرية معتمدة**: InstaPay، محفظة فودافون كاش، وحساب بنك CIB مع أزرار نسخ فورية لأرقام الحسابات.
   - **مكون رفع الإثبات المشترك (`UploadPaymentProofComponent`)**: حقول القناة واسم المحوّل والمبلغ المطلوب وصورة الإيصال مع المعاينة الحية.
   - **تكامل المتجر والحجوزات**: مدمج بالـ Checkout للمتجر، وبمودال مراجعة عروض الجلسات المنزلية (`my-bookings`).
   - **طابور مراجعة المدفوعات للأدمن (`/admin/payments`)**: شاشة تفاعلية لمراجعة صور الإيصالات وتكبيرها، واعتماد الدفع فوراً أو الرفض مع ذكر السبب وإشعار العميلة.
   - **تريجر قاعدة البيانات (`apply_payment_approval`)**: تحديث حالة الطلبات والحجوزات آلياً فور موافقة الأدمن.

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
- [x] إنشاء الـ Models والـ Types لجميع الكيانات (Store + Phase 2 Bookings + Phase 3 Centers + Phase 4 Banners + Phase 5 Payments).
- [x] إنشاء الـ Guards (`authGuard`, `adminGuard`).
- [x] إنشاء الـ Mock Data الغنية للمنتجات والجلسات والمراكز والبانرات الترويجية وقنوات الدفع.

### 🟢 المرحلة 3: نظام التصميم والمكونات المشتركة (Design System & UI Components)
- [x] ضبط نظام الألوان (Rose gold / Warm neutrals / Emerald accents / Dark-Light theme).
- [x] خطوط عربية فاخرة (Cairo / Plus Jakarta Sans) ودعم RTL كامل.
- [x] مكونات UI المشتركة (Navbar, Footer, ProductCard, CartDrawer).
- [x] قائمة الموبايل المنزلقة (Mobile Drawer) وزر الهامبرغر المتجاوب.

### 🟢 المرحلة 4: خدمات المتجر وإدارة الحالة (Store Services with Signals)
- [x] `ProductsService`, `CartService`, `CouponsService`, `OrdersService`, `BannersService`, `PaymentProofsService`.

### 🟢 المرحلة 5: صفحات المتجر للعملاء (Customer Storefront Pages)
- [x] **HomeComponent**, **CatalogComponent**, **ProductDetailsComponent**, **CheckoutComponent**.
- [x] **HomepageBannersComponent** مدمج في الصفحة الرئيسية.
- [x] خيار الدفع بالتحويل المباشر مع رفع إيصال التحويل في الـ Checkout.

### 🟢 المرحلة 6: لوحة تحكم الإدارة المركزية (Admin Dashboard)
- [x] لوحة الإحصائيات (Overview Analytics): مبيعات المتجر، طلبات الجلسات، المراكز الشريكة، عمولات المنصة.
- [x] طابور مراجعة إثباتات الدفع والتحويلات اليدوية (`activeTab === 'payments'`).
- [x] إدارة المنتجات، الطلبات، والكوبونات.
- [x] طابور الترشيح والمطابقة الذكية للجلسات المنزلية.
- [x] شاشة متابعة وتدقيق إحالات المراكز وتنبيهات التدقيق (Audit Alerts) وتسجيل التحصيل.
- [x] شاشة إدارة البانرات الترويجية وتفعيلها/تعطيلها وإضافتها.

### 🟢 المرحلة 7: حساب العميل وتاريخ الطلبات ونقاط الولاء
- [x] الملف الشخصي، تتبع الطلبات مع شارات التحويلات اليدوية، ومحفظة نقاط الولاء.

### 🟢 المرحلة 8: سوق الجلسات المنزلية وبوابة الفريلانسرز (Phase 2 - Home Care Sessions)
- [x] صفحة طلب الجلسة المنزلية (`/booking/request`).
- [x] صفحة متابعة الجلسات وتأكيد العرض والتقييم (`/booking/my-bookings`).
- [x] بوابة الأخصائيات والفريلانسرز ومتابعة الأرباح (`/provider`).

### 🟢 المرحلة 9: دليل المراكز الشريكة وبوابة المركز وتتبع الإحالات (Phase 3 - Centers Directory)
- [x] دليل المراكز والبحث الجغرافي (`/centers`).
- [x] بروفايل المركز الشريك (`/centers/:id`).
- [x] صفحة أكوادي وإحالاتي (`/centers/my-codes`).
- [x] بوابة المركز الشريك (`/center`).

### 🟢 المرحلة 10: البانرات الترويجية والريسبونسيف المتكامل (Phase 4 - Banners & Mobile)
- [x] جدول `banners` والـ View `active_banners` في قاعدة البيانات.
- [x] مكون سلايدر البانرات الترويجي الذكي في الصفحة الرئيسية.
- [x] ناف بار متجاوب 100% مع قائمة منزلقة فاخرة للموبايل والتابلت.

### 🟢 المرحلة 11: منظومة الدفع اليدوي المجاني وإثباتات التحويل (Phase 5 - Manual Payment Proofs)
- [x] جدول `payment_proofs` والتريجر `apply_payment_approval` وسياسات RLS في قاعدة البيانات.
- [x] مكون `UploadPaymentProofComponent` المشترك للمتجر والحجوزات.
- [x] ربط الدفع اليدوي في الـ Checkout وحجوزاتي مع شارات "بانتظار مراجعة التحويل".
- [x] شاشة مراجعة الإيصالات وتكبير الصور واعتماد/رفض التحويلات في لوحة الأدمن.

---

## 📝 سجل الـ Commits المنجزة
- `fe88cb5`: `feat: initial store setup with Angular 22 standalone, Supabase integration, luxury UI and admin dashboard`
- `b916fba`: `docs: update PLAN.md with completed store MVP milestones and budget optimization`
- `f360f67`: `feat(phase2): implement home care sessions marketplace, specialist portal, matching queue, and booking lifecycle`
- `82b210f`: `feat(phase3): implement partner beauty centers directory, referral discount codes, center portal and commission tracking`
- `60bc36e`: `feat(banners-mobile): implement promotional banners carousel, admin management, and responsive mobile drawer`
- `feat(payments): implement manual payment proof system for store and home bookings with admin review queue`
