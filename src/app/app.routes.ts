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
import { adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'منصة بيوتي | متجر وجلسات العناية بالشعر والبشرة'
  },
  {
    path: 'products',
    component: CatalogComponent,
    title: 'كتالوج المنتجات | متجر بيوتي'
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
    path: 'provider',
    component: ProviderPortalComponent,
    title: 'بوابة الأخصائيات والفريلانسرز | منصة بيوتي'
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
    title: 'لوحة التحكم والترشيح المركزي | منصة بيوتي'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
