# 📋 خطة تنفيذ ومتابعة مشروع منصة العناية بالشعر والبشرة (Store MVP + Platform)

> **الحالة العامة**: 🚀 قيد التنفيذ  
> **الستاك**: Angular 22 (Standalone + Signals) + Supabase (PostgreSQL, Auth, RLS, Storage)  
> **تاريخ البدء**: 18 أغسطس 2026

---

## 🎯 الأهداف الرئيسية للمرحلة الأولى
1. بناء متجر إلكتروني فائق الجمال والسرعة لمنتجات العناية بالشعر والبشرة (سوق مصري/عربي + RTL).
2. تأسيس قاعدة بيانات Postgres علائقية على Supabase مجهّزة من البداية لاستيعاب **دليل المراكز** و**سوق الخدمات المنزلية** لاحقاً دون كسر الهيكل.
3. معمارية Angular حديثة تعتمد على Standalone Components و Angular Signals.
4. توثيق وحفظ كل خطوة في مستودع Git بـ Atomic Commits.

---

## 📊 مسار المهام والإنجاز (Milestones & Tasks)

### 🟢 المرحلة 1: تهيئة المشروع وبيئة العمل
- [x] إعداد مستودع Git وربط الـ Remote.
- [x] تهيئة مشروع Angular 22 (Standalone Components + SCSS + Routing).
- [x] تثبيت مكتبة `@supabase/supabase-js`.
- [x] إنشاء ملف `PLAN.md` وملف `README.md`.
- [x] إنشاء ملف `supabase/schema.sql` بكامل الجداول والـ Enums و RLS.
- [x] أول Commit تأسيسي للمشروع.

### 🟡 المرحلة 2: البنية التحتية والربط مع Supabase (Core Architecture)
- [ ] إعداد ملفات البيئة `environment.ts` و `environment.development.ts`.
- [ ] إنشاء `SupabaseService` كـ Client رئيسي.
- [ ] إنشاء `AuthService` مع إدارة الحالة عبر Signals (User profile, Role: customer/admin).
- [ ] إنشاء الـ Models والـ Types لجميع الكيانات:
  - `Profile`, `Category`, `Product`, `ProductImage`, `CartItem`, `Order`, `OrderItem`, `Coupon`, `Review`, `Provider`, `Booking`, `LoyaltyPointLog`.
- [ ] إنشاء الـ Guards (`authGuard`, `adminGuard`).
- [ ] إنشاء الـ Mock Data للتطوير السلس والعمل بدون انقطاع حتى قبل إدخال مفاتيح Supabase الحية.
- [ ] Commit: `feat(core): setup supabase connection, auth state, models, and guards`.

### ⚪ المرحلة 3: نظام التصميم والمكونات المشتركة (Design System & UI Components)
- [ ] ضبط نظام الألوان (Rose gold / Warm neutrals / Emerald accents / Dark-Light theme).
- [ ] خطوط عربية فاخرة (Cairo / Plus Jakarta Sans) ودعم RTL كامل.
- [ ] مكونات UI المشتركة:
  - Navbar (لوجو فاخر، تصنيفات، بحث، أيقونة السلة، زر الحساب / الدخول).
  - Footer (روابط سريعة، اشتراك في النشرة، قنوات التواصل، سياسة الشحن).
  - ProductCard (صورة متحركة، بادج الخصم، التقييم، زر الإضافة السريعة للسلة، زر المفضلة).
  - CartDrawer / QuickCart (نافذة جانبية تفاعلية للسلة).
  - RatingStars, Badges, Toast/Notification system.
- [ ] Commit: `feat(shared): luxury beauty design system, navigation, and shared components`.

### ⚪ المرحلة 4: خدمات المتجر وإدارة الحالة (Store Services with Signals)
- [ ] `ProductsService`: جلب المنتجات، الفلترة حسب القسم، السعر، البحث، والترتيب.
- [ ] `CartService`: إدارة السلة عبر Signals مع مزامنة الـ LocalStorage و Supabase `cart_items`.
- [ ] `CouponsService`: التحقق من كود الخصم وتطبيقه.
- [ ] `OrdersService`: إنشاء ومتابعة الطلبات.
- [ ] Commit: `feat(store): products, cart, and orders services`.

### ⚪ المرحلة 5: صفحات المتجر للعملاء (Customer Storefront Pages)
- [ ] **الصفحة الرئيسية (Home)**: Hero Section تفاعلي، أقسام المنتجات الأكثر طلباً، تصنيفات العناية بالشعر والبشرة، قسم نقاط الولاء.
- [ ] **صفحة كتالوج المنتجات (Products Catalog)**: فلاتر متقدمة (السعر، الفئة، التقييم)، بحث لحظي، وفرز.
- [ ] **صفحة تفاصيل المنتج (Product Details)**: سلايدر الصور، الوصف والمكونات، طريقة الاستخدام، التقييمات والمراجعات، منتجات مقترحة.
- [ ] **صفحة إتمام الطلب (Checkout)**: إدخال بيانات الشحن والعنوان، اختيار طريقة الدفع (الدفع عند الاستلام / كارت / محفظة إلكترونية)، تأكيد الطلب.
- [ ] **صفحة تسجيل الدخول / إنشاء حساب (Auth Modal/Page)**: دخول بالبريد، التحقق، وإنشاء حساب جديد.
- [ ] Commit: `feat(views): customer storefront pages and checkout flow`.

### ⚪ المرحلة 6: لوحة تحكم الإدارة (Admin Dashboard)
- [ ] لوحة الإحصائيات (Overview Analytics): إجمالي المبيعات، الطلبات المعلقة، أكثر المنتجات مبيعاً.
- [ ] إدارة المنتجات (Products Management): إضافة، تعديل، حذف، رفع الصور، التحكم في المخزون.
- [ ] إدارة التصنيفات (Categories Management).
- [ ] إدارة الطلبات (Orders Management): تتبع الطلبات وتحديث الحالة (قيد الانتظار ➔ تم التأكيد ➔ تم الشحن ➔ تم التوصيل).
- [ ] إدارة الكوبونات (Coupons Management): إنشاء أكواد الخصم وتحديد نسبتها وحدود استخدامها.
- [ ] واجهة طابور الحجوزات وترشيح الفريلانسرز (مجهزة للمرحلة الثانية).
- [ ] Commit: `feat(admin): complete admin dashboard with analytics and management tools`.

### ⚪ المرحلة 7: حساب العميل وتاريخ الطلبات ونقاط الولاء
- [ ] الملف الشخصي وتعديل البيانات والعناوين.
- [ ] صفحة تتبع الطلبات السابقة والحالية.
- [ ] محفظة نقاط الولاء (Loyalty Points Wallet) وسجل العمليات.
- [ ] Commit: `feat(account): customer profile, order tracking, and loyalty rewards`.

---

## 📝 سجل الـ Commits المنجزة
- `feat: initial project setup, angular 22 config, and supabase schema blueprint`
