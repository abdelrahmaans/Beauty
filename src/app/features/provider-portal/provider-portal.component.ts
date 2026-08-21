import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProvidersService } from '../../core/services/providers.service';
import { BookingsService } from '../../core/services/bookings.service';
import { AuthService } from '../../core/services/auth.service';
import { HOME_CARE_SERVICES } from '../../core/mock/mock-data';
import { BookingStatus } from '../../core/models';

@Component({
  selector: 'app-provider-portal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="provider-portal-page">
      <div class="container-custom">
        <!-- Specialist Top Profile Bar -->
        <div class="portal-header">
          <div class="specialist-info-bar">
            <div class="avatar-box">
              <img
                [src]="providersService.currentProvider()?.avatar_url || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80'"
                class="spec-avatar"
              />
              <span class="status-dot online"></span>
            </div>
            <div>
              <span class="badge-pill" [ngClass]="providersService.currentProvider()?.status || 'verified'">
                {{ getStatusBadge(providersService.currentProvider()?.status) }}
              </span>
              <h1 class="spec-name">{{ providersService.currentProvider()?.display_name || auth.profile()?.full_name || 'أخصائية التجميل' }}</h1>
              <p class="spec-meta">
                <i class="fa-solid fa-location-dot"></i> {{ providersService.currentProvider()?.city || 'القاهرة' }} •
                <span class="rating-star">★ {{ providersService.currentProvider()?.rating_avg || 4.9 }} ({{ providersService.currentProvider()?.rating_count || 54 }} جلسة)</span>
              </p>
            </div>
          </div>

          <!-- Quick Stats -->
          <div class="header-metrics">
            <div class="metric-mini glass-panel">
              <span>إجمالي الجلسات</span>
              <strong>{{ bookingsService.myProviderBookings().length }}</strong>
            </div>
            <div class="metric-mini glass-panel">
              <span>صافي الأرباح</span>
              <strong class="text-success">{{ getNetEarnings() }} ج.م</strong>
            </div>
          </div>
        </div>

        <!-- Portal Tabs -->
        <div class="portal-tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab === 'bookings'"
            (click)="activeTab = 'bookings'"
          >
            <i class="fa-solid fa-calendar-days"></i> الجلسات والطلبات المسندة ({{ bookingsService.myProviderBookings().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'earnings'"
            (click)="activeTab = 'earnings'"
          >
            <i class="fa-solid fa-wallet"></i> المستحقات والعمولات
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'onboarding'"
            (click)="activeTab = 'onboarding'"
          >
            <i class="fa-solid fa-id-card"></i> التوثيق والمستندات
          </button>
        </div>

        <!-- Tab 1: Assigned Bookings -->
        <div class="tab-content beauty-card animate-fade-in" *ngIf="activeTab === 'bookings'">
          <div class="panel-header">
            <h3>جدول الجلسات المنزلية المسندة لكِ</h3>
          </div>

          <div class="empty-state" *ngIf="bookingsService.myProviderBookings().length === 0">
            <i class="fa-solid fa-spa empty-icon"></i>
            <h4>لا توجد جلسات مسندة حالياً</h4>
            <p>ستظهر هنا أي جلسات يتم ترشيحك وتأكيدها لكِ من قبل الإدارة فوراً.</p>
          </div>

          <div class="sessions-list" *ngIf="bookingsService.myProviderBookings().length > 0">
            <div class="session-card" *ngFor="let bk of bookingsService.myProviderBookings()">
              <div class="s-top">
                <div>
                  <span class="s-id">حجز #{{ bk.id }}</span>
                  <h4 class="s-title">{{ bk.service_type }}</h4>
                </div>
                <span class="status-pill" [ngClass]="'status-' + bk.status">
                  {{ getStatusArabic(bk.status) }}
                </span>
              </div>

              <div class="s-details-grid">
                <div class="s-info-item">
                  <i class="fa-solid fa-user"></i>
                  <div>
                    <span class="label">العميلة:</span>
                    <strong>{{ bk.customer_name }}</strong>
                  </div>
                </div>

                <div class="s-info-item">
                  <i class="fa-solid fa-phone"></i>
                  <div>
                    <span class="label">الموبايل:</span>
                    <strong dir="ltr">{{ bk.customer_phone }}</strong>
                  </div>
                </div>

                <div class="s-info-item">
                  <i class="fa-solid fa-location-dot"></i>
                  <div>
                    <span class="label">العنوان:</span>
                    <strong>{{ bk.requested_area }}</strong>
                  </div>
                </div>

                <div class="s-info-item">
                  <i class="fa-regular fa-clock"></i>
                  <div>
                    <span class="label">الموعد:</span>
                    <strong>{{ bk.scheduled_at | date:'medium' }}</strong>
                  </div>
                </div>
              </div>

              <!-- Price & Net Earnings -->
              <div class="s-financials">
                <div>
                  <span>قيمة الجلسة: <strong>{{ bk.agreed_price }} ج.م</strong></span>
                  <span class="comm-deduct">عمولة المنصة (15%): -{{ Math.round((bk.agreed_price || 0) * 0.15) }} ج.م</span>
                </div>
                <div class="s-net">
                  <span>صافي مستحقكِ:</span>
                  <strong>{{ (bk.agreed_price || 0) - Math.round((bk.agreed_price || 0) * 0.15) }} ج.م</strong>
                </div>
              </div>

              <!-- Action Status Stepper for Provider -->
              <div class="s-actions">
                <button
                  *ngIf="bk.status === 'confirmed'"
                  (click)="updateStatus(bk.id, 'in_progress')"
                  class="btn-primary btn-sm"
                >
                  <i class="fa-solid fa-car-side"></i> أنا في الطريق وبدء الجلسة
                </button>

                <button
                  *ngIf="bk.status === 'in_progress'"
                  (click)="updateStatus(bk.id, 'completed')"
                  class="btn-primary btn-sm btn-success"
                >
                  <i class="fa-solid fa-circle-check"></i> إنهاء الجلسة واحتساب الأرباح
                </button>

                <span class="completed-tag" *ngIf="bk.status === 'completed'">
                  <i class="fa-solid fa-check-double"></i> تم تسليم الجلسة بنجاح
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Earnings & Commissions -->
        <div class="tab-content beauty-card animate-fade-in" *ngIf="activeTab === 'earnings'">
          <div class="panel-header">
            <h3>كشف حساب الأرباح والعمولات</h3>
          </div>

          <div class="earnings-summary-grid">
            <div class="earn-box total">
              <span>إجمالي قيمة الجلسات</span>
              <strong>{{ getTotalSessionValue() }} ج.م</strong>
            </div>
            <div class="earn-box comm">
              <span>عمولات المنصة (15%)</span>
              <strong>- {{ Math.round(getTotalSessionValue() * 0.15) }} ج.م</strong>
            </div>
            <div class="earn-box net">
              <span>صافي المستحقات للتحويل</span>
              <strong class="text-success">{{ getNetEarnings() }} ج.م</strong>
            </div>
          </div>

          <div class="payout-schedule-card">
            <i class="fa-solid fa-money-bill-transfer"></i>
            <div>
              <strong>مواعيد التحويل الدوري (Payouts)</strong>
              <p>يتم تحويل الأرباح المستحقة أسبوعياً كل يوم خميس إلى المحفظة الإلكترونية (فودافون كاش / إنستاباي) أو الحساب البنكي المسجل.</p>
            </div>
          </div>
        </div>

        <!-- Tab 3: Onboarding & Documents Verification -->
        <div class="tab-content beauty-card animate-fade-in" *ngIf="activeTab === 'onboarding'">
          <div class="panel-header">
            <h3>التوثيق المهني ورفع الشهادات</h3>
          </div>

          <div class="onboarding-form-grid">
            <div class="form-group">
              <label>الاسم المهني المعروض للعميلات <span class="req">*</span></label>
              <input type="text" [(ngModel)]="onboardName" class="input-custom" />
            </div>

            <div class="form-group">
              <label>رقم الموبايل للتواصل <span class="req">*</span></label>
              <input type="tel" [(ngModel)]="onboardPhone" class="input-custom" dir="ltr" />
            </div>

            <div class="form-group">
              <label>منطقة العمل الأساسية <span class="req">*</span></label>
              <input type="text" [(ngModel)]="onboardCity" class="input-custom" placeholder="مثال: التجمع الخامس والقاهرة الجديدة" />
            </div>

            <div class="form-group full-width">
              <label>النبذة المهنية وسنوات الخبرة</label>
              <textarea [(ngModel)]="onboardBio" rows="3" class="input-custom" placeholder="مثال: أخصائية بروتين وترميم معتمدة بخبرة 6 سنوات..."></textarea>
            </div>

            <!-- Upload Badges Simulation -->
            <div class="form-group full-width docs-upload-box">
              <label>مستندات التوثيق المطلوبة (PDF / صور عالية الجودة)</label>
              <div class="upload-chips">
                <div class="upload-chip" [class.uploaded]="hasNationalId">
                  <i class="fa-solid fa-id-card"></i>
                  <span>بطاقة الرقم القومي</span>
                  <button (click)="hasNationalId = !hasNationalId" class="btn-micro">
                    {{ hasNationalId ? 'تم الرفع ✓' : 'رفع ملف' }}
                  </button>
                </div>

                <div class="upload-chip" [class.uploaded]="hasCert">
                  <i class="fa-solid fa-certificate"></i>
                  <span>شهادة الخبرة أو الدبلومة</span>
                  <button (click)="hasCert = !hasCert" class="btn-micro">
                    {{ hasCert ? 'تم الرفع ✓' : 'رفع ملف' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="onboard-submit-box">
            <button (click)="saveOnboarding()" class="btn-primary">
              <i class="fa-solid fa-shield-check"></i> حفظ وطلب التوثيق
            </button>
            <span class="success-txt" *ngIf="isOnboardSaved">تم تحديث بيانات التوثيق بنجاح!</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .provider-portal-page {
      padding: 2.5rem 0 5rem;
      background: #FAF7F5;
      min-height: 85vh;
    }
    .portal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .specialist-info-bar {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .avatar-box {
      position: relative;
    }
    .spec-avatar {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #FFFFFF;
      box-shadow: var(--shadow-md);
    }
    .status-dot {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #10B981;
      border: 2px solid #FFFFFF;
    }
    .badge-pill {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      display: inline-block;
      margin-bottom: 0.25rem;

      &.trusted { background: #FEF3C7; color: #92400E; }
      &.verified { background: #DCFCE7; color: #15803D; }
      &.pending { background: #DBEAFE; color: #1E40AF; }
    }
    .spec-name {
      font-size: 1.75rem;
      font-weight: 900;
      color: var(--color-text-main);
      margin: 0;
    }
    .spec-meta {
      font-size: 0.85rem;
      color: var(--color-text-subtle);
      margin-top: 0.2rem;
      .rating-star { color: #D97706; font-weight: 700; }
    }

    .header-metrics {
      display: flex;
      gap: 1rem;
    }
    .metric-mini {
      padding: 0.85rem 1.35rem;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      span { font-size: 0.78rem; color: var(--color-text-muted); }
      strong { font-size: 1.4rem; font-weight: 900; }
    }

    .portal-tabs {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      overflow-x: auto;
    }
    .tab-btn {
      padding: 0.75rem 1.35rem;
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      font-family: inherit;
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--color-text-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
      transition: var(--transition-smooth);

      &.active {
        background: var(--color-primary);
        color: #FFFFFF;
        border-color: var(--color-primary);
        box-shadow: 0 4px 14px rgba(196, 109, 91, 0.3);
      }
    }

    .tab-content {
      padding: 2rem;
    }
    .panel-header {
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border-light);
      h3 { font-size: 1.25rem; font-weight: 800; }
    }

    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .session-card {
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 1.5rem;
      background: #FAF7F5;
    }
    .s-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .s-id { font-size: 0.8rem; color: var(--color-text-subtle); }
    .s-title { font-size: 1.1rem; font-weight: 800; color: var(--color-text-main); margin-top: 0.2rem; }

    .s-details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
      background: #FFFFFF;
      padding: 1rem;
      border-radius: 12px;
    }
    .s-info-item {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      i { color: var(--color-primary); font-size: 1rem; }
      .label { font-size: 0.75rem; color: var(--color-text-subtle); display: block; }
      strong { font-size: 0.88rem; }
    }

    .s-financials {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-top: 1px dashed var(--color-border);
      font-size: 0.88rem;
      .comm-deduct { color: #EF4444; font-size: 0.78rem; margin-right: 0.5rem; }
      .s-net { strong { font-size: 1.2rem; color: var(--color-secondary); } }
    }

    .s-actions {
      margin-top: 1rem;
      display: flex;
      justify-content: flex-end;
    }
    .btn-sm { padding: 0.5rem 1.2rem; font-size: 0.85rem; }
    .btn-success { background: #10B981; border-color: #10B981; }
    .completed-tag { color: #10B981; font-weight: 700; font-size: 0.85rem; }

    .earnings-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .earn-box {
      padding: 1.5rem;
      border-radius: 16px;
      background: #FAF7F5;
      border: 1px solid var(--color-border);
      span { font-size: 0.82rem; color: var(--color-text-muted); display: block; margin-bottom: 0.4rem; }
      strong { font-size: 1.6rem; font-weight: 900; }
    }
    .payout-schedule-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      padding: 1.25rem 1.5rem;
      border-radius: 14px;
      i { font-size: 2rem; color: #16A34A; }
      strong { color: #166534; display: block; margin-bottom: 0.2rem; }
      p { color: #15803D; font-size: 0.82rem; margin: 0; }
    }

    .onboarding-form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 1.75rem;
      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }
    .full-width { grid-column: 1 / -1; }
    .docs-upload-box {
      background: #FAF7F5;
      padding: 1.25rem;
      border-radius: 14px;
      border: 1px dashed var(--color-border);
    }
    .upload-chips {
      display: flex;
      gap: 1rem;
      margin-top: 0.75rem;
      flex-wrap: wrap;
    }
    .upload-chip {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #FFFFFF;
      border: 1.5px solid var(--color-border);
      padding: 0.6rem 1rem;
      border-radius: 12px;
      font-size: 0.88rem;

      &.uploaded {
        border-color: #10B981;
        background: #F0FDF4;
        color: #166534;
      }
    }
    .btn-micro {
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      background: var(--color-primary);
      color: #fff;
      border: none;
      font-size: 0.75rem;
      cursor: pointer;
    }
    .onboard-submit-box {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .success-txt { color: #10B981; font-weight: 700; font-size: 0.88rem; }
  `]
})
export class ProviderPortalComponent {
  providersService = inject(ProvidersService);
  bookingsService = inject(BookingsService);
  auth = inject(AuthService);

  activeTab: 'bookings' | 'earnings' | 'onboarding' = 'bookings';
  Math = Math;

  onboardName: string = this.providersService.currentProvider()?.display_name || this.auth.profile()?.full_name || '';
  onboardPhone: string = this.providersService.currentProvider()?.phone || this.auth.profile()?.phone || '';
  onboardCity: string = this.providersService.currentProvider()?.city || 'التجمع الخامس والقاهرة الجديدة';
  onboardBio: string = this.providersService.currentProvider()?.bio || '';
  hasNationalId: boolean = true;
  hasCert: boolean = true;
  isOnboardSaved: boolean = false;

  getStatusBadge(status?: string): string {
    if (status === 'trusted') return 'أخصائية موثوقة ونخبة ★';
    if (status === 'verified') return 'أخصائية موثقة بالهوية ✓';
    return 'قيد مراجعة التوثيق';
  }

  getStatusArabic(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      requested: 'طلب جديد',
      offered: 'تم إرسال العرض للعميلة',
      confirmed: 'حجز مؤكد ومدفوع',
      in_progress: 'الجلسة جارية الآن',
      completed: 'مكتملة',
      cancelled: 'ملغية',
      reported: 'بلاغ قيد المراجعة'
    };
    return map[status] || status;
  }

  getTotalSessionValue(): number {
    return this.bookingsService.myProviderBookings().reduce((sum, b) => sum + (b.agreed_price || 0), 0);
  }

  getNetEarnings(): number {
    const total = this.getTotalSessionValue();
    return total - Math.round(total * 0.15);
  }

  async updateStatus(bookingId: string, status: BookingStatus): Promise<void> {
    await this.bookingsService.updateBookingStatus(bookingId, status);
  }

  async saveOnboarding(): Promise<void> {
    await this.providersService.registerProvider({
      displayName: this.onboardName,
      phone: this.onboardPhone,
      city: this.onboardCity,
      specialties: ['جلسة بروتين وكولاجين وترميم الشعر الفاخر', 'جلسة هيدرافيشال ونضارة البشرة الزجاجية'],
      bio: this.onboardBio,
      nationalIdFile: this.hasNationalId ? 'docs/national_id.pdf' : undefined,
      certificateFile: this.hasCert ? 'docs/cert.pdf' : undefined
    });
    this.isOnboardSaved = true;
    setTimeout(() => (this.isOnboardSaved = false), 3000);
  }
}
