import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductsService } from '../../../core/services/products.service';
import { NotificationsService } from '../../../core/services/notifications.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Top Announcement & Multi-Role Demo Bar -->
    <div class="top-banner">
      <div class="container-custom banner-content">
        <div class="banner-item">
          <i class="fa-solid fa-sparkles"></i>
          <span>منصة بيوتي: متجر منتجات أصلية + جلسات منزلية + دليل وتخفيضات المراكز الشريكة</span>
        </div>

        <div class="banner-actions">
          <span class="loyalty-badge" *ngIf="auth.isAuthenticated()">
            <i class="fa-solid fa-gem"></i>
            رصيدك: <strong>{{ auth.loyaltyPoints() }}</strong> نقطة
          </span>

          <!-- 4-Role Demo Switcher -->
          <div class="demo-role-switcher">
            <button
              class="role-pill"
              [class.active]="auth.userRole() === 'customer'"
              (click)="auth.switchDemoRole('customer')"
              title="تجربة كعميلة للمتجر والجلسات والمراكز"
            >
              <i class="fa-regular fa-user"></i> العميلة
            </button>

            <button
              class="role-pill provider-pill"
              [class.active]="auth.userRole() === 'provider'"
              (click)="auth.switchDemoRole('provider')"
              title="تجربة كأخصائية تجميل فريلانسر"
            >
              <i class="fa-solid fa-wand-magic-sparkles"></i> الأخصائية
            </button>

            <button
              class="role-pill center-pill"
              [class.active]="auth.userRole() === 'center'"
              (click)="auth.switchDemoRole('center')"
              title="تجربة كمدير مركز تجميل شريك"
            >
              <i class="fa-solid fa-store"></i> المركز الشريك
            </button>

            <button
              class="role-pill admin-pill"
              [class.active]="auth.userRole() === 'admin'"
              (click)="auth.switchDemoRole('admin')"
              title="تجربة كمديرة المنصة والترشيح"
            >
              <i class="fa-solid fa-shield-halved"></i> الأدمن
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Navigation Header -->
    <header class="main-header glass-nav sticky-top">
      <div class="container-custom header-inner">
        <!-- Logo -->
        <a routerLink="/" class="brand-logo">
          <div class="logo-symbol">
            <i class="fa-solid fa-feather-pointed"></i>
          </div>
          <div class="logo-text">
            <span class="brand-title">BEAUTY</span>
            <span class="brand-sub">متجر وجلسات ومراكز العناية الفاخرة</span>
          </div>
        </a>

        <!-- Search Bar -->
        <div class="search-box">
          <i class="fa-solid fa-magnifying-glass search-icon"></i>
          <input
            type="text"
            placeholder="ابحثي عن منتجات أصلية، جلسات، أو مراكز تجميل..."
            [ngModel]="productsService.searchQuery()"
            (ngModelChange)="onSearch($event)"
            class="search-input"
          />
          <button
            *ngIf="productsService.searchQuery()"
            (click)="productsService.setSearchQuery('')"
            class="clear-btn"
            title="مسح البحث"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Navigation Links -->
        <nav class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
            الرئيسية
          </a>
          <a routerLink="/products" routerLinkActive="active" class="nav-item">
            المتجر
          </a>
          <a routerLink="/booking/request" routerLinkActive="active" class="nav-item home-service-link">
            <i class="fa-solid fa-sparkles"></i> جلسات منزلية
          </a>
          <a routerLink="/centers" routerLinkActive="active" class="nav-item centers-link">
            <i class="fa-solid fa-store"></i> دليل المراكز
          </a>
          <a routerLink="/booking/my-bookings" routerLinkActive="active" class="nav-item">
            جلساتي
          </a>
          <a *ngIf="auth.isProvider()" routerLink="/provider" routerLinkActive="active" class="nav-item provider-nav-link">
            <i class="fa-solid fa-id-badge"></i> بوابة الأخصائية
          </a>
          <a *ngIf="auth.isCenter()" routerLink="/center" routerLinkActive="active" class="nav-item center-nav-link">
            <i class="fa-solid fa-store"></i> بوابة المركز
          </a>
          <a *ngIf="auth.isAdmin()" routerLink="/admin" routerLinkActive="active" class="nav-item admin-link">
            <i class="fa-solid fa-gauge-high"></i> لوحة التحكم
          </a>
        </nav>

        <!-- Header Actions -->
        <div class="header-actions">
          <a routerLink="/account" class="action-btn" title="حسابي">
            <i class="fa-regular fa-user"></i>
            <span class="action-label" *ngIf="auth.profile()">{{ auth.profile()?.full_name?.split(' ')?.[0] }}</span>
          </a>

          <button (click)="cart.toggleDrawer()" class="action-btn cart-btn" title="سلة التسوق">
            <i class="fa-solid fa-bag-shopping"></i>
            <span class="cart-badge" *ngIf="cart.totalItemsCount() > 0">
              {{ cart.totalItemsCount() }}
            </span>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .top-banner {
      background: linear-gradient(90deg, #1E1B18 0%, #2D5A4B 100%);
      color: #F8F4F0;
      font-size: 0.8rem;
      padding: 0.45rem 0;
    }
    .banner-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .banner-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #FAF7F5;
      i { color: #E08D79; }
    }
    .banner-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .loyalty-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(212, 175, 55, 0.2);
      border: 1px solid rgba(212, 175, 55, 0.4);
      padding: 0.15rem 0.6rem;
      border-radius: 9999px;
      color: #FFD966;
      font-size: 0.75rem;
    }
    .demo-role-switcher {
      display: inline-flex;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
      padding: 2px;
      gap: 2px;
    }
    .role-pill {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.75);
      font-size: 0.72rem;
      padding: 0.15rem 0.55rem;
      border-radius: 9999px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;

      &.active { background: #FFFFFF; color: #1E1B18; font-weight: 700; }
      &.provider-pill.active { background: #10B981; color: #FFFFFF; }
      &.center-pill.active { background: #D97706; color: #FFFFFF; }
      &.admin-pill.active { background: #C46D5B; color: #FFFFFF; }
    }

    .main-header {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 20px rgba(30, 27, 24, 0.04);
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.85rem;
      padding-bottom: 0.85rem;
      gap: 1.5rem;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }
    .logo-symbol {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--color-primary) 0%, #E08D79 100%);
      color: #fff;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      box-shadow: 0 4px 14px rgba(196, 109, 91, 0.35);
    }
    .logo-text { display: flex; flex-direction: column; }
    .brand-title {
      font-family: var(--font-latin);
      font-weight: 800;
      font-size: 1.3rem;
      letter-spacing: 2px;
      color: var(--color-text-main);
      line-height: 1;
    }
    .brand-sub { font-size: 0.72rem; color: var(--color-primary); font-weight: 600; }
    .search-box {
      flex: 1;
      max-width: 380px;
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon { position: absolute; right: 14px; color: var(--color-text-subtle); pointer-events: none; }
    .search-input {
      width: 100%;
      padding: 0.65rem 2.6rem 0.65rem 2rem;
      background: #F4EBE4;
      border: 1px solid transparent;
      border-radius: 9999px;
      font-family: inherit;
      font-size: 0.88rem;
      color: var(--color-text-main);
      outline: none;
      transition: var(--transition-smooth);

      &:focus { background: #FFFFFF; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(196, 109, 91, 0.15); }
    }
    .clear-btn { position: absolute; left: 14px; background: none; border: none; color: var(--color-text-subtle); cursor: pointer; }
    .nav-links { display: flex; align-items: center; gap: 0.75rem; }
    .nav-item {
      text-decoration: none;
      color: var(--color-text-main);
      font-weight: 600;
      font-size: 0.9rem;
      padding: 0.35rem 0.6rem;
      border-radius: 8px;
      transition: var(--transition-smooth);

      &:hover, &.active { color: var(--color-primary); background: var(--color-primary-subtle); }
      &.home-service-link { color: var(--color-secondary); background: var(--color-secondary-light); font-weight: 700; }
      &.centers-link { color: #D97706; background: #FEF3C7; font-weight: 700; }
      &.provider-nav-link { color: #15803D; background: #DCFCE7; }
      &.center-nav-link { color: #B45309; background: #FEF3C7; }
      &.admin-link { color: #C46D5B; background: var(--color-primary-light); }
    }
    .header-actions { display: flex; align-items: center; gap: 0.75rem; }
    .action-btn {
      display: inline-flex; align-items: center; gap: 0.4rem; background: #FFFFFF; border: 1.5px solid var(--color-border);
      color: var(--color-text-main); padding: 0.55rem 0.85rem; border-radius: 9999px; cursor: pointer; text-decoration: none; font-size: 0.88rem; font-weight: 600;
      transition: var(--transition-smooth); position: relative;

      &:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-subtle); }
    }
    .cart-btn { padding: 0.55rem 0.75rem; }
    .cart-badge {
      position: absolute; top: -6px; left: -6px; background: var(--color-primary); color: #ffffff;
      font-size: 0.75rem; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    }
  `]
})
export class NavbarComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  productsService = inject(ProductsService);
  notifications = inject(NotificationsService);

  onSearch(query: string): void {
    this.productsService.setSearchQuery(query);
  }
}
