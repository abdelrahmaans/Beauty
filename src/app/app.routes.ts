import { Routes } from '@angular/router';
import { HomeComponent } from './features/store/home/home.component';
import { CatalogComponent } from './features/store/catalog/catalog.component';
import { ProductDetailsComponent } from './features/store/product-details/product-details.component';
import { CheckoutComponent } from './features/store/checkout/checkout.component';
import { AccountComponent } from './features/account/account.component';
import { AdminComponent } from './features/admin/admin.component';
import { adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'منصة بيوتي | العناية الفاخرة بالشعر والبشرة'
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
    path: 'account',
    component: AccountComponent,
    title: 'حسابي والطلبات | متجر بيوتي'
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [adminGuard],
    title: 'لوحة التحكم والإدارة | متجر بيوتي'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
