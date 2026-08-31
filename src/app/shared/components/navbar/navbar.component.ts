import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ProductsService } from '../../../core/services/products.service';
import { NotificationsService } from '../../../core/services/notifications.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Main Navigation Header -->
    <header class="main-header glass-nav sticky-top">
      <div class="container-custom header-inner">
        <!-- Logo -->
        <a routerLink="/" (click)="closeMobileMenu()" class="brand-logo">
          <div class="logo-symbol">
            <i class="fa-solid fa-feather-pointed"></i>
          </div>
          <div class="logo-text">
            <span class="brand-title">BEAUTY</span>
            <span class="brand-sub">متجر وجلسات ومراكز العناية الفاخرة</span>
          </div>
        </a>

        <!-- Desktop Search Bar -->
        <div class="search-box hide-on-mobile">
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

        <!-- Desktop Navigation Links -->
        <nav class="nav-links hide-on-mobile">
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
          <a *ngIf="auth.isProvider() || auth.isAdmin()" routerLink="/provider" routerLinkActive="active" class="nav-item provider-nav-link">
            <i class="fa-solid fa-id-badge"></i> بوابة الأخصائية
          </a>
          <a *ngIf="auth.isCenter() || auth.isAdmin()" routerLink="/center" routerLinkActive="active" class="nav-item center-nav-link">
            <i class="fa-solid fa-store"></i> بوابة المركز
          </a>
          <a *ngIf="auth.isAdmin()" routerLink="/admin" routerLinkActive="active" class="nav-item admin-link">
            <i class="fa-solid fa-gauge-high"></i> لوحة التحكم
          </a>
        </nav>

        <!-- Header Actions & Mobile Toggle -->
        <div class="header-actions">
          <!-- Desktop Guest Login Button -->
          <a *ngIf="!auth.isAuthenticated()" routerLink="/login" class="btn-primary btn-sm hide-on-mobile">
            <i class="fa-solid fa-arrow-right-to-bracket"></i> تسجيل الدخول
          </a>

          <!-- Desktop Logged In Account Link -->
          <ng-container *ngIf="auth.isAuthenticated()">
            <a routerLink="/account" class="action-btn hide-on-mobile" title="حسابي">
              <i class="fa-regular fa-user"></i>
              <span class="action-label">{{ auth.profile()?.full_name?.split(' ')?.[0] || 'حسابي' }}</span>
            </a>
            <button (click)="auth.signOut()" class="action-btn logout-header-btn hide-on-mobile" title="تسجيل الخروج">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </ng-container>

          <!-- Cart Button (Always visible) -->
          <button (click)="cart.toggleDrawer()" class="action-btn cart-btn" title="سلة التسوق">
            <i class="fa-solid fa-bag-shopping"></i>
            <span class="cart-badge" *ngIf="cart.totalItemsCount() > 0">
              {{ cart.totalItemsCount() }}
            </span>
          </button>

          <!-- Mobile Hamburger Toggle Button -->
          <button
            class="mobile-menu-btn show-on-mobile"
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="isMobileMenuOpen()"
            title="القائمة الرئيسية"
          >
            <i class="fa-solid" [ngClass]="isMobileMenuOpen() ? 'fa-xmark' : 'fa-bars-staggered'"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- Mobile Drawer Backdrop -->
    <div
      class="mobile-drawer-backdrop show-on-mobile"
      *ngIf="isMobileMenuOpen()"
      (click)="closeMobileMenu()"
    ></div>

    <!-- Mobile Navigation Drawer -->
    <aside class="mobile-nav-drawer show-on-mobile" [class.open]="isMobileMenuOpen()">
      <!-- Drawer Top Bar -->
      <div class="drawer-header">
        <!-- Logged in state -->
        <div class="drawer-user-info" *ngIf="auth.isAuthenticated()">
          <img
            [src]="auth.profile()?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'"
            class="user-avatar-mini"
          />
          <div>
            <strong class="user-name">{{ auth.profile()?.full_name || 'عميلة المتجر' }}</strong>
            <span class="user-role-tag">{{ getRoleLabel(auth.userRole()) }}</span>
          </div>
          <button (click)="auth.signOut()" class="drawer-logout-btn" title="تسجيل الخروج">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>
          </button>
        </div>

        <!-- Guest state -->
        <div class="drawer-guest-banner" *ngIf="!auth.isAuthenticated()">
          <div class="d-flex align-items-center gap-2 mb-2">
            <i class="fa-solid fa-sparkles text-primary"></i>
            <strong>أهلاً بكِ في بيوتي</strong>
          </div>
          <div class="drawer-auth-btns">
            <a routerLink="/login" (click)="closeMobileMenu()" class="btn-primary btn-micro">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> دخول
            </a>
            <a routerLink="/signup" (click)="closeMobileMenu()" class="btn-outline btn-micro">
              <i class="fa-solid fa-user-plus"></i> حساب جديد
            </a>
          </div>
        </div>

        <button (click)="closeMobileMenu()" class="drawer-close-btn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Loyalty Badge in Drawer -->
      <div class="drawer-loyalty-box" *ngIf="auth.isAuthenticated() && auth.loyaltyPoints() > 0">
        <i class="fa-solid fa-gem"></i>
        <span>رصيد نقاط الولاء المتاح: <strong>{{ auth.loyaltyPoints() }}</strong> نقطة</span>
      </div>

      <!-- Mobile Search Bar -->
      <div class="drawer-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          placeholder="ابحثي عن منتجات، جلسات، أو مراكز..."
          [ngModel]="productsService.searchQuery()"
          (ngModelChange)="onSearch($event)"
        />
        <button
          *ngIf="productsService.searchQuery()"
          (click)="productsService.setSearchQuery('')"
          class="clear-mini"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Navigation Links List -->
      <div class="drawer-nav-list">
        <span class="drawer-section-title">الأقسام والخدمات</span>

        <a routerLink="/" (click)="closeMobileMenu()" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="drawer-nav-item">
          <i class="fa-solid fa-house"></i>
          <span>الرئيسية</span>
        </a>

        <a routerLink="/products" (click)="closeMobileMenu()" routerLinkActive="active" class="drawer-nav-item">
          <i class="fa-solid fa-bag-shopping"></i>
          <span>المتجر والمنتجات الأصلية</span>
        </a>

        <a routerLink="/booking/request" (click)="closeMobileMenu()" routerLinkActive="active" class="drawer-nav-item home-srv-item">
          <i class="fa-solid fa-spa"></i>
          <span>حجز جلسة عناية منزلية</span>
          <span class="badge-new">خدمة منزلية</span>
        </a>

        <a routerLink="/centers" (click)="closeMobileMenu()" routerLinkActive="active" class="drawer-nav-item centers-item">
          <i class="fa-solid fa-store"></i>
          <span>دليل مراكز التجميل والسبا</span>
          <span class="badge-discount">خصم حتى 20%</span>
        </a>

        <a routerLink="/booking/my-bookings" (click)="closeMobileMenu()" routerLinkActive="active" class="drawer-nav-item">
          <i class="fa-solid fa-calendar-check"></i>
          <span>متابعة جلساتي المنزلية</span>
        </a>

        <a routerLink="/centers/my-codes" (click)="closeMobileMenu()" routerLinkActive="active" class="drawer-nav-item">
          <i class="fa-solid fa-ticket"></i>
          <span>أكواد الخصم الخاصة بي في المراكز</span>
        </a>

        <a routerLink="/account" (click)="closeMobileMenu()" routerLinkActive="active" class="drawer-nav-item">
          <i class="fa-regular fa-user"></i>
          <span>حسابي وتتبع طلبات المتجر</span>
        </a>

        <!-- Portal / Management Links (Only if authorized) -->
        <ng-container *ngIf="auth.isProvider() || auth.isCenter() || auth.isAdmin()">
          <span class="drawer-section-title mt-3">البوابات والإدارة</span>

          <a *ngIf="auth.isProvider() || auth.isAdmin()" routerLink="/provider" (click)="closeMobileMenu()" routerLinkActive="active" class="drawer-nav-item provider-item">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <span>بوابة الأخصائيات (Freelancers)</span>
          </a>

          <a *ngIf="auth.isCenter() || auth.isAdmin()" routerLink="/center" (click)="closeMobileMenu()" routerLinkActive="active" class="drawer-nav-item center-item">
            <i class="fa-solid fa-hotel"></i>
            <span>بوابة المراكز الشريكة (Centers)</span>
          </a>

          <a *ngIf="auth.isAdmin()" routerLink="/admin" (click)="closeMobileMenu()" routerLinkActive="active" class="drawer-nav-item admin-item">
            <i class="fa-solid fa-gauge-high"></i>
            <span>لوحة التحكم المركزية (Admin)</span>
          </a>
        </ng-container>
      </div>

      <!-- Partner Onboarding Callout (for Guests and regular customers) -->
      <div class="drawer-partners-callout" *ngIf="!auth.isProvider() && !auth.isCenter() && !auth.isAdmin()">
        <span class="callout-title"><i class="fa-solid fa-handshake"></i> انضمي كشريك في المنصة:</span>
        <div class="callout-chips">
          <a routerLink="/apply/provider" (click)="closeMobileMenu()" class="callout-link">
            <i class="fa-solid fa-wand-magic-sparkles"></i> انضمي كأخصائية فريلانسر
          </a>
          <a routerLink="/apply/center" (click)="closeMobileMenu()" class="callout-link">
            <i class="fa-solid fa-store"></i> سجلي كمركز تجميل شريك
          </a>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .logout-header-btn {
      color: #9CA3AF;
      transition: var(--transition-smooth);
      &:hover { color: #EF4444; }
    }

    /* Main Header */
    .main-header {
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 4px 20px rgba(30, 27, 24, 0.04);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
      gap: 1.25rem;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }
    .logo-symbol {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, var(--color-primary) 0%, #E08D79 100%);
      color: #fff;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      box-shadow: 0 4px 14px rgba(196, 109, 91, 0.35);
    }
    .logo-text { display: flex; flex-direction: column; }
    .brand-title {
      font-family: var(--font-latin);
      font-weight: 800;
      font-size: 1.25rem;
      letter-spacing: 2px;
      color: var(--color-text-main);
      line-height: 1;
    }
    .brand-sub { font-size: 0.68rem; color: var(--color-primary); font-weight: 600; }

    .search-box {
      flex: 1;
      max-width: 320px;
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon { position: absolute; right: 14px; color: var(--color-text-subtle); pointer-events: none; }
    .search-input {
      width: 100%;
      padding: 0.6rem 2.5rem 0.6rem 2rem;
      background: #F4EBE4;
      border: 1px solid transparent;
      border-radius: 9999px;
      font-family: inherit;
      font-size: 0.85rem;
      color: var(--color-text-main);
      outline: none;
      transition: var(--transition-smooth);

      &:focus { background: #FFFFFF; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(196, 109, 91, 0.15); }
    }
    .clear-btn { position: absolute; left: 14px; background: none; border: none; color: var(--color-text-subtle); cursor: pointer; }

    .nav-links { display: flex; align-items: center; gap: 0.6rem; }
    .nav-item {
      text-decoration: none;
      color: var(--color-text-main);
      font-weight: 600;
      font-size: 0.88rem;
      padding: 0.35rem 0.55rem;
      border-radius: 8px;
      transition: var(--transition-smooth);

      &:hover, &.active { color: var(--color-primary); background: var(--color-primary-subtle); }
      &.home-service-link { color: var(--color-secondary); background: var(--color-secondary-light); font-weight: 700; }
      &.centers-link { color: #D97706; background: #FEF3C7; font-weight: 700; }
      &.provider-nav-link { color: #15803D; background: #DCFCE7; }
      &.center-nav-link { color: #B45309; background: #FEF3C7; }
      &.admin-link { color: #C46D5B; background: var(--color-primary-light); }
    }

    .header-actions { display: flex; align-items: center; gap: 0.6rem; }
    .action-btn {
      display: inline-flex; align-items: center; gap: 0.4rem; background: #FFFFFF; border: 1.5px solid var(--color-border);
      color: var(--color-text-main); padding: 0.5rem 0.8rem; border-radius: 9999px; cursor: pointer; text-decoration: none; font-size: 0.85rem; font-weight: 600;
      transition: var(--transition-smooth); position: relative;

      &:hover { border-color: var(--color-primary); color: var(--color-primary); background: var(--color-primary-subtle); }
    }
    .cart-btn { padding: 0.5rem 0.75rem; }
    .cart-badge {
      position: absolute; top: -6px; left: -6px; background: var(--color-primary); color: #ffffff;
      font-size: 0.75rem; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    }

    /* Mobile Toggle Button */
    .mobile-menu-btn {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: #FAF7F5;
      border: 1.5px solid var(--color-border);
      color: var(--color-text-main);
      font-size: 1.25rem;
      cursor: pointer;
      display: none;
      align-items: center;
      justify-content: center;
      transition: var(--transition-smooth);

      &:hover { border-color: var(--color-primary); color: var(--color-primary); }
    }

    /* Visibility Utilities */
    .show-on-mobile { display: none; }
    .hide-on-mobile { display: flex; }

    @media (max-width: 992px) {
      .hide-on-mobile { display: none !important; }
      .show-on-mobile { display: flex; }
      .mobile-menu-btn { display: flex; }
    }

    /* Mobile Drawer & Backdrop */
    .mobile-drawer-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(30, 27, 24, 0.55);
      backdrop-filter: blur(4px);
      z-index: 1050;
      animation: fadeIn 0.25s ease;
    }

    .mobile-nav-drawer {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 85%;
      max-width: 360px;
      background: #FFFFFF;
      z-index: 1060;
      box-shadow: -8px 0 30px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      transform: translateX(100%);
      transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1);
      overflow-y: auto;

      &.open {
        transform: translateX(0);
      }
    }

    .drawer-header {
      padding: 1.25rem 1.5rem;
      background: #FAF7F5;
      border-bottom: 1px solid var(--color-border-light);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .drawer-user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-avatar-mini {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #FFFFFF;
      box-shadow: var(--shadow-sm);
    }
    .user-name { font-size: 0.95rem; display: block; color: var(--color-text-main); }
    .user-role-tag { font-size: 0.72rem; color: var(--color-primary); font-weight: 700; }
    .drawer-close-btn {
      background: none;
      border: none;
      font-size: 1.35rem;
      color: var(--color-text-muted);
      cursor: pointer;
      padding: 0.3rem;
      &:hover { color: var(--color-primary); }
    }

    .drawer-loyalty-box {
      margin: 1rem 1.5rem 0.5rem;
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 12px;
      padding: 0.65rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 0.82rem;
      color: #854D0E;
      i { color: #D97706; font-size: 1rem; }
    }

    .drawer-search {
      position: relative;
      margin: 0.75rem 1.5rem;
      i { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--color-text-subtle); font-size: 0.9rem; }
      input {
        width: 100%;
        padding: 0.65rem 2.4rem 0.65rem 1.8rem;
        border-radius: 9999px;
        border: 1px solid var(--color-border);
        background: #FAF7F5;
        font-family: inherit;
        font-size: 0.85rem;
        outline: none;
        &:focus { border-color: var(--color-primary); background: #fff; }
      }
      .clear-mini { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 0.85rem; color: var(--color-text-subtle); cursor: pointer; }
    }

    .drawer-nav-list {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 1.25rem 1.5rem;
      flex: 1;
    }
    .drawer-section-title {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-text-subtle);
      text-transform: uppercase;
      margin: 0.75rem 0.5rem 0.35rem;
    }
    .mt-3 { margin-top: 1.25rem; }

    .drawer-nav-item {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 0.75rem 0.85rem;
      border-radius: 12px;
      text-decoration: none;
      color: var(--color-text-main);
      font-size: 0.92rem;
      font-weight: 600;
      transition: var(--transition-smooth);

      i { font-size: 1.05rem; width: 22px; text-align: center; color: var(--color-text-muted); }

      &:hover, &.active {
        background: var(--color-primary-subtle);
        color: var(--color-primary);
        i { color: var(--color-primary); }
      }

      &.home-srv-item {
        color: var(--color-secondary);
        i { color: var(--color-secondary); }
      }
      &.centers-item {
        color: #D97706;
        i { color: #D97706; }
      }
      &.provider-item {
        color: #15803D;
        i { color: #15803D; }
      }
      &.center-item {
        color: #B45309;
        i { color: #B45309; }
      }
      &.admin-item {
        color: #C46D5B;
        i { color: #C46D5B; }
      }
    }

    .badge-new {
      background: var(--color-secondary-light);
      color: var(--color-secondary);
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      margin-right: auto;
    }
    .badge-discount {
      background: #FEF3C7;
      color: #92400E;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      margin-right: auto;
    }

    .drawer-guest-banner {
      background: #FAF7F5;
      border: 1px solid var(--color-border-light);
      border-radius: 14px;
      padding: 0.85rem 1rem;
      width: 100%;
      margin-left: 0.75rem;
      strong { font-size: 0.9rem; color: var(--color-text-main); display: block; }
    }
    .drawer-auth-btns {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .drawer-logout-btn {
      background: none;
      border: 1px solid #FECACA;
      color: #EF4444;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      margin-right: auto;
      transition: var(--transition-smooth);
      &:hover { background: #FEF2F2; }
    }
    .drawer-partners-callout {
      margin: 1.5rem 1rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--color-border-light);
    }
    .callout-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--color-text-muted);
      display: block;
      margin-bottom: 0.65rem;
    }
    .callout-chips {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .callout-link {
      background: #FAF7F5;
      border: 1px solid var(--color-border);
      border-radius: 10px;
      padding: 0.55rem 0.85rem;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--color-primary);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: var(--transition-smooth);
      &:hover { background: #FFFFFF; border-color: var(--color-primary); }
    }
    .btn-sm {
      padding: 0.45rem 0.95rem;
      font-size: 0.85rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      text-decoration: none;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class NavbarComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  productsService = inject(ProductsService);
  notifications = inject(NotificationsService);
  router = inject(Router);

  isMobileMenuOpen = signal<boolean>(false);

  constructor() {
    // Automatically close mobile menu on route change
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.closeMobileMenu();
    });
  }

  onSearch(query: string): void {
    this.productsService.setSearchQuery(query);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      customer: 'عميلة المنصة',
      provider: 'أخصائية فريلانسر',
      center: 'مركز تجميل شريك',
      admin: 'الإدارة والعمليات'
    };
    return map[role] || 'مستخدم';
  }
}
