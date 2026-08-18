import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../core/services/products.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  template: `
    <div class="catalog-page">
      <!-- Breadcrumb & Header -->
      <section class="catalog-header">
        <div class="container-custom">
          <div class="breadcrumb">
            <a routerLink="/">الرئيسية</a>
            <i class="fa-solid fa-chevron-left"></i>
            <span>المتجر والمنتجات</span>
            <ng-container *ngIf="activeCategoryName">
              <i class="fa-solid fa-chevron-left"></i>
              <span class="active-crumb">{{ activeCategoryName }}</span>
            </ng-container>
          </div>

          <div class="header-flex">
            <div>
              <h1 class="page-title">
                {{ activeCategoryName || 'جميع منتجات العناية' }}
              </h1>
              <p class="results-count">
                عرض <strong>{{ productsService.filteredProducts().length }}</strong> منتج متوفر
              </p>
            </div>

            <!-- Sort Controls -->
            <div class="sort-control">
              <label>الترتيب حسب:</label>
              <select
                [ngModel]="productsService.sortBy()"
                (ngModelChange)="productsService.setSortBy($event)"
                class="sort-select"
              >
                <option value="popular">الأكثر طلباً ومبيعاً</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="price_low">السعر: من الأقل للأعلى</option>
                <option value="price_high">السعر: من الأعلى للأقل</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Category Filter Pills Bar -->
      <section class="category-pills-bar">
        <div class="container-custom">
          <div class="pills-scroll">
            <button
              class="pill-btn"
              [class.active]="!productsService.selectedCategorySlug()"
              (click)="onSelectCategory(null)"
            >
              <i class="fa-solid fa-layer-group"></i> كل المنتجات
            </button>
            <button
              *ngFor="let cat of productsService.categories()"
              class="pill-btn"
              [class.active]="productsService.selectedCategorySlug() === cat.slug"
              (click)="onSelectCategory(cat.slug)"
            >
              {{ cat.name }}
            </button>
          </div>
        </div>
      </section>

      <!-- Main Products Grid & Search/Filter info -->
      <section class="catalog-body">
        <div class="container-custom">
          <!-- Active Search Notice -->
          <div class="search-notice" *ngIf="productsService.searchQuery()">
            <span>نتائج البحث عن: "<strong>{{ productsService.searchQuery() }}</strong>"</span>
            <button (click)="productsService.setSearchQuery('')" class="clear-search-btn">
              مسح البحث <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="productsService.filteredProducts().length === 0">
            <div class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
            <h3>لم نجد منتجات مطابقة</h3>
            <p>جربي البحث بكلمات أخرى أو إزالة الفلاتر الحالية.</p>
            <button (click)="resetFilters()" class="btn-primary">إعادة تعيين الفلاتر</button>
          </div>

          <!-- Products Grid -->
          <div class="products-grid" *ngIf="productsService.filteredProducts().length > 0">
            <app-product-card
              *ngFor="let product of productsService.filteredProducts()"
              [product]="product"
            ></app-product-card>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .catalog-page {
      padding-bottom: 5rem;
    }
    .catalog-header {
      background: #FFFFFF;
      border-bottom: 1px solid var(--color-border-light);
      padding: 1.5rem 0 2rem;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: var(--color-text-subtle);
      margin-bottom: 1rem;

      a {
        color: var(--color-text-muted);
        text-decoration: none;
        &:hover { color: var(--color-primary); }
      }
      i { font-size: 0.65rem; }
      .active-crumb {
        color: var(--color-primary);
        font-weight: 700;
      }
    }
    .header-flex {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      flex-wrap: wrap;
      gap: 1.25rem;
    }
    .page-title {
      font-size: 2.1rem;
      font-weight: 800;
      color: var(--color-text-main);
      margin-bottom: 0.25rem;
    }
    .results-count {
      font-size: 0.88rem;
      color: var(--color-text-muted);
    }
    .sort-control {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      label {
        font-size: 0.88rem;
        font-weight: 600;
        color: var(--color-text-muted);
      }
    }
    .sort-select {
      padding: 0.55rem 1.25rem;
      border: 1.5px solid var(--color-border);
      border-radius: 9999px;
      background: var(--color-bg-surface);
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--color-text-main);
      outline: none;
      cursor: pointer;
      transition: var(--transition-smooth);

      &:focus {
        border-color: var(--color-primary);
      }
    }

    .category-pills-bar {
      background: #FAF7F5;
      padding: 1rem 0;
      border-bottom: 1px solid var(--color-border-light);
    }
    .pills-scroll {
      display: flex;
      gap: 0.75rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }
    .pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.55rem 1.25rem;
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: 9999px;
      font-family: inherit;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--color-text-main);
      cursor: pointer;
      white-space: nowrap;
      transition: var(--transition-smooth);

      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
      &.active {
        background: var(--color-primary);
        color: #FFFFFF;
        border-color: var(--color-primary);
        box-shadow: 0 3px 10px rgba(196, 109, 91, 0.3);
      }
    }

    .catalog-body {
      padding-top: 2.5rem;
    }
    .search-notice {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--color-primary-light);
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      font-size: 0.9rem;
      color: var(--color-primary);
    }
    .clear-search-btn {
      background: none;
      border: none;
      color: var(--color-primary);
      font-weight: 700;
      cursor: pointer;
      font-size: 0.85rem;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.75rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: #FFFFFF;
      border-radius: 20px;
      border: 1px dashed var(--color-border);

      .empty-icon {
        width: 65px;
        height: 65px;
        border-radius: 50%;
        background: var(--color-primary-light);
        color: var(--color-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }
      h3 {
        font-size: 1.25rem;
        margin-bottom: 0.5rem;
      }
      p {
        font-size: 0.9rem;
        color: var(--color-text-muted);
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class CatalogComponent implements OnInit {
  productsService = inject(ProductsService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.productsService.setCategoryFilter(params['category']);
      }
    });
  }

  get activeCategoryName(): string | undefined {
    const slug = this.productsService.selectedCategorySlug();
    if (!slug) return undefined;
    return this.productsService.categories().find(c => c.slug === slug)?.name;
  }

  onSelectCategory(slug: string | null): void {
    this.productsService.setCategoryFilter(slug);
  }

  resetFilters(): void {
    this.productsService.setCategoryFilter(null);
    this.productsService.setSearchQuery('');
    this.productsService.setSortBy('popular');
  }
}
