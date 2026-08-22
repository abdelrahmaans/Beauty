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
import { adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'منصة بيوتي | متجر وجلسات ومراكز العناية الفاخرة'
  },
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
  {
    path: 'provider',
    component: ProviderPortalComponent,
    title: 'بوابة الأخصائيات والفريلانسرز | منصة بيوتي'
  },
  {
    path: 'center',
    component: CenterPortalComponent,
    title: 'بوابة المراكز الشريكة | منصة بيوتي'
  },
  {
    path: 'account',
    component: AccountComponent,
    title: 'حسابي والطلبات | منصة بيوتي'
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
    title: 'لوحة التحكم المركزية | منصة بيوتي'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
