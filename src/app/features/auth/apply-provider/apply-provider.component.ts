import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-apply-provider',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page-wrapper">
      <div class="container-custom">
        <div class="auth-card beauty-card animate-fade-in">
          <!-- Header -->
          <div class="auth-header">
            <span class="badge-luxury">بوابة انضمام الشركاء المستقلين</span>
            <h1 class="auth-title">انضمي كنخبة أخصائيات العناية</h1>
            <p class="auth-subtitle">استقبلي طلبات الجلسات المنزلية الفاخرة وحققي دخلاً مميزاً مع تغطية تسويقية وضمان كامل لأتعابكِ.</p>
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
                <label>الاسم المهني / الثلاثي <span class="req">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="fullName"
                  name="fullName"
                  required
                  placeholder="أخصائية: أمنية خليل"
                  class="input-custom"
                />
              </div>

              <div class="form-group">
                <label>رقم الموبايل / واتساب <span class="req">*</span></label>
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
                <label>البريد الإلكتروني <span class="req">*</span></label>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="provider@example.com"
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

            <div class="form-group">
              <label>المحافظة ونطاق العمل الأساسي <span class="req">*</span></label>
              <select [(ngModel)]="city" name="city" class="input-custom">
                <option value="القاهرة (التجمع والمعادي ومدينة نصر)">القاهرة (التجمع والمعادي ومدينة نصر)</option>
                <option value="الجيزة (الشيخ زايد وأكتوبر والدقي)">الجيزة (الشيخ زايد وأكتوبر والدقي)</option>
                <option value="الإسكندرية (سموحة ولوران ومحرم بك)">الإسكندرية (سموحة ولوران ومحرم بك)</option>
                <option value="بني سويف (المدينة والزهراء)">بني سويف (المدينة والزهراء)</option>
              </select>
            </div>

            <div class="form-group">
              <label>التخصصات والخدمات المتقنة <span class="req">*</span></label>
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
              <label>نبذة عن خبرتكِ وسابقة أعمالكِ <span class="req">*</span></label>
              <textarea
                [(ngModel)]="bio"
                name="bio"
                required
                rows="3"
                placeholder="سنوات الخبرة، الشهادات، ومجالات الإتقان..."
                class="input-custom"
              ></textarea>
            </div>

            <div class="terms-notice">
              <i class="fa-solid fa-shield-halved"></i>
              <span>بتقديمكِ للطلب، سيتم مراجعة بياناتكِ وتوثيق مستنداتكِ من فريق العمل في غضون 24 ساعة، وستتلقين إشعاراً فور التفعيل.</span>
            </div>

            <button type="submit" [disabled]="isLoading || !fullName || !email || !password || !phone || selectedSpecialties.length === 0" class="btn-primary btn-block">
              <span *ngIf="!isLoading">إرسال طلب الانضمام كأخصائية</span>
              <span *ngIf="isLoading"><i class="fa-solid fa-spinner fa-spin"></i> جاري تسجيل الطلب...</span>
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
      max-width: 620px;
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
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      color: #1E40AF;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      font-size: 0.82rem;
      display: flex;
      align-items: flex-start;
      gap: 0.6rem;
      line-height: 1.5;
      i { font-size: 1.1rem; color: #3B82F6; margin-top: 0.15rem; }
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
export class ApplyProviderComponent {
  auth = inject(AuthService);
  router = inject(Router);

  fullName: string = '';
  phone: string = '';
  email: string = '';
  password: string = '';
  city: string = 'القاهرة (التجمع والمعادي ومدينة نصر)';
  bio: string = '';
  selectedSpecialties: string[] = ['فرد وترميم بروتين'];
  isLoading: boolean = false;
  errorMessage: string = '';

  availableSpecialties: string[] = [
    'فرد وترميم بروتين',
    'جلسات هيدرافيشال وبشرة زجاجية',
    'ميزوثيرابي وبلازما شعر',
    'بكجات عرايس ومناسبات',
    'تنظيف عميق وحمام مغربي'
  ];

  toggleSpecialty(spec: string): void {
    if (this.selectedSpecialties.includes(spec)) {
      this.selectedSpecialties = this.selectedSpecialties.filter(s => s !== spec);
    } else {
      this.selectedSpecialties.push(spec);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.fullName || !this.email || !this.password || !this.phone || this.selectedSpecialties.length === 0) return;
    this.isLoading = true;
    this.errorMessage = '';

    const res = await this.auth.applyAsProvider({
      email: this.email.trim(),
      password: this.password,
      fullName: this.fullName.trim(),
      phone: this.phone.trim(),
      city: this.city,
      specialties: this.selectedSpecialties,
      bio: this.bio.trim()
    });

    this.isLoading = false;

    if (!res.success) {
      this.errorMessage = res.error || 'حدث خطأ أثناء تقديم الطلب';
      return;
    }

    // Always route new applicant to pending review
    this.router.navigate(['/pending-review']);
  }
}
