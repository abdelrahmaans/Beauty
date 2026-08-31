import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BannersService } from '../../../core/services/banners.service';
import { CartService } from '../../../core/services/cart.service';
import { Banner } from '../../../core/models';

@Component({
  selector: 'app-homepage-banners',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="homepage-banners-section" *ngIf="bannersService.activeBanners().length > 0">
      <div class="container-custom">
        <div class="banners-carousel-container" (mouseenter)="pauseAutoPlay()" (mouseleave)="startAutoPlay()">
          <!-- Carousel Slides -->
          <div class="slides-track" [style.transform]="'translateX(' + (currentIndex * 100) + '%)'">
            <div
              class="banner-slide"
              *ngFor="let banner of bannersService.activeBanners(); let idx = index"
              [class.active]="currentIndex === idx"
            >
              <div class="slide-bg-wrap">
                <img [src]="banner.image_storage_path" [alt]="banner.title" class="slide-bg-img" />
                <div class="slide-overlay-gradient"></div>
              </div>

              <!-- Slide Text & Call-To-Action -->
              <div class="slide-content-box animate-fade-in">
                <!-- Type Tag -->
                <div class="slide-badge-row">
                  <span class="slide-badge coupon" *ngIf="banner.type === 'coupon'">
                    <i class="fa-solid fa-ticket"></i> عرض حصري بكود خصم
                  </span>
                  <span class="slide-badge announcement" *ngIf="banner.type === 'announcement'">
                    <i class="fa-solid fa-sparkles"></i> إعلان وفعالية خاصة
                  </span>

                  <!-- Code Pill if coupon -->
                  <span class="coupon-code-pill" *ngIf="banner.type === 'coupon' && banner.coupon">
                    كود: <strong>{{ banner.coupon.code }}</strong>
                  </span>
                </div>

                <h2 class="slide-title">{{ banner.title }}</h2>
                <p class="slide-subtitle" *ngIf="banner.subtitle">{{ banner.subtitle }}</p>

                <!-- CTA Actions -->
                <div class="slide-actions">
                  <button
                    (click)="handleBannerCta(banner)"
                    class="btn-primary banner-cta-btn"
                  >
                    <span>{{ banner.cta_text || (banner.type === 'coupon' ? 'تسوقي بالخصم الآن' : 'استكشفي الآن') }}</span>
                    <i class="fa-solid fa-arrow-left"></i>
                  </button>

                  <span class="copied-feedback" *ngIf="copiedBannerId === banner.id">
                    <i class="fa-solid fa-check"></i> تم نسخ كود الخصم!
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Controls: Prev / Next Buttons -->
          <button (click)="prevSlide()" class="carousel-control prev" aria-label="السابق">
            <i class="fa-solid fa-chevron-right"></i>
          </button>
          <button (click)="nextSlide()" class="carousel-control next" aria-label="التالي">
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <!-- Slide Indicators Dots -->
          <div class="carousel-indicators" *ngIf="bannersService.activeBanners().length > 1">
            <button
              *ngFor="let b of bannersService.activeBanners(); let i = index"
              class="dot-indicator"
              [class.active]="currentIndex === i"
              (click)="goToSlide(i)"
              [attr.aria-label]="'الانتقال للشريحة ' + (i + 1)"
            ></button>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .homepage-banners-section {
      padding: 1.5rem 0 2.5rem;
    }
    .banners-carousel-container {
      position: relative;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 12px 35px rgba(30, 27, 24, 0.12);
      height: 440px;
      background: #1E1B18;

      @media (max-width: 900px) { height: 380px; }
      @media (max-width: 600px) { height: 340px; border-radius: 18px; }
    }
    .slides-track {
      display: flex;
      height: 100%;
      transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
      direction: ltr; /* Ensure predictable slide arithmetic with translateX */
    }
    .banner-slide {
      min-width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: center;
      direction: rtl; /* Restore Arabic RTL inside slide */
    }
    .slide-bg-wrap {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 1;
    }
    .slide-bg-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    .slide-overlay-gradient {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, rgba(30, 27, 24, 0.88) 0%, rgba(30, 27, 24, 0.65) 50%, rgba(30, 27, 24, 0.25) 100%);
    }

    .slide-content-box {
      position: relative;
      z-index: 2;
      max-width: 650px;
      padding: 2.5rem 3.5rem;
      color: #FFFFFF;

      @media (max-width: 768px) { padding: 2rem; max-width: 100%; }
      @media (max-width: 480px) { padding: 1.5rem; }
    }
    .slide-badge-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .slide-badge {
      font-size: 0.78rem;
      font-weight: 800;
      padding: 0.3rem 0.85rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;

      &.coupon { background: #EF4444; color: #FFFFFF; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35); }
      &.announcement { background: var(--color-secondary); color: #FFFFFF; }
    }
    .coupon-code-pill {
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      border: 1px dashed rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      color: #FFF;
      strong { letter-spacing: 1px; color: #FDE68A; }
    }

    .slide-title {
      font-size: 2.1rem;
      font-weight: 900;
      line-height: 1.35;
      margin-bottom: 0.85rem;
      text-shadow: 0 2px 8px rgba(0,0,0,0.3);

      @media (max-width: 768px) { font-size: 1.65rem; }
      @media (max-width: 480px) { font-size: 1.35rem; }
    }
    .slide-subtitle {
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.65;
      margin-bottom: 1.75rem;
      max-width: 540px;

      @media (max-width: 768px) { font-size: 0.88rem; margin-bottom: 1.25rem; }
      @media (max-width: 480px) {
        font-size: 0.8rem;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .slide-actions {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      flex-wrap: wrap;
    }
    .banner-cta-btn {
      padding: 0.85rem 1.75rem;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      box-shadow: 0 6px 20px rgba(196, 109, 91, 0.4);

      @media (max-width: 480px) { padding: 0.65rem 1.25rem; font-size: 0.85rem; }
    }
    .copied-feedback {
      background: rgba(16, 185, 129, 0.9);
      color: #fff;
      font-size: 0.82rem;
      font-weight: 700;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      animation: fadeIn 0.3s ease;
    }

    .carousel-control {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #FFFFFF;
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-smooth);
      z-index: 5;

      &:hover { background: rgba(255, 255, 255, 0.9); color: var(--color-primary); }
      &.prev { right: 18px; }
      &.next { left: 18px; }

      @media (max-width: 600px) { display: none; }
    }

    .carousel-indicators {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 0.5rem;
      z-index: 5;
    }
    .dot-indicator {
      width: 10px;
      height: 10px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.4);
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;

      &.active {
        width: 28px;
        background: var(--color-primary);
      }
    }
  `]
})
export class HomepageBannersComponent implements OnInit, OnDestroy {
  bannersService = inject(BannersService);
  cartService = inject(CartService);
  router = inject(Router);

  currentIndex: number = 0;
  private autoPlayTimer: any;
  copiedBannerId: string | null = null;

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.pauseAutoPlay();
  }

  startAutoPlay(): void {
    this.pauseAutoPlay();
    this.autoPlayTimer = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  pauseAutoPlay(): void {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  nextSlide(): void {
    const total = this.bannersService.activeBanners().length;
    if (total <= 1) return;
    this.currentIndex = (this.currentIndex + 1) % total;
  }

  prevSlide(): void {
    const total = this.bannersService.activeBanners().length;
    if (total <= 1) return;
    this.currentIndex = (this.currentIndex - 1 + total) % total;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.startAutoPlay();
  }

  handleBannerCta(banner: Banner): void {
    if (banner.type === 'coupon' && banner.coupon) {
      const code = banner.coupon.code;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
      }
      this.copiedBannerId = banner.id;
      setTimeout(() => (this.copiedBannerId = null), 3500);

      // Navigate to products catalog
      this.router.navigate(['/products']);
    } else if (banner.cta_link) {
      if (banner.cta_link.startsWith('http')) {
        window.open(banner.cta_link, '_blank');
      } else {
        this.router.navigateByUrl(banner.cta_link);
      }
    } else {
      this.router.navigate(['/products']);
    }
  }
}
