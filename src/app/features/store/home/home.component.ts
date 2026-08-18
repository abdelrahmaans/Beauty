import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  template: `
    <div class="home-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="container-custom hero-container">
          <div class="hero-content animate-fade-in">
            <span class="hero-badge">
              <i class="fa-solid fa-sparkles"></i> خامات طبيعية وتركيبات علاجية موثوقة
            </span>
            <h1 class="hero-title">
              العناية الفاخرة التي <br />
              <span class="highlight-text">يستحقها شعرك وبشرتك</span>
            </h1>
            <p class="hero-desc">
              تشكيلة مختارة بعناية من أفضل مستحضرات العناية بالشعر، سيرومات النضارة، والمرطبات المصممة لنتائج حقيقية ملموسة من أول أسبوع.
            </p>

            <div class="hero-cta-group">
              <a routerLink="/products" class="btn-primary hero-btn">
                <span>استكشفي المجموعة</span>
                <i class="fa-solid fa-arrow-left"></i>
              </a>
              <a routerLink="/products" [queryParams]="{featured: true}" class="btn-outline">
                <i class="fa-solid fa-fire"></i> الأكثر طلباً
              </a>
            </div>

            <!-- Mini stats / Trust indicators -->
            <div class="hero-stats">
              <div class="stat-box">
                <strong>+15,000</strong>
                <span>عميلة راضية</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-box">
                <strong>100%</strong>
                <span>منتجات أصلية</span>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-box">
                <strong>4.9 ★</strong>
                <span>متوسط التقييمات</span>
              </div>
            </div>
          </div>

          <div class="hero-visual">
            <div class="visual-card main-visual">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=80"
                alt="Luxury Beauty Products"
                class="hero-img"
              />
              <div class="floating-badge badge-offer">
                <div class="offer-icon"><i class="fa-solid fa-tag"></i></div>
                <div>
                  <span class="tag-sub">كود خصم حصري</span>
                  <strong class="tag-title">BEAUTY10 (خصم 10%)</strong>
                </div>
              </div>
              <div class="floating-badge badge-review">
                <div class="stars">★★★★★</div>
                <span>"سيروم الأرجان غيّر طبيعة شعري تماماً!"</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="categories-section">
        <div class="container-custom">
          <div class="section-header">
            <div>
              <span class="section-sub">تصنيفات المتجر</span>
              <h2 class="section-title">تسوقي حسب احتياجك</h2>
            </div>
            <a routerLink="/products" class="view-all-link">
              عرض كل الأقسام <i class="fa-solid fa-arrow-left"></i>
            </a>
          </div>

          <div class="categories-grid">
            <a
              *ngFor="let cat of productsService.categories()"
              [routerLink]="['/products']"
              [queryParams]="{category: cat.slug}"
              class="category-card beauty-card"
            >
              <div class="category-img-wrap">
                <img [src]="cat.image_url" [alt]="cat.name" class="category-img" />
              </div>
              <div class="category-info">
                <h3>{{ cat.name }}</h3>
                <p>{{ cat.description }}</p>
                <span class="explore-btn">تصفح المنتجات <i class="fa-solid fa-chevron-left"></i></span>
              </div>
            </a>
          </div>
        </div>
      </section>

      <!-- Best Sellers / Featured Products Section -->
      <section class="featured-section">
        <div class="container-custom">
          <div class="section-header">
            <div>
              <span class="section-sub">الأكثر طلباً وتقييماً</span>
              <h2 class="section-title">مختارات النضارة والترميم</h2>
            </div>
            <a routerLink="/products" class="view-all-link">
              عرض كل المنتجات <i class="fa-solid fa-arrow-left"></i>
            </a>
          </div>

          <div class="products-grid">
            <app-product-card
              *ngFor="let product of productsService.featuredProducts()"
              [product]="product"
            ></app-product-card>
          </div>
        </div>
      </section>

      <!-- Routine & Beauty Care Banner -->
      <section class="routine-section">
        <div class="container-custom">
          <div class="routine-box glass-panel">
            <div class="routine-text">
              <span class="badge-emerald">نصيحة خبراء التجميل</span>
              <h2>روتين العناية اليومي المتكامل</h2>
              <p>
                الوصول لشعر صحي وبشرة زجاجية خالية من الشوائب يبدأ بالاستمرارية على 3 خطوات أساسية: التنظيف اللطيف، السيروم العلاجي المركز، والترطيب والحماية من أشعة الشمس.
              </p>
              <div class="steps-list">
                <div class="step-item">
                  <span class="step-num">1</span>
                  <div>
                    <strong>تنظيف عميق</strong>
                    <p>غسول أحماض لطيف وشامبو خالٍ من السلفات</p>
                  </div>
                </div>
                <div class="step-item">
                  <span class="step-num">2</span>
                  <div>
                    <strong>ترميم وتغذية</strong>
                    <p>سيروم فيتامين C أو زيت الأرجان المركز</p>
                  </div>
                </div>
                <div class="step-item">
                  <span class="step-num">3</span>
                  <div>
                    <strong>حماية مضاعفة</strong>
                    <p>كريم سيراميد وصن بلوك SPF 50+</p>
                  </div>
                </div>
              </div>
              <a routerLink="/products" [queryParams]="{category: 'treatments-sets'}" class="btn-primary">
                تصفحي مجموعات العناية المتكاملة
              </a>
            </div>
            <div class="routine-image">
              <img
                src="https://images.unsplash.com/photo-1608248597359-53e7787f7d45?auto=format&fit=crop&w=800&q=80"
                alt="Beauty Routine Steps"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-page {
      padding-bottom: 3rem;
    }
    .hero-section {
      padding: 4rem 0 5rem;
      background: radial-gradient(circle at top right, #FDF4F2 0%, var(--color-bg-main) 70%);
      overflow: hidden;
    }
    .hero-container {
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      align-items: center;
      gap: 3.5rem;

      @media (max-width: 960px) {
        grid-template-columns: 1fr;
        gap: 2.5rem;
      }
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--color-primary-light);
      color: var(--color-primary);
      padding: 0.4rem 1rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(196, 109, 91, 0.2);
    }
    .hero-title {
      font-size: 2.85rem;
      font-weight: 900;
      line-height: 1.25;
      color: var(--color-text-main);
      margin-bottom: 1.25rem;

      @media (max-width: 600px) {
        font-size: 2.15rem;
      }
    }
    .highlight-text {
      background: linear-gradient(135deg, var(--color-primary) 0%, #D4AF37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-desc {
      font-size: 1.05rem;
      color: var(--color-text-muted);
      line-height: 1.7;
      margin-bottom: 2rem;
      max-width: 540px;
    }
    .hero-cta-group {
      display: flex;
      gap: 1rem;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
    }
    .hero-btn {
      padding: 0.9rem 2rem;
      font-size: 1.05rem;
    }
    .hero-stats {
      display: flex;
      align-items: center;
      gap: 1.75rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--color-border-light);
    }
    .stat-box {
      display: flex;
      flex-direction: column;

      strong {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--color-text-main);
      }
      span {
        font-size: 0.8rem;
        color: var(--color-text-subtle);
      }
    }
    .stat-divider {
      width: 1px;
      height: 36px;
      background: var(--color-border);
    }
    .hero-visual {
      position: relative;
    }
    .main-visual {
      position: relative;
      border-radius: 28px;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
      border: 6px solid #FFFFFF;
    }
    .hero-img {
      width: 100%;
      height: 480px;
      object-fit: cover;
      display: block;
    }
    .floating-badge {
      position: absolute;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 0.75rem 1.15rem;
      border-radius: 18px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.8);
      z-index: 2;
    }
    .badge-offer {
      top: 24px;
      right: 24px;
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .offer-icon {
        width: 38px;
        height: 38px;
        border-radius: 12px;
        background: var(--color-primary-light);
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
      }
      .tag-sub {
        font-size: 0.7rem;
        color: var(--color-text-subtle);
        display: block;
      }
      .tag-title {
        font-size: 0.88rem;
        color: var(--color-text-main);
      }
    }
    .badge-review {
      bottom: 24px;
      left: 24px;
      max-width: 260px;

      .stars {
        color: #F59E0B;
        font-size: 0.85rem;
        margin-bottom: 0.2rem;
      }
      span {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--color-text-main);
      }
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2.25rem;
    }
    .section-sub {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-primary);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.35rem;
      display: block;
    }
    .section-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--color-text-main);
    }
    .view-all-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 700;
      font-size: 0.95rem;
      transition: var(--transition-smooth);

      &:hover {
        gap: 0.7rem;
      }
    }

    .categories-section {
      padding: 4rem 0;
    }
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.75rem;
    }
    .category-card {
      text-decoration: none;
      color: inherit;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
    }
    .category-img-wrap {
      width: 100%;
      height: 180px;
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 1.25rem;
      background: #F4EBE4;
    }
    .category-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .category-card:hover .category-img {
      transform: scale(1.08);
    }
    .category-info {
      h3 {
        font-size: 1.15rem;
        font-weight: 700;
        margin-bottom: 0.4rem;
        color: var(--color-text-main);
      }
      p {
        font-size: 0.82rem;
        color: var(--color-text-muted);
        line-height: 1.4;
        margin-bottom: 1rem;
      }
    }
    .explore-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-primary);
    }

    .featured-section {
      padding: 4rem 0;
      background: #FAF3F0;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.75rem;
    }

    .routine-section {
      padding: 4.5rem 0;
    }
    .routine-box {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 3rem;
      border-radius: 28px;
      padding: 3rem;
      align-items: center;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        padding: 2rem;
      }
    }
    .routine-text {
      h2 {
        font-size: 1.85rem;
        font-weight: 800;
        margin-top: 0.75rem;
        margin-bottom: 1rem;
      }
      p {
        color: var(--color-text-muted);
        font-size: 0.95rem;
        line-height: 1.6;
        margin-bottom: 1.75rem;
      }
    }
    .steps-list {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;

      .step-num {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: var(--color-primary);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.95rem;
        flex-shrink: 0;
      }
      strong {
        font-size: 0.95rem;
        display: block;
      }
      p {
        font-size: 0.82rem;
        color: var(--color-text-subtle);
        margin: 0;
      }
    }
    .routine-image img {
      width: 100%;
      height: 400px;
      object-fit: cover;
      border-radius: 20px;
      box-shadow: var(--shadow-md);
    }
  `]
})
export class HomeComponent {
  productsService = inject(ProductsService);
  cart = inject(CartService);
}
