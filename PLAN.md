# 📋 خطة تنفيذ ومتابعة مشروع منصة العناية بالشعر والبشرة (Store + Home Sessions + Centers + Banners + Mobile + Manual Payments + Real Auth)

> **الحالة العامة**: 🚀 قيد التشغيل والتطوير المستمر  
> **الستاك**: Angular 22 (Standalone + Signals) + Supabase (PostgreSQL, Auth, RLS, Storage)  
> **المراحل المكتملة**:
> 1. 🟢 المرحلة الأولى: المتجر الإلكتروني لمنتجات العناية الأصلية
> 2. 🟢 المرحلة الثانية: سوق الجلسات المنزلية والفريلانسرز (On-demand Home Care)
> 3. 🟢 المرحلة الثالثة: دليل المراكز الشريكة وتتبع أكواد الإحالة والخصم (Beauty Centers Directory & Referral Tracking)
> 4. 🟢 المرحلة الرابعة: البانرات الترويجية وتجاوب الجوال المتكامل (Promotional Banners & Mobile Drawer)
> 5. 🟢 المرحلة الخامسة: منظومة الدفع اليدوي المجاني وإثباتات التحويل (Manual Payment Proof System)
> 6. 🟢 المرحلة السادسة: التوثيق الحقيقي والتوجيه حسب الرول واستعادة كلمة المرور (Real Supabase Auth & Role Routing)

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
   - **سلايدر البانرات في الصفحة الرئيسية (`homepage-banners`)**: كاروسيل أوتوماتيكي متجاوب (تم تعطيله مؤقتاً بالـ Comment Out بطلب المستخدم مع الحفاظ على الكود كاملاً).
   - **قائمة الموبايل الجانبية الفاخرة (Mobile Navigation Drawer)**: زر هامبرغر متجاوب يفتح قائمة جانبية منزلقة تضم بروفايل المستخدم، رصيد نقاط الولاء، بحث الجوال السريع، وروابط كافة الخدمات وبوابات الشركاء.

5. **منظومة الدفع اليدوي المجاني وإثباتات التحويل (Phase 5 - Manual Payment Proof System)**:
   - **قنوات تحويل مصرية معتمدة**: InstaPay، محفظة فودافون كاش، وحساب بنك CIB مع أزرار نسخ فورية لأرقام الحسابات.
   - **مكون رفع الإثبات المشترك (`UploadPaymentProofComponent`)**: حقول القناة واسم المحوّل والمبلغ المطلوب وصورة الإيصال مع المعاينة الحية.
   - **تكامل المتجر والحجوزات**: مدمج بالـ Checkout للمتجر، وبمودال مراجعة عروض الجلسات المنزلية (`my-bookings`).
   - **طابور مراجعة المدفوعات للأدمن (`/admin`)**: شاشة تفاعلية لمراجعة صور الإيصالات وتكبيرها، واعتماد الدفع فوراً أو الرفض مع ذكر السبب وإشعار العميلة.

6. **التوثيق الحقيقي والتوجيه حسب الرول (Phase 6 - Real Supabase Auth & Role Routing)**:
   - **إلغاء شريط التبديل التجريبي القديم**: تم استبدال المحاكاة بنظام جلسات حقيقي عبر Supabase Auth في الناف بار وقائمة الموبايل.
   - **دالة قاعدة البيانات المركزية (`get_my_dashboard_context()`)**: ترجع نوع العرض (`admin`, `provider`, `center`, `customer`) وحالة التوثيق (`pending`, `verified`, `trusted`).
   - **تسجيل العميلة المباشر (`/signup`)**: مخصص للعميلات فقط مع إضافة 50 نقطة ولاء ترحيبية.
   - **استمارات انضمام الشركاء المستقلين والمراكز الشريكة**:
     - للأخصائيات (`/apply/provider`): تسجيل التخصصات وسابقة الأعمال ونطاق التغطية وتنشئ حسابهن بحالة `pending`.
     - للمراكز الشريكة (`/apply/center`): تسجيل اسم المركز والعنوان ونسبة الخصم المقترحة وساعات العمل وتنشئ حسابهن بحالة `pending`.
   - **صفحة الحساب قيد المراجعة (`/pending-review`)**: توجه الحسابات المعلقة تلقائياً وتتيح التواصل مع الدعم أو تسجيل الخروج.
   - **استعادة كلمة المرور (`/forgot-password`)**: إرسال رابط آمن عبر البريد الإلكتروني لإعادة التعيين.
   - **الحراسة والتوجيه التلقائي (`roleGuard`)**: حماية كافة البوابات وتوجيه كل رول لبوابته المخصصة ومنع الوصول غير المصرح به.
   - **بيانات الديمو والتنظيف**:
     - `supabase/seed.sql`: سكريبت لتغذية Supabase بالبيانات التجريبية الحية.
     - `supabase/cleanup.sql`: سكريبت لتفريغ وتنظيف بيانات الديمو قبل الإطلاق الرسمي.
     - ضبط بيئة العمل `enableMockFallback: false`.

---

## 📝 سجل الـ Commits المنجزة
- `fe88cb5`: `feat: initial store setup with Angular 22 standalone, Supabase integration, luxury UI and admin dashboard`
- `b916fba`: `docs: update PLAN.md with completed store MVP milestones and budget optimization`
- `f360f67`: `feat(phase2): implement home care sessions marketplace, specialist portal, matching queue, and booking lifecycle`
- `82b210f`: `feat(phase3): implement partner beauty centers directory, referral discount codes, center portal and commission tracking`
- `60bc36e`: `feat(banners-mobile): implement promotional banners carousel, admin management, and responsive mobile drawer`
- `aa42390`: `feat(payments): implement manual payment proof system for store and home bookings with admin review queue`
- `feat(auth): implement real Supabase auth, role-based routing, customer signup, partner onboarding, password reset and seed/cleanup scripts`
