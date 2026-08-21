import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingsService } from '../../../core/services/bookings.service';
import { AuthService } from '../../../core/services/auth.service';
import { Booking, BookingStatus } from '../../../core/models';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="my-bookings-page">
      <div class="container-custom">
        <!-- Page Header -->
        <div class="bookings-header">
          <div>
            <div class="breadcrumb">
              <a routerLink="/">الرئيسية</a>
              <i class="fa-solid fa-chevron-left"></i>
              <span>حجوزاتي وجلساتي المنزلية</span>
            </div>
            <h1 class="page-title">متابعة الجلسات المنزلية</h1>
          </div>
          <a routerLink="/booking/request" class="btn-primary">
            <i class="fa-solid fa-plus"></i> حجز جلسة جديدة
          </a>
        </div>

        <!-- Empty State -->
        <div class="empty-bookings beauty-card" *ngIf="bookingsService.myCustomerBookings().length === 0">
          <div class="empty-icon"><i class="fa-solid fa-calendar-check"></i></div>
          <h3>لا توجد حجوزات جلسات حالية</h3>
          <p>احجزي جلستكِ الأولى مع أفضل أخصائيات العناية بالشعر والبشرة الآن.</p>
          <a routerLink="/booking/request" class="btn-primary">احجزي جلستكِ الأولى</a>
        </div>

        <!-- Bookings List -->
        <div class="bookings-grid" *ngIf="bookingsService.myCustomerBookings().length > 0">
          <div
            class="booking-card beauty-card animate-fade-in"
            *ngFor="let b of bookingsService.myCustomerBookings()"
          >
            <!-- Card Top Bar -->
            <div class="b-card-header">
              <div>
                <span class="booking-num">حجز رقم: <strong>#{{ b.id }}</strong></span>
                <span class="booking-created">{{ b.created_at | date:'yyyy/MM/dd - hh:mm a' }}</span>
              </div>
              <span class="status-pill" [ngClass]="'status-' + b.status">
                {{ getStatusArabic(b.status) }}
              </span>
            </div>

            <!-- Card Body Info -->
            <div class="b-card-body">
              <div class="service-details">
                <div class="srv-icon-box">
                  <i class="fa-solid fa-feather-pointed" *ngIf="b.service_type.includes('شعر')"></i>
                  <i class="fa-solid fa-wand-magic-sparkles" *ngIf="b.service_type.includes('بشرة')"></i>
                  <i class="fa-solid fa-crown" *ngIf="!b.service_type.includes('شعر') && !b.service_type.includes('بشرة')"></i>
                </div>
                <div>
                  <h3 class="b-srv-title">{{ b.service_type }}</h3>
                  <div class="b-meta-line">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>{{ b.requested_area }}</span>
                  </div>
                  <div class="b-meta-line" *ngIf="b.scheduled_at">
                    <i class="fa-regular fa-clock"></i>
                    <span>الموعد: <strong>{{ b.scheduled_at | date:'fullDate':'':'ar-EG' }}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Offer & Specialist Section (When status is offered or higher) -->
              <div class="provider-offer-box" *ngIf="b.provider">
                <div class="provider-profile-mini">
                  <img [src]="b.provider.avatar_url" [alt]="b.provider.display_name" class="p-avatar" />
                  <div>
                    <span class="p-role">الأخصائية المرشحة</span>
                    <strong class="p-name">{{ b.provider.display_name }}</strong>
                    <div class="p-rating">★ {{ b.provider.rating_avg }} ({{ b.provider.rating_count }} تقييم)</div>
                  </div>
                </div>

                <div class="offer-price-tag">
                  <span>السعر المعتمد:</span>
                  <strong class="price-val">{{ b.agreed_price }} <small>ج.م</small></strong>
                  <span class="pay-status paid" *ngIf="b.payment_status === 'paid'">
                    <i class="fa-solid fa-circle-check"></i> تم الدفع أونلاين
                  </span>
                  <span class="pay-status unpaid" *ngIf="b.payment_status === 'unpaid'">
                    بانتظار التأكيد والدفع
                  </span>
                </div>
              </div>

              <!-- Waiting for Admin matching notice -->
              <div class="waiting-notice" *ngIf="b.status === 'requested'">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <div>
                  <strong>جاري المراجعة وترشيح الأخصائية</strong>
                  <p>تراجع الإدارة طلبك حالياً لترشيح أفضل أخصائية قريبة من موقعكِ وإرسال عرض السعر النهائي.</p>
                </div>
              </div>

              <!-- Existing Review if completed and reviewed -->
              <div class="completed-review-box" *ngIf="b.review">
                <span class="rev-label"><i class="fa-solid fa-star"></i> تقييمكِ للجلسة:</span>
                <span class="rev-stars">★★★★★</span>
                <p class="rev-text">"{{ b.review.comment }}"</p>
              </div>
            </div>

            <!-- Card Actions Footer -->
            <div class="b-card-footer">
              <!-- If Offered: Customer can Accept & Pay -->
              <div class="action-row" *ngIf="b.status === 'offered'">
                <span class="offer-alert">
                  <i class="fa-solid fa-bell"></i> تم إعداد العرض الخاص بكِ!
                </span>
                <button (click)="openOfferModal(b)" class="btn-primary pay-btn">
                  <i class="fa-solid fa-credit-card"></i> مراجعة العرض وتأكيد الدفع ({{ b.agreed_price }} ج.م)
                </button>
              </div>

              <!-- If Confirmed: Customer waiting for specialist -->
              <div class="action-row" *ngIf="b.status === 'confirmed'">
                <span class="confirmed-msg">
                  <i class="fa-solid fa-circle-check"></i> تم تأكيد الحجز! ستصلك الأخصائية في الموعد المحدد.
                </span>
                <button (click)="openReportModal(b)" class="btn-outline btn-sm">
                  <i class="fa-solid fa-circle-exclamation"></i> إبلاغ عن مشكلة
                </button>
              </div>

              <!-- If In Progress -->
              <div class="action-row" *ngIf="b.status === 'in_progress'">
                <span class="in-progress-msg">
                  <i class="fa-solid fa-spa fa-beat"></i> الجلسة جارية حالياً... نتمنى لكِ وقتاً ممتعاً!
                </span>
              </div>

              <!-- If Completed: Rate or Report -->
              <div class="action-row" *ngIf="b.status === 'completed'">
                <span class="completed-msg">
                  <i class="fa-solid fa-gem"></i> اكتملت الجلسة وتم إضافة نقاط الولاء لحسابكِ
                </span>
                <div class="footer-btns">
                  <button
                    *ngIf="!b.review"
                    (click)="openReviewModal(b)"
                    class="btn-primary btn-sm"
                  >
                    <i class="fa-solid fa-star"></i> تقييم الأخصائية
                  </button>
                  <button (click)="openReportModal(b)" class="btn-outline btn-sm">
                    <i class="fa-solid fa-flag"></i> بلاغ للإدارة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal 1: Offer Review & Instant Payment Simulation -->
      <div class="modal-backdrop" *ngIf="isOfferModalOpen" (click)="isOfferModalOpen = false"></div>
      <div class="modal-content beauty-card animate-fade-in" *ngIf="isOfferModalOpen && activeBooking">
        <div class="modal-header">
          <h3>مراجعة عرض الجلسة وتأكيد الدفع</h3>
          <button (click)="isOfferModalOpen = false" class="close-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="modal-body">
          <div class="offer-summary-box">
            <h4>{{ activeBooking.service_type }}</h4>
            <p><i class="fa-solid fa-location-dot"></i> {{ activeBooking.requested_area }}</p>
            <p><i class="fa-regular fa-clock"></i> {{ activeBooking.scheduled_at | date:'mediumDate' }}</p>
          </div>

          <div class="specialist-card-detailed" *ngIf="activeBooking.provider">
            <img [src]="activeBooking.provider.avatar_url" class="spec-img" />
            <div>
              <strong>الأخصائية: {{ activeBooking.provider.display_name }}</strong>
              <div class="spec-rating">★ {{ activeBooking.provider.rating_avg }} ({{ activeBooking.provider.rating_count }} تقييم موثق)</div>
              <p class="spec-bio">{{ activeBooking.provider.bio }}</p>
            </div>
          </div>

          <!-- Payment Details -->
          <div class="pay-breakdown">
            <div class="p-line">
              <span>قيمة الجلسة المعتمدة:</span>
              <strong>{{ activeBooking.agreed_price }} ج.م</strong>
            </div>
            <div class="p-line">
              <span>مصاريف الانتقال والتعقيم:</span>
              <strong class="text-success">مجاناً (شاملة)</strong>
            </div>
            <div class="p-line total">
              <span>الإجمالي للدفع:</span>
              <strong class="total-val">{{ activeBooking.agreed_price }} ج.م</strong>
            </div>
          </div>

          <div class="payment-method-selector">
            <label class="pay-chip selected">
              <i class="fa-solid fa-credit-card"></i>
              <span>بطاقة بنكية / Paymob Gateway (آمن 100%)</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button (click)="isOfferModalOpen = false" class="btn-outline">تراجع</button>
          <button (click)="confirmAndPay()" [disabled]="isPaying" class="btn-primary">
            <span *ngIf="!isPaying"><i class="fa-solid fa-lock"></i> تأكيد ودفع {{ activeBooking.agreed_price }} ج.م</span>
            <span *ngIf="isPaying"><i class="fa-solid fa-spinner fa-spin"></i> جاري معالجة الدفع...</span>
          </button>
        </div>
      </div>

      <!-- Modal 2: Submit Session Review -->
      <div class="modal-backdrop" *ngIf="isReviewModalOpen" (click)="isReviewModalOpen = false"></div>
      <div class="modal-content beauty-card animate-fade-in" *ngIf="isReviewModalOpen && activeBooking">
        <div class="modal-header">
          <h3>تقييم الأخصائية والجلسة</h3>
          <button (click)="isReviewModalOpen = false" class="close-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="modal-body">
          <p class="review-prompt">كيف كانت تجربتكِ مع الأخصائية <strong>{{ activeBooking.provider?.display_name }}</strong>؟</p>

          <div class="star-rating-selector">
            <button
              *ngFor="let star of [1,2,3,4,5]"
              class="star-btn"
              [class.active]="selectedRating >= star"
              (click)="selectedRating = star"
            >
              ★
            </button>
          </div>

          <div class="form-group mt-3">
            <label>اكتبي رأيكِ وتجربتكِ بالتفصيل</label>
            <textarea
              [(ngModel)]="reviewComment"
              rows="3"
              placeholder="مثال: الخدمة ممتازة، الأخصائية وصلت في الموعد وأجهزتها معقمة ونتائج البروتين رائعة..."
              class="input-custom"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button (click)="isReviewModalOpen = false" class="btn-outline">إلغاء</button>
          <button (click)="submitReview()" class="btn-primary">إرسال التقييم</button>
        </div>
      </div>

      <!-- Modal 3: Report Issue -->
      <div class="modal-backdrop" *ngIf="isReportModalOpen" (click)="isReportModalOpen = false"></div>
      <div class="modal-content beauty-card animate-fade-in" *ngIf="isReportModalOpen && activeBooking">
        <div class="modal-header">
          <h3>إبلاغ الإدارة عن مشكلة</h3>
          <button (click)="isReportModalOpen = false" class="close-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="modal-body">
          <p class="report-prompt">
            نهتم جداً برضاكِ وضمان أعلى معايير الجودة. يرجى توضيح سبب البلاغ وسيتم التواصل معكِ فوراً من فريق الإدارة.
          </p>

          <div class="form-group mt-3">
            <label>تفاصيل المشكلة <span class="req">*</span></label>
            <textarea
              [(ngModel)]="reportDescription"
              rows="4"
              placeholder="اكتبي تفاصيل ما حدث..."
              class="input-custom"
            ></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button (click)="isReportModalOpen = false" class="btn-outline">إلغاء</button>
          <button (click)="submitReport()" [disabled]="!reportDescription.trim()" class="btn-primary btn-danger">
            إرسال البلاغ للإدارة
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .my-bookings-page {
      padding: 2.5rem 0 5rem;
      background: #FAF7F5;
      min-height: 85vh;
    }
    .bookings-header {
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

    .bookings-grid {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .booking-card {
      padding: 1.75rem 2rem;
    }
    .b-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border-light);
      margin-bottom: 1.25rem;
    }
    .booking-num {
      font-size: 1.05rem;
      color: var(--color-text-main);
      margin-left: 1rem;
    }
    .booking-created { font-size: 0.8rem; color: var(--color-text-subtle); }
    .status-pill {
      font-size: 0.82rem;
      font-weight: 700;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;

      &.status-requested { background: #FEF3C7; color: #92400E; }
      &.status-offered { background: #FDE68A; color: #78350F; animation: pulse 2s infinite; }
      &.status-confirmed { background: #DCFCE7; color: #15803D; }
      &.status-in_progress { background: #DBEAFE; color: #1E40AF; }
      &.status-completed { background: #E0E7FF; color: #4338CA; }
      &.status-reported { background: #FEE2E2; color: #B91C1C; }
    }

    .b-card-body {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 2rem;
      align-items: center;

      @media (max-width: 860px) {
        grid-template-columns: 1fr;
      }
    }
    .service-details {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
    }
    .srv-icon-box {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      background: var(--color-primary-light);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
      flex-shrink: 0;
    }
    .b-srv-title {
      font-size: 1.15rem;
      font-weight: 800;
      margin-bottom: 0.4rem;
    }
    .b-meta-line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--color-text-muted);
      margin-bottom: 0.25rem;

      i { color: var(--color-primary); }
    }

    .provider-offer-box {
      background: #FAF7F5;
      border: 1px solid var(--color-border);
      padding: 1.25rem;
      border-radius: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .provider-profile-mini {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .p-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #FFFFFF;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    .p-role { font-size: 0.72rem; color: var(--color-text-subtle); display: block; }
    .p-name { font-size: 0.95rem; display: block; }
    .p-rating { font-size: 0.78rem; color: #D97706; font-weight: 700; }
    .offer-price-tag {
      text-align: left;
      span { font-size: 0.78rem; color: var(--color-text-subtle); display: block; }
      .price-val { font-size: 1.3rem; color: var(--color-primary); }
      .pay-status {
        font-size: 0.75rem;
        font-weight: 700;
        display: block;
        &.paid { color: #15803D; }
        &.unpaid { color: #D97706; }
      }
    }

    .waiting-notice {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      padding: 1rem 1.25rem;
      border-radius: 14px;
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #92400E;

      i { font-size: 1.3rem; }
      strong { font-size: 0.9rem; display: block; }
      p { font-size: 0.78rem; margin: 0; }
    }

    .completed-review-box {
      background: #FDF4F2;
      padding: 0.85rem 1.15rem;
      border-radius: 12px;
      border: 1px solid var(--color-border);
      .rev-label { font-size: 0.8rem; font-weight: 700; color: var(--color-primary); }
      .rev-stars { color: #F59E0B; margin-right: 0.5rem; font-size: 0.85rem; }
      .rev-text { font-size: 0.82rem; color: var(--color-text-main); margin: 0.25rem 0 0; font-style: italic; }
    }

    .b-card-footer {
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-light);
    }
    .action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .offer-alert { color: #D97706; font-weight: 700; font-size: 0.9rem; }
    .confirmed-msg { color: #15803D; font-weight: 700; font-size: 0.9rem; }
    .in-progress-msg { color: #1E40AF; font-weight: 700; font-size: 0.9rem; }
    .completed-msg { color: #4338CA; font-weight: 700; font-size: 0.88rem; }
    .footer-btns { display: flex; gap: 0.5rem; }
    .btn-sm { padding: 0.45rem 1rem; font-size: 0.82rem; }

    /* Modals */
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: rgba(30, 27, 24, 0.5);
      backdrop-filter: blur(4px);
      z-index: 2000;
    }
    .modal-content {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 90%; max-width: 540px;
      max-height: 90vh; overflow-y: auto;
      background: #FFFFFF;
      border-radius: 20px;
      padding: 2rem;
      z-index: 2001;
      box-shadow: 0 20px 50px rgba(0,0,0,0.2);
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding-bottom: 1rem; border-bottom: 1px solid var(--color-border-light);
      margin-bottom: 1.25rem;
      h3 { font-size: 1.25rem; font-weight: 800; }
    }
    .close-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; }
    .offer-summary-box {
      background: #FAF7F5; padding: 1rem; border-radius: 12px; margin-bottom: 1rem;
      h4 { font-size: 1.05rem; font-weight: 800; margin-bottom: 0.35rem; }
      p { font-size: 0.82rem; color: var(--color-text-muted); margin: 0.15rem 0; }
    }
    .specialist-card-detailed {
      display: flex; gap: 1rem; padding: 1rem; background: #FFFDF7;
      border: 1px solid #EADBCE; border-radius: 14px; margin-bottom: 1.25rem;
    }
    .spec-img { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }
    .spec-rating { font-size: 0.8rem; color: #D97706; font-weight: 700; }
    .spec-bio { font-size: 0.78rem; color: var(--color-text-muted); margin-top: 0.2rem; }
    .pay-breakdown {
      border-top: 1px solid var(--color-border-light); padding-top: 0.85rem; margin-bottom: 1rem;
    }
    .p-line {
      display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 0.4rem;
      color: var(--color-text-muted);
      &.total { font-size: 1.1rem; font-weight: 800; color: var(--color-text-main); margin-top: 0.5rem; }
      .total-val { font-size: 1.35rem; color: var(--color-primary); }
    }
    .pay-chip {
      display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem;
      border: 1.5px solid var(--color-primary); background: var(--color-primary-subtle);
      border-radius: 10px; font-size: 0.88rem; font-weight: 700; color: var(--color-primary);
    }
    .modal-footer {
      display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;
      padding-top: 1rem; border-top: 1px solid var(--color-border-light);
    }

    .star-rating-selector {
      display: flex; gap: 0.5rem; justify-content: center; margin: 1rem 0;
    }
    .star-btn {
      background: none; border: none; font-size: 2.2rem; color: #D1D5DB; cursor: pointer;
      transition: color 0.2s ease;
      &.active { color: #F59E0B; }
    }
    .mt-3 { margin-top: 1rem; }
    .btn-danger { background: #EF4444; border-color: #EF4444; }
    .empty-bookings {
      text-align: center; padding: 4rem 2rem;
      .empty-icon { font-size: 3rem; color: var(--color-primary); margin-bottom: 1rem; }
    }
  `]
})
export class MyBookingsComponent {
  bookingsService = inject(BookingsService);
  auth = inject(AuthService);

  isOfferModalOpen: boolean = false;
  isReviewModalOpen: boolean = false;
  isReportModalOpen: boolean = false;
  activeBooking: Booking | null = null;

  isPaying: boolean = false;
  selectedRating: number = 5;
  reviewComment: string = '';
  reportDescription: string = '';

  getStatusArabic(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      requested: 'طلب جديد (قيد المراجعة والترشيح)',
      offered: 'تم تجهيز العرض (بانتظار موافقتكِ والدفع)',
      confirmed: 'تم تأكيد الحجز والدفع',
      in_progress: 'الجلسة جارية حالياً',
      completed: 'اكتملت الجلسة',
      cancelled: 'ملغي',
      reported: 'تم رفع بلاغ للإدارة'
    };
    return map[status] || status;
  }

  openOfferModal(booking: Booking): void {
    this.activeBooking = booking;
    this.isOfferModalOpen = true;
  }

  async confirmAndPay(): Promise<void> {
    if (!this.activeBooking) return;
    this.isPaying = true;
    await new Promise(r => setTimeout(r, 600)); // Paymob simulation
    await this.bookingsService.acceptBookingOffer(this.activeBooking.id);
    this.isPaying = false;
    this.isOfferModalOpen = false;
  }

  openReviewModal(booking: Booking): void {
    this.activeBooking = booking;
    this.selectedRating = 5;
    this.reviewComment = '';
    this.isReviewModalOpen = true;
  }

  async submitReview(): Promise<void> {
    if (!this.activeBooking) return;
    await this.bookingsService.submitReview(this.activeBooking.id, this.selectedRating, this.reviewComment);
    this.isReviewModalOpen = false;
  }

  openReportModal(booking: Booking): void {
    this.activeBooking = booking;
    this.reportDescription = '';
    this.isReportModalOpen = true;
  }

  async submitReport(): Promise<void> {
    if (!this.activeBooking || !this.reportDescription.trim()) return;
    await this.bookingsService.submitReport(this.activeBooking.id, this.reportDescription);
    this.isReportModalOpen = false;
  }
}
