import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../core/services/products.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductCardComponent],
  template: `
    <div class="product-details-page" *ngIf="product">
      <!-- Breadcrumb -->
      <div class="container-custom py-3">
        <div class="breadcrumb">
          <a routerLink="/">الرئيسية</a>
          <i class="fa-solid fa-chevron-left"></i>
          <a routerLink="/products">المتجر</a>
          <i class="fa-solid fa-chevron-left"></i>
          <span class="active-crumb">{{ product.name }}</span>
        </div>
      </div>

      <!-- Main Product Section -->
      <section class="main-details-section">
        <div class="container-custom">
          <div class="details-grid">
            <!-- Product Gallery -->
            <div class="gallery-column">
              <div class="main-image-frame beauty-card">
                <img [src]="product.main_image" [alt]="product.name" class="main-img" />
                <span class="discount-tag" *ngIf="discountPercentage > 0">
                  خصم {{ discountPercentage }}%
                </span>
              </div>
            </div>

            <!-- Product Specs & Purchase Box -->
            <div class="info-column">
              <div class="brand-rating-row">
                <span class="brand-badge">{{ product.brand || 'BEAUTY Care' }}</span>
                <div class="rating-stars" *ngIf="product.rating_avg">
                  <span class="stars-gold">★★★★★</span>
                  <span class="rating-val">{{ product.rating_avg }}</span>
                  <span class="reviews-count">({{ product.reviews_count }} تقييم)</span>
                </div>
              </div>

              <h1 class="product-title">{{ product.name }}</h1>
              <p class="product-name-en" *ngIf="product.name_en">{{ product.name_en }}</p>

              <!-- Price Box -->
              <div class="price-box">
                <div class="main-price">
                  {{ product.discount_price ?? product.price }} <small>ج.م</small>
                </div>
                <div class="old-price-box" *ngIf="product.discount_price">
                  <span class="old-val">{{ product.price }} ج.م</span>
                  <span class="save-val">وفّرتِ {{ product.price - product.discount_price }} ج.م</span>
                </div>
              </div>

              <!-- Stock & Quick Info -->
              <div class="stock-banner" [class.low-stock]="product.stock_quantity <= 5">
                <i class="fa-solid fa-circle-check" *ngIf="product.stock_quantity > 5"></i>
                <i class="fa-solid fa-triangle-exclamation" *ngIf="product.stock_quantity <= 5"></i>
                <span>
                  {{ product.stock_quantity > 5 ? 'المنتج متوفر في المخزن وجاهز للشحن الفوري' : 'متبقي كمية محدودة جداً (' + product.stock_quantity + ' قطع)' }}
                </span>
              </div>

              <!-- Short Description -->
              <p class="short-desc">{{ product.description }}</p>

              <!-- Add to Cart Action Bar -->
              <div class="purchase-actions">
                <div class="qty-selector">
                  <button (click)="decreaseQty()" class="qty-btn"><i class="fa-solid fa-minus"></i></button>
                  <span class="qty-num">{{ quantity }}</span>
                  <button (click)="increaseQty()" class="qty-btn"><i class="fa-solid fa-plus"></i></button>
                </div>

                <button (click)="addToCart()" class="btn-primary add-cart-btn">
                  <i class="fa-solid fa-bag-shopping"></i>
                  <span>إضافة إلى السلة ({{ (product.discount_price ?? product.price) * quantity }} ج.م)</span>
                </button>
              </div>

              <!-- Loyalty Points Earned -->
              <div class="loyalty-earn-card">
                <i class="fa-solid fa-gem gem-icon"></i>
                <div>
                  <strong>اكسبي {{ Math.floor(((product.discount_price ?? product.price) * quantity) / 10) }} نقطة ولاء</strong>
                  <p>تضاف لمحفظتك بعد استلام الطلب وتتحول لخصومات مباشرة.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Details Tabs: Ingredients, How to Use, Reviews -->
      <section class="tabs-section">
        <div class="container-custom">
          <div class="tabs-header">
            <button
              class="tab-btn"
              [class.active]="activeTab === 'ingredients'"
              (click)="activeTab = 'ingredients'"
            >
              <i class="fa-solid fa-flask-vial"></i> المكونات الفعالة
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab === 'usage'"
              (click)="activeTab = 'usage'"
            >
              <i class="fa-solid fa-hand-sparkles"></i> طريقة الاستخدام
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab === 'reviews'"
              (click)="activeTab = 'reviews'"
            >
              <i class="fa-solid fa-comments"></i> التقييمات والآراء ({{ product.reviews_count }})
            </button>
          </div>

          <div class="tab-content beauty-card">
            <!-- Ingredients Tab -->
            <div *ngIf="activeTab === 'ingredients'" class="animate-fade-in tab-pane">
              <h3>المكونات الطبيعية والفعالة</h3>
              <p>{{ product.ingredients || 'تركيبة فريدة غنية بالمستخلصات الطبيعية المختبرة جلدياً لضمان الفاعلية والأمان التام.' }}</p>
            </div>

            <!-- How to Use Tab -->
            <div *ngIf="activeTab === 'usage'" class="animate-fade-in tab-pane">
              <h3>طريقة الاستخدام للحصول على أفضل نتيجة</h3>
              <p>{{ product.how_to_use || 'يستخدم بشكل منتظم للحصول على نتائج ملحوظة وفعالة.' }}</p>
            </div>

            <!-- Reviews Tab -->
            <div *ngIf="activeTab === 'reviews'" class="animate-fade-in tab-pane">
              <div class="reviews-header-summary">
                <div class="big-rating">
                  <strong>{{ product.rating_avg }}</strong>
                  <div class="stars-gold">★★★★★</div>
                  <span>بناءً على {{ product.reviews_count }} تقييم موثق</span>
                </div>
                <div class="reviews-list">
                  <div class="review-item">
                    <div class="rev-user">
                      <div class="user-avatar">ن</div>
                      <div>
                        <strong>نورهان كمال</strong>
                        <span class="rev-date">منذ 3 أيام • مشتري مؤكد</span>
                      </div>
                    </div>
                    <div class="stars-gold">★★★★★</div>
                    <p class="rev-comment">ممتاز جداً وفرق معايا من أول أسبوع، والريحة تحفة والشحن وصل في يومين بالظبط!</p>
                  </div>
                  <div class="review-item">
                    <div class="rev-user">
                      <div class="user-avatar">م</div>
                      <div>
                        <strong>مريم سامي</strong>
                        <span class="rev-date">منذ أسبوع • مشتري مؤكد</span>
                      </div>
                    </div>
                    <div class="stars-gold">★★★★★</div>
                    <p class="rev-comment">منتج أصلي وتغليف محترم جداً، هكرر الشراء أكيد ونقاط الولاء ميزة ممتازة.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Products -->
      <section class="related-section" *ngIf="relatedProducts.length > 0">
        <div class="container-custom">
          <div class="section-header">
            <div>
              <span class="section-sub">قد يعجبكِ أيضاً</span>
              <h2 class="section-title">منتجات متكاملة لروتينك</h2>
            </div>
          </div>
          <div class="products-grid">
            <app-product-card
              *ngFor="let rel of relatedProducts"
              [product]="rel"
            ></app-product-card>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .product-details-page {
      padding-bottom: 5rem;
    }
    .py-3 { padding-top: 1.25rem; padding-bottom: 1.25rem; }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--color-text-subtle);

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
    .main-details-section {
      padding: 1.5rem 0 3.5rem;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1.15fr;
      gap: 3.5rem;
      align-items: flex-start;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        gap: 2rem;
      }
    }
    .main-image-frame {
      position: relative;
      border-radius: 24px;
      overflow: hidden;
      background: #FFFFFF;
      padding: 1rem;
    }
    .main-img {
      width: 100%;
      height: 480px;
      object-fit: cover;
      border-radius: 18px;
      display: block;
    }
    .discount-tag {
      position: absolute;
      top: 24px;
      right: 24px;
      background: #EF4444;
      color: #fff;
      font-weight: 800;
      font-size: 0.88rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
    }

    .brand-rating-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .brand-badge {
      background: var(--color-primary-light);
      color: var(--color-primary);
      font-weight: 700;
      font-size: 0.82rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
    }
    .stars-gold {
      color: #F59E0B;
      font-size: 0.95rem;
      letter-spacing: 2px;
    }
    .rating-val {
      font-weight: 800;
      font-size: 0.9rem;
      margin-right: 0.4rem;
    }
    .reviews-count {
      color: var(--color-text-subtle);
      font-size: 0.8rem;
      margin-right: 0.25rem;
    }
    .product-title {
      font-size: 1.85rem;
      font-weight: 800;
      line-height: 1.35;
      color: var(--color-text-main);
      margin-bottom: 0.35rem;
    }
    .product-name-en {
      font-family: var(--font-latin);
      font-size: 0.95rem;
      color: var(--color-text-subtle);
      margin-bottom: 1.5rem;
    }
    .price-box {
      display: flex;
      align-items: baseline;
      gap: 1.25rem;
      margin-bottom: 1.25rem;
      background: #FAF7F5;
      padding: 1rem 1.25rem;
      border-radius: 16px;
    }
    .main-price {
      font-size: 2rem;
      font-weight: 900;
      color: var(--color-primary);

      small { font-size: 1rem; font-weight: 700; }
    }
    .old-price-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .old-val {
      font-size: 1.1rem;
      color: var(--color-text-subtle);
      text-decoration: line-through;
    }
    .save-val {
      font-size: 0.8rem;
      font-weight: 700;
      background: #FEE2E2;
      color: #EF4444;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;
    }
    .stock-banner {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      color: var(--color-secondary);
      font-weight: 600;
      margin-bottom: 1.25rem;

      &.low-stock { color: #EA580C; }
    }
    .short-desc {
      font-size: 0.95rem;
      color: var(--color-text-muted);
      line-height: 1.7;
      margin-bottom: 2rem;
    }
    .purchase-actions {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;

      @media (max-width: 600px) {
        flex-direction: column;
      }
    }
    .qty-selector {
      display: inline-flex;
      align-items: center;
      border: 1.5px solid var(--color-border);
      border-radius: 9999px;
      background: #FFFFFF;
      padding: 0.2rem;
    }
    .qty-btn {
      width: 38px;
      height: 38px;
      border: none;
      background: #FAF7F5;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      color: var(--color-text-main);
      transition: background 0.2s ease;
      &:hover { background: var(--color-primary-light); color: var(--color-primary); }
    }
    .qty-num {
      font-size: 1.05rem;
      font-weight: 800;
      padding: 0 1rem;
    }
    .add-cart-btn {
      flex: 1;
      font-size: 1.05rem;
      padding: 0.85rem 1.5rem;
    }
    .loyalty-earn-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      padding: 0.85rem 1.25rem;
      border-radius: 14px;

      .gem-icon {
        font-size: 1.5rem;
        color: #D97706;
      }
      strong {
        font-size: 0.9rem;
        color: #92400E;
        display: block;
      }
      p {
        font-size: 0.78rem;
        color: #B45309;
        margin: 0;
      }
    }

    .tabs-section {
      padding: 2.5rem 0;
    }
    .tabs-header {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.25rem;
      border-bottom: 1px solid var(--color-border-light);
      padding-bottom: 0.5rem;
      overflow-x: auto;
    }
    .tab-btn {
      background: none;
      border: none;
      padding: 0.75rem 1.25rem;
      font-family: inherit;
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--color-text-muted);
      cursor: pointer;
      border-radius: 8px;
      transition: var(--transition-smooth);
      white-space: nowrap;

      &.active {
        color: var(--color-primary);
        background: var(--color-primary-light);
      }
    }
    .tab-content {
      padding: 2rem;
    }
    .tab-pane h3 {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .tab-pane p {
      font-size: 0.95rem;
      color: var(--color-text-muted);
      line-height: 1.7;
    }
    .reviews-header-summary {
      display: grid;
      grid-template-columns: 240px 1fr;
      gap: 2.5rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
    .big-rating {
      text-align: center;
      padding: 1.5rem;
      background: #FAF7F5;
      border-radius: 16px;

      strong {
        font-size: 3rem;
        font-weight: 900;
        color: var(--color-text-main);
        display: block;
        line-height: 1;
      }
      span {
        font-size: 0.8rem;
        color: var(--color-text-subtle);
        margin-top: 0.5rem;
        display: block;
      }
    }
    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .review-item {
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--color-border-light);
    }
    .rev-user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.4rem;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-primary-light);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
    }
    .rev-date {
      font-size: 0.75rem;
      color: var(--color-text-subtle);
      display: block;
    }
    .rev-comment {
      font-size: 0.88rem;
      color: var(--color-text-main);
      margin-top: 0.35rem;
    }
    .related-section {
      padding: 3rem 0;
      background: #FAF3F0;
    }
    .section-header {
      margin-bottom: 1.75rem;
    }
    .section-sub {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--color-primary);
      display: block;
    }
    .section-title {
      font-size: 1.75rem;
      font-weight: 800;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.75rem;
    }
  `]
})
export class ProductDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productsService = inject(ProductsService);
  private cart = inject(CartService);

  product: Product | undefined;
  quantity: number = 1;
  activeTab: 'ingredients' | 'usage' | 'reviews' = 'ingredients';
  Math = Math;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.product = this.productsService.getProductBySlug(slug);
      }
    });
  }

  get discountPercentage(): number {
    if (!this.product || !this.product.discount_price || this.product.discount_price >= this.product.price) {
      return 0;
    }
    return Math.round(((this.product.price - this.product.discount_price) / this.product.price) * 100);
  }

  get relatedProducts(): Product[] {
    if (!this.product) return [];
    return this.productsService.products()
      .filter(p => p.id !== this.product?.id && (p.category_id === this.product?.category_id || p.is_featured))
      .slice(0, 4);
  }

  increaseQty(): void {
    if (this.product && this.quantity < this.product.stock_quantity) {
      this.quantity++;
    }
  }

  decreaseQty(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart(): void {
    if (this.product) {
      this.cart.addToCart(this.product, this.quantity);
    }
  }
}
