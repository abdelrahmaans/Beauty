import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingsService } from '../../../core/services/bookings.service';
import { AuthService } from '../../../core/services/auth.service';
import { HOME_CARE_SERVICES } from '../../../core/mock/mock-data';

@Component({
  selector: 'app-request-service',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="request-service-page">
      <!-- Top Hero Header -->
      <section class="booking-hero">
        <div class="container-custom">
          <div class="hero-text-center animate-fade-in">
            <span class="badge-emerald"><i class="fa-solid fa-sparkles"></i> جلسات العناية في راحة منزلك</span>
            <h1 class="hero-title">احجزي جلستكِ المنزلية مع <span class="highlight-text">أفضل الأخصائيات المعتمدات</span></h1>
            <p class="hero-sub">
              بدون عناء الانتظار في الصالونات، نرسل لكِ أخصائية خبيرة بأحدث أجهزة النانو والبروتين الطبيعي ومنتجات العناية الأصلية لباب بيتكِ.
            </p>
          </div>
        </div>
      </section>

      <!-- Main Booking Flow Container -->
      <section class="booking-flow-section">
        <div class="container-custom">
          <div class="flow-layout">
            <!-- Left/Main Form -->
            <div class="flow-main">
              <!-- Step 1: Select Service -->
              <div class="flow-card beauty-card">
                <div class="card-step-header">
                  <span class="step-num">1</span>
                  <div>
                    <h3>اختاري نوع جلسة العناية</h3>
                    <p>حددي الخدمة التي تناسب احتياج شعرك أو بشرتك</p>
                  </div>
                </div>

                <div class="services-grid">
                  <div
                    *ngFor="let srv of services"
                    class="service-card"
                    [class.selected]="selectedServiceId === srv.id"
                    (click)="selectedServiceId = srv.id"
                  >
                    <div class="srv-radio">
                      <i class="fa-solid fa-check" *ngIf="selectedServiceId === srv.id"></i>
                    </div>
                    <div class="srv-content">
                      <div class="srv-top">
                        <span class="srv-title">{{ srv.title }}</span>
                        <span class="srv-price">تبدأ من <strong>{{ srv.basePrice }}</strong> ج.م</span>
                      </div>
                      <p class="srv-desc">{{ srv.description }}</p>
                      <div class="srv-meta">
                        <span><i class="fa-regular fa-clock"></i> المدة التقديرية: {{ srv.duration }}</span>
                        <span class="badge-pill" [class.hair]="srv.category === 'hair'" [class.skin]="srv.category === 'skin'">
                          {{ srv.category === 'hair' ? 'عناية بالشعر' : srv.category === 'skin' ? 'عناية بالبشرة' : 'بكج شامل' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Step 2: Location & Address -->
              <div class="flow-card beauty-card">
                <div class="card-step-header">
                  <span class="step-num">2</span>
                  <div>
                    <h3>عنوان الجلسة والمنطقة</h3>
                    <p>نستخدم الموقع لاقتراح أقرب وأكفأ أخصائية في منطقتكِ</p>
                  </div>
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label>المنطقة / المحافظة <span class="req">*</span></label>
                    <select [(ngModel)]="requestedCity" class="input-custom">
                      <option value="التجمع الخامس والقاهرة الجديدة">التجمع الخامس والقاهرة الجديدة</option>
                      <option value="المعادي">المعادي</option>
                      <option value="مدينة نصر ومصر الجديدة">مدينة نصر ومصر الجديدة</option>
                      <option value="الشيخ زايد و 6 أكتوبر">الشيخ زايد و 6 أكتوبر</option>
                      <option value="المهندسين والدقي">المهندسين والدقي</option>
                      <option value="بني سويف">بني سويف</option>
                      <option value="المنصورة">المنصورة</option>
                      <option value="الإسكندرية">الإسكندرية</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>العنوان بالتفصيل (الشارع، العمارة، الشقة) <span class="req">*</span></label>
                    <input
                      type="text"
                      [(ngModel)]="detailedAddress"
                      placeholder="مثال: شارع التسعين الشمالي، عمارة 15، شقة 4"
                      class="input-custom"
                    />
                  </div>
                </div>
              </div>

              <!-- Step 3: Preferred Date & Time -->
              <div class="flow-card beauty-card">
                <div class="card-step-header">
                  <span class="step-num">3</span>
                  <div>
                    <h3>الموعد المفضل وتفاصيل التواصل</h3>
                    <p>اختاري الوقت المناسب لكِ للتنسيق مع الأخصائية</p>
                  </div>
                </div>

                <div class="form-grid">
                  <div class="form-group">
                    <label>تاريخ الجلسة المطلوب <span class="req">*</span></label>
                    <input type="date" [(ngModel)]="sessionDate" class="input-custom" />
                  </div>

                  <div class="form-group">
                    <label>الوقت المفضل <span class="req">*</span></label>
                    <select [(ngModel)]="sessionTime" class="input-custom">
                      <option value="11:00 AM">صباحاً (11:00 ص - 01:00 م)</option>
                      <option value="02:00 PM">ظهراً (02:00 م - 04:00 م)</option>
                      <option value="05:00 PM">عصراً (05:00 م - 07:00 م)</option>
                      <option value="08:00 PM">مساءً (08:00 م - 10:00 م)</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>اسمكِ بالكامل <span class="req">*</span></label>
                    <input type="text" [(ngModel)]="customerName" class="input-custom" />
                  </div>

                  <div class="form-group">
                    <label>رقم الموبايل <span class="req">*</span></label>
                    <input type="tel" [(ngModel)]="customerPhone" class="input-custom" dir="ltr" />
                  </div>

                  <div class="form-group full-width">
                    <label>ملاحظات إضافية عن طبيعة شعرك أو بشرتك (اختياري)</label>
                    <textarea
                      [(ngModel)]="sessionNotes"
                      rows="2"
                      placeholder="مثال: الشعر معالج بصبغة من شهر، أو البشرة حساسة تجاه المقشرات القوية..."
                      class="input-custom"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Flow Summary & How It Works -->
            <div class="flow-sidebar">
              <div class="sidebar-summary beauty-card">
                <h3 class="side-title">ملخص طلب الخدمة</h3>

                <div class="selected-srv-preview" *ngIf="getSelectedService()">
                  <strong>{{ getSelectedService()?.title }}</strong>
                  <span class="price-range">السعر التقديري: <strong>{{ getSelectedService()?.basePrice }} ج.م</strong></span>
                </div>

                <div class="how-it-works-box">
                  <h4><i class="fa-solid fa-route"></i> كيف تتم العملية؟</h4>
                  <ul class="steps-timeline">
                    <li>
                      <span class="bullet">1</span>
                      <div>
                        <strong>إرسال طلبك</strong>
                        <p>تستقبل الإدارة رغبتك وموقعك وميعادك المفضل.</p>
                      </div>
                    </li>
                    <li>
                      <span class="bullet">2</span>
                      <div>
                        <strong>الترشيح الذكي ومراجعة الإدارة</strong>
                        <p>يرشح النظام أفضل الأخصائيات المعتمدات وتراجع الإدارة السعر النهائي.</p>
                      </div>
                    </li>
                    <li>
                      <span class="bullet">3</span>
                      <div>
                        <strong>موافقة وتأكيد ودفع آمن</strong>
                        <p>تصلك تفاصيل الأخصائية (تقييمها + السعر) وتأكدي الحجز بضغطة زر.</p>
                      </div>
                    </li>
                    <li>
                      <span class="bullet">4</span>
                      <div>
                        <strong>جلسة مريحة في بيتك</strong>
                        <p>تصل الأخصائية بكامل المعدات وتستمتعي بجلسة العناية الفاخرة.</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <button
                  (click)="submitBookingRequest()"
                  [disabled]="isSubmitting || !isFormValid()"
                  class="btn-primary submit-booking-btn"
                >
                  <span *ngIf="!isSubmitting">
                    <i class="fa-solid fa-paper-plane"></i> إرسال طلب الجلسة
                  </span>
                  <span *ngIf="isSubmitting">
                    <i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...
                  </span>
                </button>

                <p class="trust-micro">
                  <i class="fa-solid fa-shield-halved"></i> جميع الأخصائيات موثقات بالهوية وشهادات الخبرة ومراجعات من عميلات حقيقيات.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .request-service-page {
      padding-bottom: 5rem;
      background: #FAF7F5;
      min-height: 85vh;
    }
    .booking-hero {
      background: radial-gradient(circle at top center, #FDF4F2 0%, var(--color-bg-main) 80%);
      padding: 3.5rem 0 2rem;
      border-bottom: 1px solid var(--color-border-light);
    }
    .hero-text-center {
      text-align: center;
      max-width: 760px;
      margin: 0 auto;
    }
    .badge-emerald {
      background: var(--color-secondary-light);
      color: var(--color-secondary);
      font-weight: 700;
      font-size: 0.85rem;
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      margin-bottom: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .hero-title {
      font-size: 2.4rem;
      font-weight: 900;
      line-height: 1.3;
      margin-bottom: 1rem;
      color: var(--color-text-main);

      @media (max-width: 600px) { font-size: 1.85rem; }
    }
    .highlight-text {
      background: linear-gradient(135deg, var(--color-primary) 0%, #D4AF37 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero-sub {
      font-size: 1rem;
      color: var(--color-text-muted);
      line-height: 1.7;
    }

    .booking-flow-section {
      padding: 3rem 0;
    }
    .flow-layout {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2.5rem;
      align-items: flex-start;

      @media (max-width: 960px) {
        grid-template-columns: 1fr;
      }
    }
    .flow-main {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .flow-card {
      padding: 2rem;
    }
    .card-step-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border-light);

      .step-num {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--color-primary);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 1.05rem;
        flex-shrink: 0;
      }
      h3 { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.15rem; }
      p { font-size: 0.82rem; color: var(--color-text-subtle); margin: 0; }
    }

    .services-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .service-card {
      display: flex;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      border: 1.5px solid var(--color-border);
      border-radius: 16px;
      cursor: pointer;
      transition: var(--transition-smooth);
      background: #FAF7F5;

      &:hover {
        border-color: var(--color-primary);
        transform: translateY(-2px);
      }
      &.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-subtle);
        box-shadow: 0 4px 14px rgba(196, 109, 91, 0.15);
      }
    }
    .srv-radio {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 0.2rem;
      color: #fff;
      font-size: 0.75rem;
      background: #fff;
      flex-shrink: 0;

      .service-card.selected & {
        background: var(--color-primary);
        border-color: var(--color-primary);
      }
    }
    .srv-content { flex: 1; }
    .srv-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.4rem;
    }
    .srv-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--color-text-main);
    }
    .srv-price {
      font-size: 0.9rem;
      color: var(--color-primary);
      strong { font-size: 1.2rem; }
    }
    .srv-desc {
      font-size: 0.85rem;
      color: var(--color-text-muted);
      line-height: 1.5;
      margin-bottom: 0.75rem;
    }
    .srv-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: var(--color-text-subtle);
    }
    .badge-pill {
      font-weight: 700;
      font-size: 0.75rem;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      &.hair { background: #FEF3C7; color: #92400E; }
      &.skin { background: #DBEAFE; color: #1E40AF; }
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }
    .full-width { grid-column: 1 / -1; }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      label { font-size: 0.88rem; font-weight: 700; }
      .req { color: #EF4444; }
    }

    .flow-sidebar {
      position: sticky;
      top: 100px;
    }
    .sidebar-summary {
      padding: 2rem;
    }
    .side-title {
      font-size: 1.25rem;
      font-weight: 800;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border-light);
    }
    .selected-srv-preview {
      background: #FAF7F5;
      padding: 1rem;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      strong { font-size: 0.95rem; display: block; margin-bottom: 0.25rem; }
      .price-range { font-size: 0.85rem; color: var(--color-primary); }
    }
    .how-it-works-box {
      margin-bottom: 1.75rem;
      h4 { font-size: 1rem; font-weight: 800; margin-bottom: 1rem; }
    }
    .steps-timeline {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      li {
        display: flex;
        gap: 0.85rem;
        align-items: flex-start;
      }
      .bullet {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--color-primary-light);
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.75rem;
        flex-shrink: 0;
      }
      strong { font-size: 0.85rem; display: block; }
      p { font-size: 0.75rem; color: var(--color-text-subtle); margin: 0; line-height: 1.4; }
    }
    .submit-booking-btn {
      width: 100%;
      padding: 0.95rem;
      font-size: 1.05rem;

      &:disabled { opacity: 0.6; cursor: not-allowed; }
    }
    .trust-micro {
      font-size: 0.75rem;
      color: var(--color-text-subtle);
      margin-top: 1rem;
      text-align: center;
      line-height: 1.4;
    }
  `]
})
export class RequestServiceComponent {
  private bookingsService = inject(BookingsService);
  private auth = inject(AuthService);
  private router = inject(Router);

  services = HOME_CARE_SERVICES;
  selectedServiceId: string = 'srv-hair-protein';

  requestedCity: string = 'التجمع الخامس والقاهرة الجديدة';
  detailedAddress: string = this.auth.profile()?.address_line || '';
  sessionDate: string = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]; // Default in 2 days
  sessionTime: string = '02:00 PM';
  customerName: string = this.auth.profile()?.full_name || '';
  customerPhone: string = this.auth.profile()?.phone || '';
  sessionNotes: string = '';
  isSubmitting: boolean = false;

  getSelectedService() {
    return this.services.find(s => s.id === this.selectedServiceId);
  }

  isFormValid(): boolean {
    return !!(
      this.selectedServiceId &&
      this.detailedAddress.trim() &&
      this.sessionDate &&
      this.customerName.trim() &&
      this.customerPhone.trim()
    );
  }

  async submitBookingRequest(): Promise<void> {
    if (!this.isFormValid()) return;

    this.isSubmitting = true;
    const selectedSrv = this.getSelectedService();

    const fullArea = `${this.requestedCity} — ${this.detailedAddress}`;
    const scheduledDateTime = `${this.sessionDate}T${this.sessionTime.includes('AM') ? '10:00:00' : '15:00:00'}Z`;

    const result = await this.bookingsService.createBookingRequest({
      serviceType: selectedSrv?.title || 'جلسة عناية منزلية',
      requestedArea: fullArea,
      scheduledAt: scheduledDateTime,
      customerName: this.customerName,
      customerPhone: this.customerPhone,
      notes: this.sessionNotes
    });

    this.isSubmitting = false;

    if (result.success) {
      this.router.navigate(['/booking/my-bookings']);
    }
  }
}
