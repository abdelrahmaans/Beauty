import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CentersService } from '../../../core/services/centers.service';
import { ReferralsService } from '../../../core/services/referrals.service';
import { AuthService } from '../../../core/services/auth.service';
import { Provider } from '../../../core/models';

@Component({
  selector: 'app-center-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="center-profile-page" *ngIf="center">
      <!-- Breadcrumb -->
      <div class="container-custom py-3">
        <div class="breadcrumb">
          <a routerLink="/">الرئيسية</a>
          <i class="fa-solid fa-chevron-left"></i>
          <a routerLink="/centers">دليل المراكز</a>
          <i class="fa-solid fa-chevron-left"></i>
          <span class="active-crumb">{{ center.display_name }}</span>
        </div>
      </div>

      <!-- Main Profile Header Banner -->
      <section class="profile-hero">
        <div class="container-custom">
          <div class="hero-grid">
            <!-- Left Info -->
            <div class="center-main-info">
              <div class="badge-row">
                <span class="badge-pill verified"><i class="fa-solid fa-circle-check"></i> مركز شريك معتمد</span>
                <span class="badge-pill discount" *ngIf="center.referral_code">
                  <i class="fa-solid fa-tag"></i> خصم {{ center.referral_code.discount_percentage }}% لعميلات المنصة
                </span>
              </div>

              <h1 class="center-title">{{ center.display_name }}</h1>
              <div class="rating-city-row">
                <div class="stars-gold">★ {{ center.rating_avg }} <small>({{ center.rating_count }} تقييم موثق)</small></div>
                <div class="divider">•</div>
                <div class="city-tag"><i class="fa-solid fa-location-dot"></i> {{ center.city }}</div>
              </div>

              <p class="center-bio-full">{{ center.bio }}</p>

              <!-- Quick details box -->
              <div class="details-mini-box glass-panel">
                <div class="d-item">
                  <i class="fa-solid fa-map-location-dot"></i>
                  <div>
                    <span class="label">العنوان بالتفصيل:</span>
                    <strong>{{ center.address_line || center.city }}</strong>
                  </div>
                </div>
                <div class="d-item">
                  <i class="fa-regular fa-clock"></i>
                  <div>
                    <span class="label">مواعيد العمل:</span>
                    <strong>{{ center.opening_hours || 'يومياً من 11:00 ص حتى 10:00 م' }}</strong>
                  </div>
                </div>
                <div class="d-item">
                  <i class="fa-solid fa-phone"></i>
                  <div>
                    <span class="label">هاتف المركز للحجز والاستفسار:</span>
                    <strong dir="ltr">{{ center.phone }}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Exclusive Promo Code Box -->
            <div class="center-promo-column">
              <div class="exclusive-promo-card beauty-card" *ngIf="center.referral_code">
                <div class="promo-badge-top">
                  <i class="fa-solid fa-ticket"></i>
                  <span>عرض حصري من منصة بيوتي</span>
                </div>

                <div class="discount-lead">
                  <h3>خصم {{ center.referral_code.discount_percentage }}%</h3>
                  <p>{{ center.referral_code.discount_description }}</p>
                </div>

                <div class="code-preview-frame">
                  <span class="code-txt">{{ center.referral_code.code }}</span>
                  <small>كود معتمد لدى المركز</small>
                </div>

                <button (click)="openClaimModal()" class="btn-primary claim-btn">
                  <i class="fa-solid fa-gift"></i> احصلي على كود الخصم الآن
                </button>

                <p class="claim-notes">
                  <i class="fa-solid fa-circle-info"></i> احفظي الكود وأظهريه لموظفة الاستقبال أو عند الحجز الهاتفي للاستفادة من الخصم.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Center Gallery & Photos -->
      <section class="gallery-section" *ngIf="center.photos && center.photos.length > 0">
        <div class="container-custom">
          <h2 class="section-title"><i class="fa-solid fa-images"></i> صور وأجواء المركز</h2>
          <div class="photos-grid">
            <div class="photo-item" *ngFor="let photo of center.photos">
              <img [src]="photo" [alt]="center.display_name" class="gallery-img" />
            </div>
          </div>
        </div>
      </section>

      <!-- Menu of Services & Price Estimates -->
      <section class="services-menu-section">
        <div class="container-custom">
          <div class="section-header">
            <div>
              <span class="section-sub">قائمة الخدمات والأسعار التقديرية</span>
              <h2 class="section-title">خدمات العناية المتاحة لدى المركز</h2>
            </div>
          </div>

          <div class="services-list-grid">
            <div
              class="srv-item-card beauty-card"
              *ngFor="let srv of center.center_services"
            >
              <div class="srv-info">
                <h3 class="srv-name">{{ srv.service_name }}</h3>
                <p class="srv-desc" *ngIf="srv.description">{{ srv.description }}</p>
              </div>

              <div class="srv-pricing">
                <span class="price-range">
                  {{ srv.price_from }} - {{ srv.price_to }} <small>ج.م</small>
                </span>
                <span class="discounted-hint" *ngIf="center.referral_code">
                  (السعر بعد خصم الكود: {{ Math.round((srv.price_from || 0) * 0.85) }} - {{ Math.round((srv.price_to || 0) * 0.85) }} ج.م)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Modal: Claim Referral Code Confirmation -->
      <div class="modal-backdrop" *ngIf="isClaimModalOpen" (click)="isClaimModalOpen = false"></div>
      <div class="modal-content beauty-card animate-fade-in" *ngIf="isClaimModalOpen">
        <div class="modal-header">
          <h3>تأكيد الحصول على كود الخصم</h3>
          <button (click)="isClaimModalOpen = false" class="close-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="modal-body" *ngIf="!claimedSuccessfully">
          <div class="claim-confirm-box">
            <div class="c-icon"><i class="fa-solid fa-ticket"></i></div>
            <h4>{{ center.referral_code?.code }}</h4>
            <p>{{ center.referral_code?.discount_description }}</p>
          </div>

          <p class="claim-instruction">
            سيتم ربط كود الخصم بحسابكِ <strong>({{ auth.profile()?.full_name || 'سارة أحمد' }})</strong> لتتمكني من إبرازه عند زيارة المركز أو ذكره أثناء الحجز الهاتفي على: <strong dir="ltr">{{ center.phone }}</strong>.
          </p>

          <div class="form-group mt-3">
            <label>ملاحظات إضافية أو موعد الزيارة المتوقع (اختياري)</label>
            <input type="text" [(ngModel)]="claimNotes" placeholder="مثال: ناوية أزور المركز يوم الخميس القادم..." class="input-custom" />
          </div>
        </div>

        <div class="modal-body success-body" *ngIf="claimedSuccessfully">
          <div class="success-icon"><i class="fa-solid fa-check"></i></div>
          <h3>تم إصدار كود الخصم بنجاح!</h3>
          <div class="issued-code-badge">{{ center.referral_code?.code }}</div>
          <p class="mt-2">تم حفظ الكود في صفحة "أكوادي وإحالاتي". يمكنكِ الآن الاتصال بالمركز لتحديد موعدكِ والاستمتاع بالخصم.</p>
        </div>

        <div class="modal-footer">
          <button *ngIf="!claimedSuccessfully" (click)="isClaimModalOpen = false" class="btn-outline">إلغاء</button>
          <button *ngIf="!claimedSuccessfully" (click)="confirmClaim()" [disabled]="isClaiming" class="btn-primary">
            <span *ngIf="!isClaiming"><i class="fa-solid fa-check"></i> تأكيد وحفظ الكود</span>
            <span *ngIf="isClaiming"><i class="fa-solid fa-spinner fa-spin"></i> جاري الإصدار...</span>
          </button>
          <a *ngIf="claimedSuccessfully" routerLink="/centers/my-codes" (click)="isClaimModalOpen = false" class="btn-primary">
            عرض أكوادي وإحالاتي
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .center-profile-page {
      padding-bottom: 5rem;
      background: #FAF7F5;
      min-height: 85vh;
    }
    .py-3 { padding: 1.25rem 0; }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--color-text-subtle);

      a { color: var(--color-text-muted); text-decoration: none; &:hover { color: var(--color-primary); } }
      i { font-size: 0.65rem; }
      .active-crumb { color: var(--color-primary); font-weight: 700; }
    }

    .profile-hero {
      padding: 2rem 0 3rem;
      background: #FFFFFF;
      border-bottom: 1px solid var(--color-border-light);
    }
    .hero-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 3rem;
      align-items: flex-start;

      @media (max-width: 900px) { grid-template-columns: 1fr; }
    }
    .badge-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .badge-pill {
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;

      &.verified { background: #DCFCE7; color: #15803D; }
      &.discount { background: #FEE2E2; color: #DC2626; }
    }
    .center-title {
      font-size: 2.3rem;
      font-weight: 900;
      line-height: 1.3;
      color: var(--color-text-main);
      margin-bottom: 0.75rem;
    }
    .rating-city-row {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      font-size: 0.95rem;
      margin-bottom: 1.25rem;
    }
    .stars-gold { color: #D97706; font-weight: 800; small { color: var(--color-text-subtle); font-weight: 400; } }
    .divider { color: var(--color-border); }
    .city-tag { color: var(--color-text-muted); i { color: var(--color-primary); } }
    .center-bio-full {
      font-size: 1rem;
      color: var(--color-text-muted);
      line-height: 1.7;
      margin-bottom: 1.75rem;
    }

    .details-mini-box {
      border-radius: 16px;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      border: 1px solid var(--color-border);
    }
    .d-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      i { font-size: 1.2rem; color: var(--color-primary); width: 24px; text-align: center; }
      .label { font-size: 0.78rem; color: var(--color-text-subtle); display: block; }
      strong { font-size: 0.92rem; color: var(--color-text-main); }
    }

    .exclusive-promo-card {
      padding: 2rem;
      background: linear-gradient(135deg, #FFFDFB 0%, #FFF5F2 100%);
      border: 2px solid var(--color-primary);
      text-align: center;
      box-shadow: 0 10px 30px rgba(196, 109, 91, 0.15);
      position: sticky;
      top: 100px;
    }
    .promo-badge-top {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--color-primary);
      color: #fff;
      font-size: 0.78rem;
      font-weight: 800;
      padding: 0.25rem 0.85rem;
      border-radius: 9999px;
      margin-bottom: 1.25rem;
    }
    .discount-lead {
      h3 { font-size: 2.2rem; font-weight: 900; color: var(--color-primary); margin-bottom: 0.25rem; }
      p { font-size: 0.88rem; color: var(--color-text-muted); margin-bottom: 1.25rem; }
    }
    .code-preview-frame {
      background: #FFFFFF;
      border: 1.5px dashed var(--color-primary);
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      .code-txt { font-size: 1.6rem; font-weight: 900; color: var(--color-text-main); letter-spacing: 2px; display: block; }
      small { font-size: 0.75rem; color: var(--color-text-subtle); }
    }
    .claim-btn {
      width: 100%;
      padding: 0.95rem;
      font-size: 1.05rem;
    }
    .claim-notes {
      font-size: 0.78rem;
      color: var(--color-text-subtle);
      margin-top: 1rem;
      line-height: 1.4;
    }

    .gallery-section {
      padding: 3rem 0;
    }
    .section-title {
      font-size: 1.6rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      i { color: var(--color-primary); font-size: 1.3rem; }
    }
    .photos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .photo-item {
      height: 220px;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .gallery-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
      &:hover { transform: scale(1.06); }
    }

    .services-menu-section {
      padding: 2rem 0 4rem;
    }
    .section-sub { font-size: 0.82rem; font-weight: 700; color: var(--color-primary); display: block; margin-bottom: 0.35rem; }
    .services-list-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-top: 1.5rem;

      @media (max-width: 768px) { grid-template-columns: 1fr; }
    }
    .srv-item-card {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
    }
    .srv-info { flex: 1; }
    .srv-name { font-size: 1.05rem; font-weight: 800; color: var(--color-text-main); margin-bottom: 0.35rem; }
    .srv-desc { font-size: 0.82rem; color: var(--color-text-muted); line-height: 1.4; margin: 0; }
    .srv-pricing {
      text-align: left;
      flex-shrink: 0;
    }
    .price-range {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--color-primary);
      display: block;
      small { font-size: 0.8rem; }
    }
    .discounted-hint {
      font-size: 0.75rem;
      color: #15803D;
      font-weight: 700;
      display: block;
    }

    /* Modal */
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(30, 27, 24, 0.5); backdrop-filter: blur(4px); z-index: 2000; }
    .modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 500px; background: #FFFFFF; border-radius: 20px; padding: 2rem; z-index: 2001; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid var(--color-border-light); margin-bottom: 1.25rem; h3 { font-size: 1.2rem; font-weight: 800; } }
    .close-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; }
    .claim-confirm-box {
      background: #FAF7F5; border: 1.5px dashed var(--color-primary); border-radius: 14px; padding: 1.25rem; text-align: center; margin-bottom: 1.25rem;
      .c-icon { font-size: 2rem; color: var(--color-primary); margin-bottom: 0.5rem; }
      h4 { font-size: 1.6rem; font-weight: 900; color: var(--color-text-main); letter-spacing: 2px; }
      p { font-size: 0.85rem; color: var(--color-text-muted); margin: 0; }
    }
    .claim-instruction { font-size: 0.85rem; color: var(--color-text-muted); line-height: 1.6; }
    .mt-3 { margin-top: 1rem; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border-light); }
    .success-body { text-align: center; padding: 1.5rem 0; .success-icon { width: 60px; height: 60px; border-radius: 50%; background: #10B981; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 1.8rem; margin-bottom: 1rem; } }
    .issued-code-badge { background: #FEF3C7; color: #92400E; font-size: 1.5rem; font-weight: 900; padding: 0.5rem 1.5rem; border-radius: 9999px; display: inline-block; letter-spacing: 2px; margin-top: 0.75rem; }
  `]
})
export class CenterProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private centersService = inject(CentersService);
  private referralsService = inject(ReferralsService);
  auth = inject(AuthService);
  Math = Math;

  center: Provider | undefined;
  isClaimModalOpen: boolean = false;
  claimNotes: string = '';
  isClaiming: boolean = false;
  claimedSuccessfully: boolean = false;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.center = this.centersService.getCenterById(id);
      }
    });
  }

  openClaimModal(): void {
    this.claimedSuccessfully = false;
    this.claimNotes = '';
    this.isClaimModalOpen = true;
  }

  async confirmClaim(): Promise<void> {
    if (!this.center) return;
    this.isClaiming = true;
    const res = await this.referralsService.claimReferralCode(this.center.id, this.claimNotes);
    this.isClaiming = false;
    if (res.success) {
      this.claimedSuccessfully = true;
    }
  }
}
