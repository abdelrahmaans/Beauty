import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CentersService } from '../../core/services/centers.service';
import { ReferralsService } from '../../core/services/referrals.service';
import { AuthService } from '../../core/services/auth.service';
import { CenterService, RedemptionStatus, ReferralRedemption } from '../../core/models';

@Component({
  selector: 'app-center-portal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="center-portal-page">
      <div class="container-custom">
        <!-- Portal Top Header -->
        <div class="portal-header">
          <div class="center-brand-box">
            <img
              [src]="centersService.currentCenter()?.avatar_url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80'"
              class="ctr-avatar-large"
            />
            <div>
              <div class="badge-row">
                <span class="badge-pill verified"><i class="fa-solid fa-circle-check"></i> مركز شريك معتمد</span>
                <span class="badge-pill code-tag" *ngIf="centersService.currentCenter()?.referral_code">
                  كود الإحالة: <strong>{{ centersService.currentCenter()?.referral_code?.code }}</strong> (عمولة {{ centersService.currentCenter()?.referral_code?.commission_rate }}%)
                </span>
              </div>
              <h1 class="center-name">{{ centersService.currentCenter()?.display_name }}</h1>
              <p class="center-meta">
                <i class="fa-solid fa-location-dot"></i> {{ centersService.currentCenter()?.address_line }} •
                <span>★ {{ centersService.currentCenter()?.rating_avg }} ({{ centersService.currentCenter()?.rating_count }} تقييم)</span>
              </p>
            </div>
          </div>

          <!-- Quick KPI Cards -->
          <div class="portal-metrics">
            <div class="metric-box glass-panel">
              <span class="m-lbl">إجمالي الإحالات</span>
              <strong class="m-val">{{ referralsService.myCenterRedemptions().length }}</strong>
            </div>
            <div class="metric-box glass-panel">
              <span class="m-lbl">قيمة الزيارات المؤكدة</span>
              <strong class="m-val text-success">{{ getConfirmedRevenue() }} ج.م</strong>
            </div>
            <div class="metric-box glass-panel">
              <span class="m-lbl">عمولات المنصة المستحقة</span>
              <strong class="m-val text-primary">{{ getTotalCommissionsOwed() }} ج.م</strong>
            </div>
          </div>
        </div>

        <!-- Portal Tabs Navigation -->
        <div class="portal-tabs">
          <button
            class="tab-btn"
            [class.active]="activeTab === 'redemptions'"
            (click)="activeTab = 'redemptions'"
          >
            <i class="fa-solid fa-ticket"></i> الإحالات والأكواد الواردة ({{ getPendingClaimsCount() }} جديدة)
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'services'"
            (click)="activeTab = 'services'"
          >
            <i class="fa-solid fa-list-check"></i> إدارة الخدمات والأسعار ({{ centersService.currentCenter()?.center_services?.length || 0 }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'finances'"
            (click)="activeTab = 'finances'"
          >
            <i class="fa-solid fa-wallet"></i> العمولات والمستحقات
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'info'"
            (click)="activeTab = 'info'"
          >
            <i class="fa-solid fa-store"></i> بيانات المركز وساعات العمل
          </button>
        </div>

        <!-- TAB 1: Incoming Redemptions Management -->
        <div class="tab-content beauty-card animate-fade-in" *ngIf="activeTab === 'redemptions'">
          <div class="content-header">
            <div>
              <h3>الأكواد والإحالات الواردة من عميلات المنصة</h3>
              <p>قومي بتأكيد حضور العميلة وإدخال قيمة الخدمة لاحتساب الخصم والعمولة.</p>
            </div>
          </div>

          <div class="empty-state" *ngIf="referralsService.myCenterRedemptions().length === 0">
            <i class="fa-solid fa-ticket-simple empty-icon"></i>
            <h4>لا توجد إحالات مسجلة حالياً</h4>
            <p>ستظهر هنا أي عميلة تحصل على كود خصم المركز فوراً.</p>
          </div>

          <div class="redemptions-table-wrap" *ngIf="referralsService.myCenterRedemptions().length > 0">
            <table class="portal-table">
              <thead>
                <tr>
                  <th>العميلة</th>
                  <th>الكود المستخدم</th>
                  <th>تاريخ المطالبة</th>
                  <th>قيمة الفاتورة</th>
                  <th>عمولة المنصة</th>
                  <th>الحالة</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of referralsService.myCenterRedemptions()" [class.highlight-pending]="item.status === 'claimed'">
                  <td>
                    <strong>{{ item.user?.full_name || 'سارة أحمد' }}</strong>
                    <small class="d-block text-muted" dir="ltr">{{ item.user?.phone || '01123456789' }}</small>
                  </td>
                  <td>
                    <span class="code-badge-sm">{{ item.referral_code?.code }}</span>
                  </td>
                  <td>{{ item.claimed_at | date:'yyyy/MM/dd - hh:mm a' }}</td>
                  <td>
                    <span *ngIf="item.estimated_value"><strong>{{ item.estimated_value }}</strong> ج.م</span>
                    <span *ngIf="!item.estimated_value" class="text-subtle">غير محدد بعد</span>
                  </td>
                  <td>
                    <span *ngIf="item.commission_amount" class="text-primary"><strong>{{ item.commission_amount }}</strong> ج.م</span>
                    <span *ngIf="!item.commission_amount" class="text-subtle">—</span>
                  </td>
                  <td>
                    <span class="status-pill" [ngClass]="'status-' + item.status">
                      {{ getStatusArabic(item.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="row-actions" *ngIf="item.status === 'claimed'">
                      <button (click)="openConfirmModal(item)" class="btn-primary btn-micro">
                        <i class="fa-solid fa-check"></i> تأكيد الحضور
                      </button>
                      <button (click)="rejectClaim(item.id)" class="btn-outline btn-micro-danger">
                        <i class="fa-solid fa-xmark"></i> رفض
                      </button>
                    </div>
                    <span *ngIf="item.status !== 'claimed'" class="text-muted text-xs">تمت المعالجة</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 2: Services & Price Ranges Management -->
        <div class="tab-content beauty-card animate-fade-in" *ngIf="activeTab === 'services'">
          <div class="content-header">
            <div>
              <h3>قائمة خدمات المركز والأسعار التقديرية</h3>
              <p>تظهر هذه الخدمات في بروفايل المركز للعميلات مع نطاق السعر التقديري.</p>
            </div>
            <button (click)="openAddServiceModal()" class="btn-primary">
              <i class="fa-solid fa-plus"></i> إضافة خدمة جديدة
            </button>
          </div>

          <div class="services-admin-grid">
            <div
              class="srv-manage-card"
              *ngFor="let srv of centersService.currentCenter()?.center_services"
            >
              <div class="srv-top">
                <h4 class="srv-name">{{ srv.service_name }}</h4>
                <div class="srv-actions">
                  <button (click)="openEditServiceModal(srv)" class="icon-btn edit" title="تعديل"><i class="fa-solid fa-pen"></i></button>
                  <button (click)="deleteService(srv.id)" class="icon-btn delete" title="حذف"><i class="fa-regular fa-trash-can"></i></button>
                </div>
              </div>
              <p class="srv-desc">{{ srv.description || 'خدمة معتمدة لدى المركز.' }}</p>
              <div class="srv-price-box">
                <span>نطاق السعر:</span>
                <strong>{{ srv.price_from }} - {{ srv.price_to }} ج.م</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 3: Finances & Commissions -->
        <div class="tab-content beauty-card animate-fade-in" *ngIf="activeTab === 'finances'">
          <div class="content-header">
            <h3>كشف حساب العمولات والتحويلات المالية</h3>
          </div>

          <div class="finance-cards-grid">
            <div class="fin-card total">
              <span>إجمالي قيمة الزيارات المحققة</span>
              <strong>{{ getConfirmedRevenue() }} ج.م</strong>
            </div>
            <div class="fin-card comm">
              <span>إجمالي عمولات المنصة (10%)</span>
              <strong class="text-primary">{{ getTotalCommissionsOwed() }} ج.م</strong>
            </div>
            <div class="fin-card count">
              <span>عدد الزيارات المؤكدة</span>
              <strong>{{ getConfirmedCount() }} زيارة</strong>
            </div>
          </div>

          <div class="payout-policy-box">
            <i class="fa-solid fa-shield-halved"></i>
            <div>
              <strong>نظام التسوية والتحصيل الشهري للمراكز</strong>
              <p>يتم إصدار فاتورة عمولات المنصة مجمعة في نهاية كل شهر ميلادي وفق الزيارات المؤكدة من المركز عبر البوابة، مع تقرير تفصيلي بكل عميلة وكود الخصم المستخدم.</p>
            </div>
          </div>
        </div>

        <!-- TAB 4: Center Profile & Working Hours -->
        <div class="tab-content beauty-card animate-fade-in" *ngIf="activeTab === 'info'">
          <div class="content-header">
            <h3>بيانات المركز وساعات العمل والموقع</h3>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>اسم المركز التجاري</label>
              <input type="text" [value]="centersService.currentCenter()?.display_name" class="input-custom" />
            </div>
            <div class="form-group">
              <label>رقم هاتف الحجز والاستفسارات</label>
              <input type="tel" [value]="centersService.currentCenter()?.phone" class="input-custom" dir="ltr" />
            </div>
            <div class="form-group">
              <label>المدينة / المحافظة</label>
              <input type="text" [value]="centersService.currentCenter()?.city" class="input-custom" />
            </div>
            <div class="form-group">
              <label>مواعيد العمل اليومية</label>
              <input type="text" [value]="centersService.currentCenter()?.opening_hours" class="input-custom" />
            </div>
            <div class="form-group full-width">
              <label>العنوان بالتفصيل</label>
              <input type="text" [value]="centersService.currentCenter()?.address_line" class="input-custom" />
            </div>
            <div class="form-group full-width">
              <label>النبذة التعريفية المعروضة للعميلات</label>
              <textarea rows="3" [value]="centersService.currentCenter()?.bio" class="input-custom"></textarea>
            </div>
          </div>

          <div class="mt-4">
            <button class="btn-primary" (click)="saveInfoNotice()">
              <i class="fa-solid fa-floppy-disk"></i> حفظ التعديلات
            </button>
            <span class="save-notice" *ngIf="isSavedNotice">تم حفظ التعديلات بنجاح!</span>
          </div>
        </div>
      </div>

      <!-- Modal: Confirm Redemption & Input Invoice Value -->
      <div class="modal-backdrop" *ngIf="isConfirmModalOpen" (click)="isConfirmModalOpen = false"></div>
      <div class="modal-content beauty-card animate-fade-in" *ngIf="isConfirmModalOpen && activeRedemption">
        <div class="modal-header">
          <h3>تأكيد زيارة العميلة واستخدام الكود</h3>
          <button (click)="isConfirmModalOpen = false" class="close-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="modal-body">
          <div class="client-summary-box">
            <strong>العميلة: {{ activeRedemption.user?.full_name || 'سارة أحمد' }}</strong>
            <p>الكود المستخدم: <span class="badge-code">{{ activeRedemption.referral_code?.code }}</span></p>
          </div>

          <div class="form-group mt-3">
            <label>إجمالي قيمة الفاتورة بعد الخصم (ج.م) <span class="req">*</span></label>
            <input
              type="number"
              [(ngModel)]="invoiceValue"
              placeholder="مثال: 1500"
              class="input-custom"
            />
            <small class="hint">ستكون عمولة المنصة ({{ activeRedemption.referral_code?.commission_rate || 10 }}%): <strong>{{ Math.round((invoiceValue || 0) * 0.1) }} ج.م</strong></small>
          </div>
        </div>

        <div class="modal-footer">
          <button (click)="isConfirmModalOpen = false" class="btn-outline">إلغاء</button>
          <button (click)="submitConfirmRedemption()" [disabled]="!invoiceValue || invoiceValue <= 0" class="btn-primary">
            تأكيد واحتساب الزيارة
          </button>
        </div>
      </div>

      <!-- Modal: Add/Edit Center Service -->
      <div class="modal-backdrop" *ngIf="isServiceModalOpen" (click)="isServiceModalOpen = false"></div>
      <div class="modal-content beauty-card animate-fade-in" *ngIf="isServiceModalOpen">
        <div class="modal-header">
          <h3>{{ editingService?.id ? 'تعديل الخدمة' : 'إضافة خدمة جديدة للمركز' }}</h3>
          <button (click)="isServiceModalOpen = false" class="close-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label>اسم الخدمة <span class="req">*</span></label>
            <input type="text" [(ngModel)]="serviceForm.service_name" placeholder="مثال: جلسة علاج الأطراف المتقصفة" class="input-custom" />
          </div>

          <div class="form-grid mt-2">
            <div class="form-group">
              <label>السعر من (ج.م)</label>
              <input type="number" [(ngModel)]="serviceForm.price_from" class="input-custom" />
            </div>
            <div class="form-group">
              <label>السعر إلى (ج.م)</label>
              <input type="number" [(ngModel)]="serviceForm.price_to" class="input-custom" />
            </div>
          </div>

          <div class="form-group mt-2">
            <label>وصف وتفاصيل الخدمة</label>
            <textarea rows="2" [(ngModel)]="serviceForm.description" placeholder="مكونات الجلسة والتقنية المستخدمة..." class="input-custom"></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button (click)="isServiceModalOpen = false" class="btn-outline">إلغاء</button>
          <button (click)="saveService()" [disabled]="!serviceForm.service_name" class="btn-primary">
            حفظ الخدمة
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .center-portal-page {
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
    .center-brand-box {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .ctr-avatar-large {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      object-fit: cover;
      border: 3px solid #FFFFFF;
      box-shadow: var(--shadow-md);
    }
    .badge-row {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.35rem;
    }
    .badge-pill {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;

      &.verified { background: #DCFCE7; color: #15803D; }
      &.code-tag { background: #FEF3C7; color: #92400E; }
    }
    .center-name {
      font-size: 1.85rem;
      font-weight: 900;
      color: var(--color-text-main);
      margin: 0;
    }
    .center-meta {
      font-size: 0.85rem;
      color: var(--color-text-subtle);
      margin-top: 0.25rem;
      i { color: var(--color-primary); }
    }

    .portal-metrics {
      display: flex;
      gap: 1rem;
    }
    .metric-box {
      padding: 0.85rem 1.35rem;
      border-radius: 14px;
      display: flex;
      flex-direction: column;
      .m-lbl { font-size: 0.78rem; color: var(--color-text-muted); }
      .m-val { font-size: 1.35rem; font-weight: 900; }
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

    .tab-content { padding: 2rem; }
    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border-light);
      h3 { font-size: 1.25rem; font-weight: 800; }
      p { font-size: 0.82rem; color: var(--color-text-subtle); margin: 0; }
    }

    /* Table */
    .redemptions-table-wrap { overflow-x: auto; }
    .portal-table {
      width: 100%; border-collapse: collapse; text-align: right;
      th { padding: 0.85rem 1rem; background: #FAF7F5; color: var(--color-text-muted); font-size: 0.82rem; font-weight: 700; border-bottom: 1.5px solid var(--color-border); }
      td { padding: 1rem; border-bottom: 1px solid var(--color-border-light); font-size: 0.88rem; vertical-align: middle; }
      tr.highlight-pending { background: #FFFDF7; }
    }
    .code-badge-sm { background: #FAF7F5; border: 1px solid var(--color-border); padding: 0.2rem 0.5rem; border-radius: 6px; font-weight: 800; letter-spacing: 1px; }
    .status-pill {
      font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 9999px;
      &.status-claimed { background: #FEF3C7; color: #92400E; }
      &.status-confirmed_by_center { background: #DCFCE7; color: #15803D; }
      &.status-paid_out { background: #E0E7FF; color: #4338CA; }
      &.status-rejected { background: #FEE2E2; color: #B91C1C; }
    }
    .row-actions { display: flex; gap: 0.4rem; }
    .btn-micro { padding: 0.35rem 0.75rem; font-size: 0.78rem; }
    .btn-micro-danger { padding: 0.35rem 0.75rem; font-size: 0.78rem; border-color: #EF4444; color: #EF4444; &:hover { background: #EF4444; color: #fff; } }

    /* Services Grid */
    .services-admin-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem;
    }
    .srv-manage-card {
      border: 1px solid var(--color-border); border-radius: 14px; padding: 1.25rem; background: #FAF7F5;
    }
    .srv-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
    .srv-name { font-size: 1rem; font-weight: 800; }
    .srv-actions { display: flex; gap: 0.35rem; }
    .icon-btn {
      width: 28px; height: 28px; border-radius: 6px; border: 1px solid var(--color-border); background: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.75rem;
      &.edit:hover { color: var(--color-primary); border-color: var(--color-primary); }
      &.delete:hover { color: #EF4444; border-color: #EF4444; }
    }
    .srv-desc { font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 0.75rem; line-height: 1.4; }
    .srv-price-box {
      font-size: 0.82rem; color: var(--color-text-subtle);
      strong { font-size: 0.95rem; color: var(--color-primary); margin-right: 0.35rem; }
    }

    /* Finances */
    .finance-cards-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;
    }
    .fin-card {
      padding: 1.5rem; border-radius: 16px; background: #FAF7F5; border: 1px solid var(--color-border);
      span { font-size: 0.82rem; color: var(--color-text-muted); display: block; margin-bottom: 0.4rem; }
      strong { font-size: 1.6rem; font-weight: 900; }
    }
    .payout-policy-box {
      display: flex; align-items: center; gap: 1.25rem; background: #F0FDF4; border: 1px solid #BBF7D0; padding: 1.25rem 1.5rem; border-radius: 14px;
      i { font-size: 2rem; color: #16A34A; }
      strong { color: #166534; display: block; margin-bottom: 0.2rem; }
      p { color: #15803D; font-size: 0.82rem; margin: 0; }
    }

    /* Forms & Modals */
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .full-width { grid-column: 1 / -1; }
    .mt-2 { margin-top: 0.75rem; }
    .mt-4 { margin-top: 1.5rem; display: flex; align-items: center; gap: 1rem; }
    .save-notice { color: #10B981; font-weight: 700; font-size: 0.88rem; }
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(30, 27, 24, 0.5); backdrop-filter: blur(4px); z-index: 2000; }
    .modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 500px; background: #FFFFFF; border-radius: 20px; padding: 2rem; z-index: 2001; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid var(--color-border-light); margin-bottom: 1.25rem; h3 { font-size: 1.2rem; font-weight: 800; } }
    .close-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--color-border-light); }
    .client-summary-box { background: #FAF7F5; padding: 1rem; border-radius: 12px; }
    .badge-code { background: #FEF3C7; color: #92400E; padding: 0.2rem 0.5rem; border-radius: 6px; font-weight: 800; }
    .hint { font-size: 0.78rem; color: var(--color-text-subtle); display: block; margin-top: 0.35rem; }
    .empty-state { text-align: center; padding: 3.5rem 2rem; .empty-icon { font-size: 2.8rem; color: var(--color-primary); margin-bottom: 0.75rem; } }
  `]
})
export class CenterPortalComponent {
  centersService = inject(CentersService);
  referralsService = inject(ReferralsService);
  auth = inject(AuthService);
  Math = Math;

  activeTab: 'redemptions' | 'services' | 'finances' | 'info' = 'redemptions';

  isConfirmModalOpen: boolean = false;
  activeRedemption: ReferralRedemption | null = null;
  invoiceValue: number = 1500;

  isServiceModalOpen: boolean = false;
  editingService: CenterService | null = null;
  serviceForm: Partial<CenterService> = { service_name: '', price_from: 500, price_to: 1000, description: '' };

  isSavedNotice: boolean = false;

  getStatusArabic(status: RedemptionStatus): string {
    const map: Record<RedemptionStatus, string> = {
      claimed: 'طلب جديد (بانتظار التأكيد)',
      confirmed_by_center: 'مؤكد وتمت الزيارة ✓',
      paid_out: 'مكتمل ومسجل',
      rejected: 'مرفوض'
    };
    return map[status] || status;
  }

  getPendingClaimsCount(): number {
    return this.referralsService.myCenterRedemptions().filter(r => r.status === 'claimed').length;
  }

  getConfirmedCount(): number {
    return this.referralsService.myCenterRedemptions().filter(r => r.status === 'confirmed_by_center' || r.status === 'paid_out').length;
  }

  getConfirmedRevenue(): number {
    return this.referralsService.myCenterRedemptions()
      .filter(r => r.status === 'confirmed_by_center' || r.status === 'paid_out')
      .reduce((sum, r) => sum + (r.estimated_value || 0), 0);
  }

  getTotalCommissionsOwed(): number {
    return this.referralsService.myCenterRedemptions()
      .filter(r => r.status === 'confirmed_by_center' || r.status === 'paid_out')
      .reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  }

  openConfirmModal(redemption: ReferralRedemption): void {
    this.activeRedemption = redemption;
    this.invoiceValue = 1500;
    this.isConfirmModalOpen = true;
  }

  async submitConfirmRedemption(): Promise<void> {
    if (!this.activeRedemption || !this.invoiceValue) return;
    await this.referralsService.confirmRedemption(this.activeRedemption.id, this.invoiceValue);
    this.isConfirmModalOpen = false;
  }

  async rejectClaim(id: string): Promise<void> {
    if (confirm('هل أنتِ متأكدة من رفض هذا الكود؟')) {
      await this.referralsService.rejectRedemption(id);
    }
  }

  openAddServiceModal(): void {
    this.editingService = null;
    this.serviceForm = { service_name: '', price_from: 600, price_to: 1200, description: '' };
    this.isServiceModalOpen = true;
  }

  openEditServiceModal(service: CenterService): void {
    this.editingService = service;
    this.serviceForm = { ...service };
    this.isServiceModalOpen = true;
  }

  async saveService(): Promise<void> {
    const center = this.centersService.currentCenter();
    if (!center || !this.serviceForm.service_name) return;

    await this.centersService.saveCenterService(center.id, {
      id: this.editingService?.id,
      ...this.serviceForm
    });
    this.isServiceModalOpen = false;
  }

  async deleteService(serviceId: string): Promise<void> {
    const center = this.centersService.currentCenter();
    if (!center) return;
    if (confirm('هل أنتِ متأكدة من حذف هذه الخدمة؟')) {
      await this.centersService.deleteCenterService(center.id, serviceId);
    }
  }

  saveInfoNotice(): void {
    this.isSavedNotice = true;
    setTimeout(() => (this.isSavedNotice = false), 3000);
  }
}
