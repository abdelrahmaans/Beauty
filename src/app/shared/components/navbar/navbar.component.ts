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
    <!-- Top Announcement & Multi-Role Demo Bar (Desktop / Tablet) -->
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

          <!-- 4-Role Demo Switcher (Desktop) -->
          <div class="demo-role-switcher hide-on-mobile">
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
          <!-- Desktop Account Link -->
          <a routerLink="/account" class="action-btn hide-on-mobile" title="حسابي">
            <i class="fa-regular fa-user"></i>
            <span class="action-label" *ngIf="auth.profile()">{{ auth.profile()?.full_name?.split(' ')?.[0] }}</span>
          </a>

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
        <div class="drawer-user-info" *ngIf="auth.profile()">
          <img
            [src]="auth.profile()?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'"
            class="user-avatar-mini"
          />
          <div>
            <strong class="user-name">{{ auth.profile()?.full_name }}</strong>
            <span class="user-role-tag">{{ getRoleLabel(auth.userRole()) }}</span>
          </div>
        </div>

        <button (click)="closeMobileMenu()" class="drawer-close-btn">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Loyalty Badge in Drawer -->
      <div class="drawer-loyalty-box" *ngIf="auth.isAuthenticated()">
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

        <!-- Portal / Management Links -->
        <span class="drawer-section-title mt-3">البوابات والإدارة</span>

        <a routerLink="/provider" (click)="closeMobileMenu()" routerLinkActive="active" class="drawer-nav-item provider-item">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <span>بوابة الأخصائيات (Freelancers)</span>
        </a>

        <a routerLink="/center" (click)="closeMobileMenu()" routerLinkActive="active" class="drawer-nav-item center-item">
          <i class="fa-solid fa-hotel"></i>
          <span>بوابة المراكز الشريكة (Centers)</span>
        </a>

        <a *ngIf="auth.isAdmin()" routerLink="/admin" (click)="closeMobileMenu()" routerLinkActive="active" class="drawer-nav-item admin-item">
          <i class="fa-solid fa-gauge-high"></i>
          <span>لوحة التحكم المركزية (Admin)</span>
        </a>
      </div>

      <!-- Mobile Demo Role Switcher -->
      <div class="drawer-role-switcher">
        <span class="switcher-title"><i class="fa-solid fa-shuffle"></i> تجربة المنصة بالأدوار المختلفة:</span>
        <div class="role-grid">
          <button
            class="m-role-btn"
            [class.active]="auth.userRole() === 'customer'"
            (click)="switchRoleAndClose('customer')"
          >
            <i class="fa-regular fa-user"></i> العميلة
          </button>
          <button
            class="m-role-btn provider"
            [class.active]="auth.userRole() === 'provider'"
            (click)="switchRoleAndClose('provider')"
          >
            <i class="fa-solid fa-wand-magic-sparkles"></i> الأخصائية
          </button>
          <button
            class="m-role-btn center"
            [class.active]="auth.userRole() === 'center'"
            (click)="switchRoleAndClose('center')"
          >
            <i class="fa-solid fa-store"></i> المركز
          </button>
          <button
            class="m-role-btn admin"
            [class.active]="auth.userRole() === 'admin'"
            (click)="switchRoleAndClose('admin')"
          >
            <i class="fa-solid fa-shield-halved"></i> الأدمن
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    /* Desktop Top Banner */
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

      @media (max-width: 768px) {
        font-size: 0.75rem;
        width: 100%;
        justify-content: center;
      }
    }
    .banner-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      @media (max-width: 768px) { display: none; }
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

    .drawer-role-switcher {
      padding: 1.25rem;
      background: #FAF7F5;
      border-top: 1px solid var(--color-border-light);
    }
    .switcher-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--color-text-muted);
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-bottom: 0.75rem;
    }
    .role-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
    }
    .m-role-btn {
      padding: 0.55rem 0.65rem;
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: 10px;
      font-family: inherit;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      transition: var(--transition-smooth);

      &.active {
        background: var(--color-primary);
        color: #fff;
        border-color: var(--color-primary);
      }
      &.provider.active { background: #10B981; border-color: #10B981; }
      &.center.active { background: #D97706; border-color: #D97706; }
      &.admin.active { background: #C46D5B; border-color: #C46D5B; }
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

  switchRoleAndClose(role: 'admin' | 'customer' | 'provider' | 'center'): void {
    this.auth.switchDemoRole(role);
    this.closeMobileMenu();
  }

  getRoleLabel(role: string): string {
    const map: Record<string, string> = {
      customer: 'عميلة المنصة',
      provider: 'أخصائية تجميل فريلانسر',
      center: 'إدارة مركز تجميل شريك',
      admin: 'مديرة العمليات المركزية'
    };
    return map[role] || 'مستخدم';
  }
}
