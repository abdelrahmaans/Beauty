import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-apply-center',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page-wrapper">
      <div class="container-custom">
        <div class="auth-card beauty-card animate-fade-in">
          <!-- Header -->
          <div class="auth-header">
            <span class="badge-luxury">بوابة انضمام المراكز الشريكة</span>
            <h1 class="auth-title">سجلي صالونكِ / المركز الشريك</h1>
            <p class="auth-subtitle">انضمي لدليل المراكز المعتمدة واستقبلي مئات العميلات شهرياً عبر نظام أكواد الخصم والإحالة الحصري.</p>
          </div>

          <!-- Error Alert -->
          <div class="error-alert" *ngIf="errorMessage">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-row">
              <div class="form-group">
                <label>اسم المركز / الصالون التجاري <span class="req">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="centerName"
                  name="centerName"
                  required
                  placeholder="مثال: L'Étoile Beauty Lounge"
                  class="input-custom"
                />
              </div>

              <div class="form-group">
                <label>رقم هاتف المركز / الإدارة <span class="req">*</span></label>
                <input
                  type="tel"
                  [(ngModel)]="phone"
                  name="phone"
                  required
                  placeholder="01xxxxxxxxx"
                  class="input-custom"
                  dir="ltr"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>البريد الإلكتروني للإدارة <span class="req">*</span></label>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="center@example.com"
                  class="input-custom"
                  dir="ltr"
                />
              </div>

              <div class="form-group">
                <label>كلمة المرور <span class="req">*</span></label>
                <input
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  minlength="6"
                  placeholder="••••••••"
                  class="input-custom"
                  dir="ltr"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>المدينة / المنطقة <span class="req">*</span></label>
                <select [(ngModel)]="city" name="city" class="input-custom">
                  <option value="التجمع الخامس، القاهرة الجديدة">التجمع الخامس، القاهرة الجديدة</option>
                  <option value="الشيخ زايد، الجيزة">الشيخ زايد، الجيزة</option>
                  <option value="المعادي، القاهرة">المعادي، القاهرة</option>
                  <option value="مصر الجديدة، القاهرة">مصر الجديدة، القاهرة</option>
                  <option value="سموحة، الإسكندرية">سموحة، الإسكندرية</option>
                  <option value="بني سويف">بني سويف</option>
                </select>
              </div>

              <div class="form-group">
                <label>نسبة الخصم المقترحة للعميلات (%) <span class="req">*</span></label>
                <input
                  type="number"
                  [(ngModel)]="proposedDiscount"
                  name="proposedDiscount"
                  min="5"
                  max="50"
                  class="input-custom"
                  placeholder="مثال: 15"
                />
              </div>
            </div>

            <div class="form-group">
              <label>العنوان التفصيلي <span class="req">*</span></label>
              <input
                type="text"
                [(ngModel)]="addressLine"
                name="addressLine"
                required
                placeholder="الشارع، رقم المبنى، أقرب علامة مميزة..."
                class="input-custom"
              />
            </div>

            <div class="form-group">
              <label>الخدمات والمميزات المتوفرة في المركز <span class="req">*</span></label>
              <div class="specialties-picker">
                <label *ngFor="let s of availableSpecialties" class="checkbox-chip" [class.selected]="selectedSpecialties.includes(s)">
                  <input
                    type="checkbox"
                    [checked]="selectedSpecialties.includes(s)"
                    (change)="toggleSpecialty(s)"
                  />
                  <span>{{ s }}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>مواعيد وساعات العمل الرسمية</label>
              <input
                type="text"
                [(ngModel)]="openingHours"
                name="openingHours"
                placeholder="مثال: يومياً من 10:00 صباحاً حتى 10:00 مساءً"
                class="input-custom"
              />
            </div>

            <div class="form-group">
              <label>نبذة عن المركز وتجهيزاته</label>
              <textarea
                [(ngModel)]="bio"
                name="bio"
                rows="2"
                placeholder="أقسام المركز، الأجهزة المستخدمة، الطاقم الطبي أو الفني..."
                class="input-custom"
              ></textarea>
            </div>

            <div class="terms-notice">
              <i class="fa-solid fa-store"></i>
              <span>عند تقديم الطلب، سيقوم فريق الشراكات بالتحقق من بيانات المركز وإصدار كود الإحالة الحصري للمركز وتفعيل البوابة خلال 24 ساعة.</span>
            </div>

            <button type="submit" [disabled]="isLoading || !centerName || !email || !password || !phone || !addressLine" class="btn-primary btn-block">
              <span *ngIf="!isLoading">إرسال طلب تسجيل المركز</span>
              <span *ngIf="isLoading"><i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...</span>
            </button>
          </form>

          <div class="auth-footer">
            <p>لديكِ حساب بالفعل؟ <a routerLink="/login" class="highlight-link">تسجيل الدخول</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page-wrapper {
      padding: 4rem 1rem 6rem;
      background: linear-gradient(135deg, #FAF7F5 0%, #F5EFEB 100%);
      min-height: 85vh;
      display: flex;
      align-items: center;
    }
    .auth-card {
      max-width: 650px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 0 15px 35px rgba(45, 38, 34, 0.08);
      border: 1px solid var(--color-border-light);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .auth-title {
      font-size: 1.95rem;
      font-weight: 800;
      color: var(--color-text-main);
      margin: 0.75rem 0 0.4rem;
    }
    .auth-subtitle {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin: 0;
      line-height: 1.5;
    }
    .error-alert {
      background: #FEF2F2;
      border: 1px solid #FECACA;
      color: #DC2626;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      font-size: 0.88rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 1.5rem;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      @media (max-width: 580px) {
        grid-template-columns: 1fr;
      }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      label {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--color-text-main);
      }
      .req { color: #EF4444; }
    }
    .specialties-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .checkbox-chip {
      background: #FAF7F5;
      border: 1px solid var(--color-border);
      padding: 0.4rem 0.8rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--color-text-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      transition: var(--transition-smooth);
      input { display: none; }
      &.selected {
        background: var(--color-primary-subtle);
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
    }
    .terms-notice {
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      color: #065F46;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      font-size: 0.82rem;
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      line-height: 1.5;
      i { font-size: 1.1rem; color: #10B981; margin-top: 0.15rem; }
    }
    .btn-block {
      width: 100%;
      padding: 0.95rem;
      font-size: 1rem;
      font-weight: 700;
    }
    .auth-footer {
      margin-top: 1.75rem;
      text-align: center;
      font-size: 0.88rem;
      color: var(--color-text-muted);
      border-top: 1px solid var(--color-border-light);
      padding-top: 1.25rem;
    }
    .highlight-link {
      color: var(--color-primary);
      font-weight: 800;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
  `]
})
export class ApplyCenterComponent {
  auth = inject(AuthService);
  router = inject(Router);

  centerName: string = '';
  phone: string = '';
  email: string = '';
  password: string = '';
  city: string = 'التجمع الخامس، القاهرة الجديدة';
  addressLine: string = '';
  proposedDiscount: number = 15;
  openingHours: string = 'يومياً من 10:00 ص حتى 10:00 م';
  bio: string = '';
  selectedSpecialties: string[] = ['علاجات الشعر والبروتين', 'حمام مغربي وسبا'];
  isLoading: boolean = false;
  errorMessage: string = '';

  availableSpecialties: string[] = [
    'علاجات الشعر والبروتين',
    'جلسات تنظيف وبشرة زجاجية',
    'حمام مغربي وسبا',
    'ميك أب وتسريحات عرايس',
    'ميزوثيرابي وفيلر وبوتوكس'
  ];

  toggleSpecialty(spec: string): void {
    if (this.selectedSpecialties.includes(spec)) {
      this.selectedSpecialties = this.selectedSpecialties.filter(s => s !== spec);
    } else {
      this.selectedSpecialties.push(spec);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.centerName || !this.email || !this.password || !this.phone || !this.addressLine) return;
    this.isLoading = true;
    this.errorMessage = '';

    const res = await this.auth.applyAsCenter({
      email: this.email.trim(),
      password: this.password,
      centerName: this.centerName.trim(),
      phone: this.phone.trim(),
      city: this.city,
      addressLine: this.addressLine.trim(),
      specialties: this.selectedSpecialties,
      bio: this.bio.trim(),
      openingHours: this.openingHours,
      proposedDiscount: this.proposedDiscount
    });

    this.isLoading = false;

    if (!res.success) {
      this.errorMessage = res.error || 'حدث خطأ أثناء تقديم الطلب';
      return;
    }

    this.router.navigate(['/pending-review']);
  }
}
