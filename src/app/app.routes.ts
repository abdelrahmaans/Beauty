import { Routes } from '@angular/router';
import { HomeComponent } from './features/store/home/home.component';
import { CatalogComponent } from './features/store/catalog/catalog.component';
import { ProductDetailsComponent } from './features/store/product-details/product-details.component';
import { CheckoutComponent } from './features/store/checkout/checkout.component';
import { AccountComponent } from './features/account/account.component';
import { AdminComponent } from './features/admin/admin.component';
import { RequestServiceComponent } from './features/booking/request-service/request-service.component';
import { MyBookingsComponent } from './features/booking/my-bookings/my-bookings.component';
import { ProviderPortalComponent } from './features/provider-portal/provider-portal.component';
import { CentersNearbyComponent } from './features/centers/centers-nearby/centers-nearby.component';
import { CenterProfileComponent } from './features/centers/center-profile/center-profile.component';
import { MyReferralsComponent } from './features/centers/my-referrals/my-referrals.component';
import { CenterPortalComponent } from './features/center-portal/center-portal.component';
import { LoginComponent } from './features/auth/login/login.component';
import { SignupComponent } from './features/auth/signup/signup.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ApplyProviderComponent } from './features/auth/apply-provider/apply-provider.component';
import { ApplyCenterComponent } from './features/auth/apply-center/apply-center.component';
import { PendingReviewComponent } from './features/auth/pending-review/pending-review.component';
import { roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'منصة بيوتي | متجر وجلسات ومراكز العناية الفاخرة'
  },
  // Auth & Onboarding Routes
  {
    path: 'login',
    component: LoginComponent,
    title: 'تسجيل الدخول | منصة بيوتي'
  },
  {
    path: 'signup',
    component: SignupComponent,
    title: 'إنشاء حساب عميلة جديدة | منصة بيوتي'
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    title: 'استعادة كلمة المرور | منصة بيوتي'
  },
  {
    path: 'apply/provider',
    component: ApplyProviderComponent,
    title: 'انضمي كأخصائية فريلانسر | منصة بيوتي'
  },
  {
    path: 'apply/center',
    component: ApplyCenterComponent,
    title: 'تسجيل مركز تجميل شريك | منصة بيوتي'
  },
  {
    path: 'pending-review',
    component: PendingReviewComponent,
    title: 'حسابكِ قيد المراجعة والتدقيق | منصة بيوتي'
  },

  // Storefront & Public
  {
    path: 'products',
    component: CatalogComponent,
    title: 'كتالوج المنتجات الأصلية | متجر بيوتي'
  },
  {
    path: 'products/:slug',
    component: ProductDetailsComponent,
    title: 'تفاصيل المنتج | متجر بيوتي'
  },
  {
    path: 'checkout',
    component: CheckoutComponent,
    title: 'إتمام الطلب والدفع | متجر بيوتي'
  },
  {
    path: 'booking/request',
    component: RequestServiceComponent,
    title: 'طلب جلسة عناية منزلية | منصة بيوتي'
  },
  {
    path: 'booking/my-bookings',
    component: MyBookingsComponent,
    title: 'متابعة جلساتي المنزلية | منصة بيوتي'
  },
  {
    path: 'centers',
    component: CentersNearbyComponent,
    title: 'دليل المراكز والصالونات الشريكة | منصة بيوتي'
  },
  {
    path: 'centers/my-codes',
    component: MyReferralsComponent,
    title: 'أكواد الخصم وإحالاتي في المراكز | منصة بيوتي'
  },
  {
    path: 'centers/:id',
    component: CenterProfileComponent,
    title: 'بروفايل المركز الشريك | منصة بيوتي'
  },

  // Role Protected Portals
  {
    path: 'provider',
    component: ProviderPortalComponent,
    canActivate: [roleGuard(['provider', 'admin'])],
    title: 'بوابة الأخصائيات والفريلانسرز | منصة بيوتي'
  },
  {
    path: 'center',
    component: CenterPortalComponent,
    canActivate: [roleGuard(['center', 'admin'])],
    title: 'بوابة المراكز الشريكة | منصة بيوتي'
  },
  {
    path: 'account',
    component: AccountComponent,
    canActivate: [roleGuard(['customer', 'admin', 'provider', 'center'])],
    title: 'حسابي والطلبات | منصة بيوتي'
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [roleGuard(['admin'])],
    title: 'لوحة التحكم المركزية | منصة بيوتي'
  },

  {
    path: '**',
    redirectTo: ''
  }
];
