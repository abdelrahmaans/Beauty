import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CentersService } from '../../../core/services/centers.service';
import { ReferralsService } from '../../../core/services/referrals.service';
import { Provider } from '../../../core/models';

@Component({
  selector: 'app-centers-nearby',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="centers-page">
      <!-- Hero Header -->
      <section class="centers-hero">
        <div class="container-custom">
          <div class="hero-content animate-fade-in">
            <span class="badge-emerald"><i class="fa-solid fa-gem"></i> شبكة المراكز الشريكة المعتمدة</span>
            <h1 class="hero-title">دليل مراكز وصالونات <span class="highlight-text">العناية والجمال الفاخرة</span></h1>
            <p class="hero-sub">
              استكشفي أفضل مراكز التجميل والسبا المعتمدة بالقرب منكِ، واحصلي على أكواد خصم حصرية تصل إلى 20% عند الحجز وزيارة المركز.
            </p>

            <!-- Search in centers -->
            <div class="center-search-bar">
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                placeholder="ابحثي باسم المركز، المنطقة، أو الخدمة (مثل: هيدرافيشال، بالياج، حمام مغربي)..."
                [ngModel]="centersService.searchQuery()"
                (ngModelChange)="centersService.setSearchQuery($event)"
                class="search-input"
              />
              <button
                *ngIf="centersService.searchQuery()"
                (click)="centersService.setSearchQuery('')"
                class="clear-btn"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Filter Chips Bar (Cities & Categories) -->
      <section class="filter-chips-section">
        <div class="container-custom">
          <!-- City Filter -->
          <div class="chips-row">
            <span class="filter-label"><i class="fa-solid fa-location-dot"></i> المنطقة:</span>
            <div class="chips-scroll">
              <button
                class="chip-btn"
                [class.active]="centersService.selectedCity() === 'all'"
                (click)="centersService.setCityFilter('all')"
              >
                جميع المحافظات
              </button>
              <button
                class="chip-btn"
                [class.active]="centersService.selectedCity() === 'التجمع'"
                (click)="centersService.setCityFilter('التجمع')"
              >
                التجمع والقاهرة الجديدة
              </button>
              <button
                class="chip-btn"
                [class.active]="centersService.selectedCity() === 'المعادي'"
                (click)="centersService.setCityFilter('المعادي')"
              >
                المعادي
              </button>
              <button
                class="chip-btn"
                [class.active]="centersService.selectedCity() === 'الشيخ زايد'"
                (click)="centersService.setCityFilter('الشيخ زايد')"
              >
                الشيخ زايد و 6 أكتوبر
              </button>
              <button
                class="chip-btn"
                [class.active]="centersService.selectedCity() === 'بني سويف'"
                (click)="centersService.setCityFilter('بني سويف')"
              >
                بني سويف
              </button>
            </div>
          </div>

          <!-- Category Filter -->
          <div class="chips-row mt-2">
            <span class="filter-label"><i class="fa-solid fa-sparkles"></i> نوع العناية:</span>
            <div class="chips-scroll">
              <button
                class="chip-btn"
                [class.active]="centersService.selectedCategory() === 'all'"
                (click)="centersService.setCategoryFilter('all')"
              >
                كل التخصصات
              </button>
              <button
                class="chip-btn"
                [class.active]="centersService.selectedCategory() === 'شعر'"
                (click)="centersService.setCategoryFilter('شعر')"
              >
                علاجات وترميم الشعر
              </button>
              <button
                class="chip-btn"
                [class.active]="centersService.selectedCategory() === 'بشرة'"
                (click)="centersService.setCategoryFilter('بشرة')"
              >
                نضارة وهيدرافيشال
              </button>
              <button
                class="chip-btn"
                [class.active]="centersService.selectedCategory() === 'سبا'"
                (click)="centersService.setCategoryFilter('سبا')"
              >
                حمام مغربي وسبا
              </button>
              <button
                class="chip-btn"
                [class.active]="centersService.selectedCategory() === 'عرايس'"
                (click)="centersService.setCategoryFilter('عرايس')"
              >
                بكجات العرائس
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Centers List & Cards Grid -->
      <section class="centers-list-section">
        <div class="container-custom">
          <!-- Active search count & my codes link -->
          <div class="results-bar">
            <span>عرض <strong>{{ centersService.filteredCenters().length }}</strong> مركز شريك معتمد في مصر</span>
            <a routerLink="/centers/my-codes" class="my-codes-link">
              <i class="fa-solid fa-ticket"></i> أكوادي وإحالاتي السابقة
            </a>
          </div>

          <!-- Empty State -->
          <div class="empty-state beauty-card" *ngIf="centersService.filteredCenters().length === 0">
            <i class="fa-solid fa-store-slash empty-icon"></i>
            <h3>لم نجد مراكز مطابقة للفلاتر المحددة</h3>
            <p>جربي اختيار منطقة أخرى أو مسح شروط البحث.</p>
            <button (click)="resetFilters()" class="btn-primary">إعادة تعيين الفلاتر</button>
          </div>

          <!-- Centers Grid -->
          <div class="centers-grid" *ngIf="centersService.filteredCenters().length > 0">
            <div
              class="center-card beauty-card animate-fade-in"
              *ngFor="let center of centersService.filteredCenters()"
            >
              <!-- Card Image & Discount Badge -->
              <div class="card-cover-wrap">
                <img [src]="center.avatar_url" [alt]="center.display_name" class="center-cover-img" />
                <span class="discount-badge" *ngIf="center.referral_code">
                  <i class="fa-solid fa-tag"></i> خصم {{ center.referral_code.discount_percentage }}% حصري
                </span>
                <span class="verified-tag">
                  <i class="fa-solid fa-circle-check"></i> شريك معتمد
                </span>
              </div>

              <!-- Card Content -->
              <div class="card-body">
                <div class="card-header-flex">
                  <h3 class="center-title">
                    <a [routerLink]="['/centers', center.id]">{{ center.display_name }}</a>
                  </h3>
                  <div class="center-rating">
                    <i class="fa-solid fa-star"></i>
                    <span>{{ center.rating_avg }}</span>
                    <small>({{ center.rating_count }})</small>
                  </div>
                </div>

                <div class="center-location">
                  <i class="fa-solid fa-location-dot"></i>
                  <span>{{ center.city }}</span>
                </div>

                <p class="center-bio">{{ center.bio }}</p>

                <!-- Specialties Chips -->
                <div class="specialties-chips">
                  <span class="sp-badge" *ngFor="let sp of center.specialties.slice(0, 3)">
                    {{ sp }}
                  </span>
                </div>

                <!-- Footer with Pricing & Claim Button -->
                <div class="card-footer-action">
                  <div class="services-range" *ngIf="center.center_services && center.center_services.length > 0">
                    <small>الخدمات تبدأ من:</small>
                    <strong>{{ center.center_services[0].price_from }} ج.م</strong>
                  </div>
                  <div class="action-buttons">
                    <a [routerLink]="['/centers', center.id]" class="btn-primary card-btn">
                      عرض المركز وكود الخصم <i class="fa-solid fa-chevron-left"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .centers-page {
      padding-bottom: 5rem;
      background: #FAF7F5;
      min-height: 85vh;
    }
    .centers-hero {
      background: radial-gradient(circle at top center, #FDF4F2 0%, var(--color-bg-main) 80%);
      padding: 3.5rem 0 2.5rem;
      border-bottom: 1px solid var(--color-border-light);
    }
    .hero-content {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;
    }
    .badge-emerald {
      background: var(--color-secondary-light);
      color: var(--color-secondary);
      font-weight: 700;
      font-size: 0.85rem;
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      margin-bottom: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .hero-title {
      font-size: 2.5rem;
      font-weight: 900;
      line-height: 1.3;
      margin-bottom: 1rem;
      color: var(--color-text-main);

      @media (max-width: 600px) { font-size: 1.9rem; }
    }
    .highlight-text {
      background: linear-gradient(135deg, var(--color-primary) 0%, #D4AF37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-sub {
      font-size: 1.05rem;
      color: var(--color-text-muted);
      line-height: 1.7;
      margin-bottom: 2rem;
    }

    .center-search-bar {
      position: relative;
      max-width: 620px;
      margin: 0 auto;
    }
    .search-icon {
      position: absolute;
      right: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-text-subtle);
      font-size: 1.1rem;
    }
    .search-input {
      width: 100%;
      padding: 0.85rem 3rem 0.85rem 2.5rem;
      background: #FFFFFF;
      border: 1.5px solid var(--color-border);
      border-radius: 9999px;
      font-family: inherit;
      font-size: 0.95rem;
      outline: none;
      box-shadow: var(--shadow-sm);
      transition: var(--transition-smooth);

      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(196, 109, 91, 0.15);
      }
    }
    .clear-btn {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--color-text-subtle);
      cursor: pointer;
    }

    .filter-chips-section {
      background: #FFFFFF;
      padding: 1.25rem 0;
      border-bottom: 1px solid var(--color-border-light);
    }
    .chips-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .mt-2 { margin-top: 0.75rem; }
    .filter-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-text-muted);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      i { color: var(--color-primary); }
    }
    .chips-scroll {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.2rem;
    }
    .chip-btn {
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      background: #FAF7F5;
      border: 1px solid var(--color-border);
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-text-main);
      cursor: pointer;
      white-space: nowrap;
      transition: var(--transition-smooth);

      &:hover { border-color: var(--color-primary); color: var(--color-primary); }
      &.active {
        background: var(--color-primary);
        color: #FFFFFF;
        border-color: var(--color-primary);
      }
    }

    .centers-list-section {
      padding: 2.5rem 0;
    }
    .results-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      font-size: 0.95rem;
      color: var(--color-text-muted);
    }
    .my-codes-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--color-secondary);
      text-decoration: none;
      font-weight: 700;
      background: var(--color-secondary-light);
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      transition: var(--transition-smooth);

      &:hover { background: var(--color-secondary); color: #fff; }
    }

    .centers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 2rem;
    }
    .center-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .card-cover-wrap {
      position: relative;
      width: 100%;
      height: 200px;
      background: #F4EBE4;
    }
    .center-cover-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .center-card:hover .center-cover-img {
      transform: scale(1.05);
    }
    .discount-badge {
      position: absolute;
      top: 14px;
      right: 14px;
      background: #EF4444;
      color: #fff;
      font-size: 0.8rem;
      font-weight: 800;
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .verified-tag {
      position: absolute;
      bottom: 14px;
      left: 14px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      color: #15803D;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.25rem 0.65rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .card-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .card-header-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.4rem;
    }
    .center-title {
      font-size: 1.15rem;
      font-weight: 800;
      line-height: 1.35;
      a {
        color: var(--color-text-main);
        text-decoration: none;
        transition: color 0.2s ease;
        &:hover { color: var(--color-primary); }
      }
    }
    .center-rating {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #D97706;
      font-weight: 800;
      font-size: 0.88rem;
      small { color: var(--color-text-subtle); }
    }
    .center-location {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      color: var(--color-text-muted);
      margin-bottom: 0.75rem;
      i { color: var(--color-primary); }
    }
    .center-bio {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      line-height: 1.5;
      margin-bottom: 1rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .specialties-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.35rem;
      margin-bottom: 1.25rem;
    }
    .sp-badge {
      font-size: 0.72rem;
      background: var(--color-primary-light);
      color: var(--color-primary);
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
      font-weight: 600;
    }

    .card-footer-action {
      margin-top: auto;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-light);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .services-range {
      small { font-size: 0.72rem; color: var(--color-text-subtle); display: block; }
      strong { font-size: 1.05rem; color: var(--color-primary); }
    }
    .card-btn {
      padding: 0.55rem 1.15rem;
      font-size: 0.85rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      .empty-icon { font-size: 3rem; color: var(--color-primary); margin-bottom: 1rem; }
    }
  `]
})
export class CentersNearbyComponent {
  centersService = inject(CentersService);
  referralsService = inject(ReferralsService);

  resetFilters(): void {
    this.centersService.setCityFilter('all');
    this.centersService.setCategoryFilter('all');
    this.centersService.setSearchQuery('');
  }
}
