# 🌸 Beauty Store & Care Platform | منصة العناية بالشعر والبشرة

منصة متكاملة وتجربة فاخرة للعناية بالشعر والبشرة تجمع بين:
1. **المتجر الإلكتروني (E-commerce Store - Phase 1 MVP)**: بيع منتجات العناية بالبشرة والشعر، الشامبوهات، السيرومات، الزيوت، والمرطبات مع سلة شراء، أكواد خصم، ونظام نقاط ولاء.
2. **دليل المراكز الشريكة (Beauty Centers Directory - Phase 2)**: استعراض المراكز وحجز المواعيد والبحث الجغرافي.
3. **سوق الخدمات المنزلية (On-demand Home Care Sessions - Phase 2)**: طلب فريلانسرز متخصصات لجلسات العناية في المنزل بنظام الترشيح والمطابقة الذكية وإشراف الإدارة.

---

## 🛠️ التقنيات المستخدمة (Tech Stack)
- **Frontend**: Angular 22 (Standalone Components + Angular Signals + SCSS)
- **Backend & Database**: Supabase (PostgreSQL 16 + Auth + Storage + RLS + Edge Functions)
- **Typography & Theme**: Cairo / Plus Jakarta Sans, Luxury Rose Gold & Warm Emerald Palette, Full RTL support.

---

## 📂 هيكل المشروع (Project Structure)
```
src/
├── app/
│   ├── core/                  # Core services, models, guards, interceptors
│   │   ├── guards/            # auth.guard, admin.guard
│   │   ├── models/            # Product, Order, Profile, Category, Coupon, etc.
│   │   └── services/          # Supabase, Auth, Products, Cart, Orders, Coupons
│   ├── features/              # Feature modules (Lazy loaded)
│   │   ├── account/           # Profile, Order History, Loyalty Points
│   │   ├── admin/             # Overview, Products, Categories, Orders, Coupons
│   │   ├── auth/              # Login, Register modals & views
│   │   └── store/             # Home, Catalog, Product Details, Cart, Checkout
│   ├── shared/                # UI components, layout (Navbar, Footer, ProductCard)
│   ├── app.config.ts          # Angular application configuration
│   └── app.routes.ts          # Application routing
├── environments/              # Supabase URL & Anon Key config
└── styles.scss                # Global design system, variables, RTL styling
supabase/
└── schema.sql                 # Complete Postgres SQL Schema & RLS policies
```

---

## 🚀 التشغيل المحلي (Getting Started)

1. **تثبيت الاعتماديات:**
   ```bash
   npm install
   ```

2. **إعداد متغيرات البيئة:**
   عدل الملف `src/environments/environment.ts` وأضف مفاتيح Supabase الخاصة بك:
   ```typescript
   export const environment = {
     production: false,
     supabaseUrl: 'YOUR_SUPABASE_PROJECT_URL',
     supabaseKey: 'YOUR_SUPABASE_ANON_KEY',
   };
   ```

3. **تشغيل خادم التطوير:**
   ```bash
   npm start
   ```
   افتح المتصفح على [http://localhost:4200](http://localhost:4200).

---

## 🗄️ إعداد قاعدة البيانات في Supabase
قم بنسخ محتوى الملف `supabase/schema.sql` ولصقه في **SQL Editor** في لوحة تحكم Supabase لتنفيذ الـ Schema وسياسات الـ RLS كاملة.

---

## 📄 خطة المتابعة
راجع ملف [PLAN.md](PLAN.md) للاطلاع على تفاصيل المراحل ونسبة الإنجاز وسجل الـ Commits.
