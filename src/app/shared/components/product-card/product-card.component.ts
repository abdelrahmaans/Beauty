import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../core/models';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-card beauty-card" *ngIf="product">
      <!-- Top Image with Badges -->
      <div class="image-wrapper">
        <a [routerLink]="['/products', product.slug]" class="image-link">
          <img [src]="product.main_image" [alt]="product.name" class="product-img" loading="lazy" />
        </a>

        <!-- Discount / Best Seller Badges -->
        <div class="badges-stack">
          <span class="badge-pill discount-badge" *ngIf="discountPercentage > 0">
            خصم {{ discountPercentage }}%
          </span>
          <span class="badge-pill featured-badge" *ngIf="product.is_featured">
            <i class="fa-solid fa-fire"></i> الأكثر طلباً
          </span>
        </div>

        <!-- Quick Action Floating Button -->
        <button
          (click)="onAddToCart($event)"
          class="quick-add-btn"
          title="إضافة سريعة للسلة"
        >
          <i class="fa-solid fa-plus"></i>
          <span>إضافة للسلة</span>
        </button>
      </div>

      <!-- Card Info -->
      <div class="card-body">
        <div class="category-brand">
          <span class="brand-name">{{ product.brand || 'BEAUTY Care' }}</span>
          <div class="rating-box" *ngIf="product.rating_avg">
            <i class="fa-solid fa-star star-icon"></i>
            <span class="rating-num">{{ product.rating_avg }}</span>
            <span class="reviews-num" *ngIf="product.reviews_count">({{ product.reviews_count }})</span>
          </div>
        </div>

        <h3 class="product-title">
          <a [routerLink]="['/products', product.slug]">{{ product.name }}</a>
        </h3>

        <div class="price-container">
          <div class="prices">
            <span class="current-price">
              {{ (product.discount_price ?? product.price) }} <small>ج.م</small>
            </span>
            <span class="old-price" *ngIf="product.discount_price">
              {{ product.price }} ج.م
            </span>
          </div>
          <span class="stock-status" [class.low-stock]="product.stock_quantity <= 5">
            {{ product.stock_quantity > 5 ? 'متوفر' : 'باقي كمية محدودة' }}
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }
    .image-wrapper {
      position: relative;
      width: 100%;
      padding-top: 100%; /* 1:1 Aspect Ratio */
      background: #F8F4F0;
      overflow: hidden;
    }
    .image-link {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: block;
    }
    .product-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .product-card:hover .product-img {
      transform: scale(1.06);
    }
    .badges-stack {
      position: absolute;
      top: 12px;
      right: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      z-index: 2;
    }
    .badge-pill {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0.25rem 0.6rem;
      border-radius: 9999px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .discount-badge {
      background: #EF4444;
      color: #FFFFFF;
    }
    .featured-badge {
      background: #1E1B18;
      color: #FFD966;
      display: inline-flex;
      align-items: center;
      gap: 3px;
    }
    .quick-add-btn {
      position: absolute;
      bottom: 12px;
      left: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(8px);
      border: 1px solid var(--color-border);
      color: var(--color-text-main);
      padding: 0.55rem 0.85rem;
      border-radius: 9999px;
      font-family: inherit;
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      cursor: pointer;
      opacity: 0;
      transform: translateY(10px);
      transition: var(--transition-smooth);
      box-shadow: 0 4px 14px rgba(0,0,0,0.08);
      z-index: 3;

      &:hover {
        background: var(--color-primary);
        color: #FFFFFF;
        border-color: var(--color-primary);
      }
    }
    .product-card:hover .quick-add-btn {
      opacity: 1;
      transform: translateY(0);
    }
    .card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .category-brand {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.4rem;
    }
    .brand-name {
      font-size: 0.78rem;
      color: var(--color-text-subtle);
      font-weight: 600;
    }
    .rating-box {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .star-icon {
      color: #F59E0B;
      font-size: 0.72rem;
    }
    .reviews-num {
      color: var(--color-text-subtle);
      font-size: 0.72rem;
    }
    .product-title {
      font-size: 0.95rem;
      font-weight: 700;
      line-height: 1.4;
      margin-bottom: 0.85rem;
      min-height: 2.7rem;

      a {
        color: var(--color-text-main);
        text-decoration: none;
        transition: color 0.2s ease;

        &:hover {
          color: var(--color-primary);
        }
      }
    }
    .price-container {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-border-light);
    }
    .prices {
      display: flex;
      align-items: baseline;
      gap: 0.5rem;
    }
    .current-price {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-primary);

      small {
        font-size: 0.8rem;
        font-weight: 600;
      }
    }
    .old-price {
      font-size: 0.85rem;
      color: var(--color-text-subtle);
      text-decoration: line-through;
    }
    .stock-status {
      font-size: 0.75rem;
      color: var(--color-secondary);
      font-weight: 600;

      &.low-stock {
        color: #EA580C;
      }
    }
  `]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  private cart = inject(CartService);

  get discountPercentage(): number {
    if (!this.product.discount_price || this.product.discount_price >= this.product.price) {
      return 0;
    }
    return Math.round(((this.product.price - this.product.discount_price) / this.product.price) * 100);
  }

  onAddToCart(e: Event): void {
    e.stopPropagation();
    this.cart.addToCart(this.product, 1);
  }
}
