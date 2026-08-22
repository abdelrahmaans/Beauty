import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReferralsService } from '../../../core/services/referrals.service';
import { AuthService } from '../../../core/services/auth.service';
import { RedemptionStatus } from '../../../core/models';

@Component({
  selector: 'app-my-referrals',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="my-referrals-page">
      <div class="container-custom">
        <!-- Header -->
        <div class="page-header">
          <div>
            <div class="breadcrumb">
              <a routerLink="/">الرئيسية</a>
              <i class="fa-solid fa-chevron-left"></i>
              <a routerLink="/centers">دليل المراكز</a>
              <i class="fa-solid fa-chevron-left"></i>
              <span>أكوادي وإحالاتي</span>
            </div>
            <h1 class="page-title">أكواد الخصم الحصرية في المراكز</h1>
          </div>
          <a routerLink="/centers" class="btn-primary">
            <i class="fa-solid fa-magnifying-glass"></i> استكشاف المزيد من المراكز
          </a>
        </div>

        <!-- Empty State -->
        <div class="empty-state beauty-card" *ngIf="referralsService.myClaimedCodes().length === 0">
          <div class="empty-icon"><i class="fa-solid fa-ticket"></i></div>
          <h3>لم تحصلي على أي أكواد خصم بعد</h3>
          <p>تصفحي دليل المراكز الشريكة واحصلي على خصومات تصل إلى 20% على خدمات الشعر والسبا والبشرة.</p>
          <a routerLink="/centers" class="btn-primary">تصفح دليل المراكز الآن</a>
        </div>

        <!-- Claimed Codes Grid -->
        <div class="codes-grid" *ngIf="referralsService.myClaimedCodes().length > 0">
          <div
            class="code-card beauty-card animate-fade-in"
            *ngFor="let item of referralsService.myClaimedCodes()"
          >
            <!-- Card Top Header -->
            <div class="c-card-top">
              <div class="center-info-mini">
                <img [src]="item.provider?.avatar_url" [alt]="item.provider?.display_name" class="ctr-avatar" />
                <div>
                  <span class="ctr-label">المركز الشريك:</span>
                  <h3 class="ctr-name">{{ item.provider?.display_name }}</h3>
                  <span class="ctr-city"><i class="fa-solid fa-location-dot"></i> {{ item.provider?.city }}</span>
                </div>
              </div>

              <span class="status-pill" [ngClass]="'status-' + item.status">
                {{ getStatusArabic(item.status) }}
              </span>
            </div>

            <!-- Card Body Code Box -->
            <div class="c-card-body">
              <div class="promo-box">
                <div class="p-left">
                  <span class="discount-desc">{{ item.referral_code?.discount_description || 'خصم حصري لعميلات المنصة' }}</span>
                  <div class="big-code-tag">
                    <strong>{{ item.referral_code?.code }}</strong>
                    <button (click)="copyCode(item.referral_code?.code || '')" class="copy-btn" title="نسخ الكود">
                      <i class="fa-regular fa-copy"></i>
                    </button>
                  </div>
                </div>
                <div class="p-right">
                  <span class="claimed-date">تاريخ الإصدار:</span>
                  <small>{{ item.claimed_at | date:'yyyy/MM/dd - hh:mm a' }}</small>
                </div>
              </div>

              <!-- Status Notice and Action -->
              <div class="status-notice-box" [ngClass]="item.status">
                <div *ngIf="item.status === 'claimed'">
                  <i class="fa-solid fa-circle-info"></i>
                  <span>الكود ساري ومفعل! أظهري هذا الكود لموظفة الاستقبال أو اذكريه أثناء الحجز الهاتفي للاستفادة من الخصم.</span>
                </div>
                <div *ngIf="item.status === 'confirmed_by_center' || item.status === 'paid_out'">
                  <i class="fa-solid fa-circle-check"></i>
                  <span>تمت الزيارة وتأكيد استخدام الكود بنجاح! تم إضافة نقاط الولاء لحسابكِ.</span>
                </div>
                <div *ngIf="item.status === 'rejected'">
                  <i class="fa-solid fa-circle-xmark"></i>
                  <span>تم إلغاء صلاحية هذا الكود أو عدم حضور الموعد.</span>
                </div>
              </div>
            </div>

            <!-- Card Footer: Center Contact Info -->
            <div class="c-card-footer">
              <div class="contact-line">
                <i class="fa-solid fa-phone"></i>
                <span>هاتف الحجز: <strong dir="ltr">{{ item.provider?.phone }}</strong></span>
              </div>
              <a [routerLink]="['/centers', item.provider_id]" class="btn-outline btn-sm">
                صفحة المركز والخدمات <i class="fa-solid fa-chevron-left"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-referrals-page {
      padding: 2.5rem 0 5rem;
      background: #FAF7F5;
      min-height: 85vh;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: var(--color-text-subtle);
      margin-bottom: 0.5rem;

      a { color: var(--color-text-muted); text-decoration: none; &:hover { color: var(--color-primary); } }
      i { font-size: 0.65rem; }
    }
    .page-title { font-size: 2rem; font-weight: 800; }

    .codes-grid {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .code-card {
      padding: 1.75rem 2rem;
    }
    .c-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border-light);
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .center-info-mini {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .ctr-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #FFFFFF;
      box-shadow: var(--shadow-sm);
    }
    .ctr-label { font-size: 0.72rem; color: var(--color-text-subtle); display: block; }
    .ctr-name { font-size: 1.15rem; font-weight: 800; margin: 0.1rem 0; }
    .ctr-city { font-size: 0.78rem; color: var(--color-text-muted); i { color: var(--color-primary); } }

    .status-pill {
      font-size: 0.82rem;
      font-weight: 700;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;

      &.status-claimed { background: #FEF3C7; color: #92400E; }
      &.status-confirmed_by_center { background: #DCFCE7; color: #15803D; }
      &.status-paid_out { background: #E0E7FF; color: #4338CA; }
      &.status-rejected { background: #FEE2E2; color: #B91C1C; }
    }

    .promo-box {
      background: #FFFDFB;
      border: 1.5px dashed var(--color-primary);
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .discount-desc { font-size: 0.85rem; color: var(--color-primary); font-weight: 700; display: block; margin-bottom: 0.35rem; }
    .big-code-tag {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      strong { font-size: 1.6rem; font-weight: 900; letter-spacing: 2px; color: var(--color-text-main); }
    }
    .copy-btn {
      background: var(--color-primary-light);
      border: none;
      color: var(--color-primary);
      width: 32px;
      height: 32px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-smooth);

      &:hover { background: var(--color-primary); color: #fff; }
    }
    .p-right {
      text-align: left;
      .claimed-date { font-size: 0.75rem; color: var(--color-text-subtle); display: block; }
      small { font-size: 0.82rem; color: var(--color-text-muted); }
    }

    .status-notice-box {
      padding: 0.85rem 1.15rem;
      border-radius: 12px;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 1.25rem;

      &.claimed { background: #FFFBEB; border: 1px solid #FDE68A; color: #92400E; }
      &.confirmed_by_center, &.paid_out { background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; }
      &.rejected { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
    }

    .c-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-light);
      flex-wrap: wrap;
      gap: 1rem;
    }
    .contact-line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.88rem;
      color: var(--color-text-muted);
      i { color: var(--color-primary); }
    }
    .btn-sm { padding: 0.45rem 1rem; font-size: 0.82rem; }
    .empty-state { text-align: center; padding: 4rem 2rem; .empty-icon { font-size: 3rem; color: var(--color-primary); margin-bottom: 1rem; } }
  `]
})
export class MyReferralsComponent {
  referralsService = inject(ReferralsService);
  auth = inject(AuthService);

  getStatusArabic(status: RedemptionStatus): string {
    const map: Record<RedemptionStatus, string> = {
      claimed: 'كود ساري للاستخدام (بانتظار الزيارة)',
      confirmed_by_center: 'تمت الزيارة وتأكيد الخصم بنجاح ✓',
      paid_out: 'مكتمل ومسجل',
      rejected: 'ملغي أو منتهي الصلاحية'
    };
    return map[status] || status;
  }

  copyCode(code: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      alert(`تم نسخ الكود: ${code}`);
    }
  }
}
