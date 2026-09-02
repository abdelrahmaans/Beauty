import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page-wrapper">
      <div class="container-custom">
        <div class="auth-card beauty-card animate-fade-in">
          <!-- Header -->
          <div class="auth-header">
            <span class="badge-luxury">حساب عميلة جديد</span>
            <h1 class="auth-title">انضمي لعائلة بيوتي</h1>
            <p class="auth-subtitle">استمتعي بتجربة عناية استثنائية، عروض حصرية، ونقاط ولاء مع كل طلب وحجز</p>
          </div>

          <!-- Confirmation Notice if Email Confirmation is required -->
          <div class="confirmation-box animate-fade-in" *ngIf="showConfirmationNotice">
            <div class="conf-icon"><i class="fa-solid fa-envelope-circle-check"></i></div>
            <h3>تم إنشاء حسابكِ بنجاح!</h3>
            <p>
              إذا كانت خاصية تأكيد البريد (Confirm email) مفعّلة في مشروعكِ على Supabase، يرجى تفقّد بريدكِ لتأكيد الحساب.
            </p>
            <p class="conf-sub">
              (لتسجيل الدخول الفوري دون انتظار رسائل تأكيد، يمكنكِ إيقاف خيار Confirm Email من لوحة تحكم Supabase > Authentication > Providers > Email).
            </p>
            <a routerLink="/login" class="btn-primary btn-block mt-3">
              <i class="fa-solid fa-arrow-right-to-bracket"></i> الانتقال لصفحة تسجيل الدخول
            </a>
          </div>

          <!-- Error Alert -->
          <div class="error-alert" *ngIf="errorMessage">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Signup Form -->
          <form (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!showConfirmationNotice">
            <div class="form-group">
              <label>الاسم بالكامل <span class="req">*</span></label>
              <div class="input-with-icon">
                <i class="fa-solid fa-user icon"></i>
                <input
                  type="text"
                  [(ngModel)]="fullName"
                  name="fullName"
                  required
                  placeholder="مثال: ياسمين عبد العزيز"
                  class="input-custom"
                />
              </div>
            </div>

            <div class="form-group">
              <label>البريد الإلكتروني <span class="req">*</span></label>
              <div class="input-with-icon">
                <i class="fa-solid fa-envelope icon"></i>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  class="input-custom"
                  dir="ltr"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>رقم الموبايل <span class="req">*</span></label>
                <div class="input-with-icon">
                  <i class="fa-solid fa-phone icon"></i>
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

              <div class="form-group">
                <label>المحافظة <span class="req">*</span></label>
                <select [(ngModel)]="city" name="city" class="input-custom">
                  <option value="القاهرة">القاهرة</option>
                  <option value="الجيزة">الجيزة</option>
                  <option value="الإسكندرية">الإسكندرية</option>
                  <option value="بني سويف">بني سويف</option>
                  <option value="المنصورة">المنصورة</option>
                  <option value="طنطا">طنطا</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>كلمة المرور <span class="req">*</span></label>
              <div class="input-with-icon">
                <i class="fa-solid fa-lock icon"></i>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  minlength="6"
                  placeholder="6 أحرف أو أرقام على الأقل"
                  class="input-custom"
                  dir="ltr"
                />
                <button type="button" class="eye-toggle-btn" (click)="showPassword = !showPassword">
                  <i class="fa-solid" [ngClass]="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="loyalty-welcome-pill">
              <i class="fa-solid fa-gift"></i>
              <span>هدية تسجيل: <strong>50 نقطة ولاء مجانية</strong> تضاف لحسابكِ فوراً!</span>
            </div>

            <button type="submit" [disabled]="isLoading || !fullName || !email || !password || !phone" class="btn-primary btn-block">
              <span *ngIf="!isLoading">إنشاء الحساب وبدء التسوق</span>
              <span *ngIf="isLoading"><i class="fa-solid fa-spinner fa-spin"></i> جاري إنشاء الحساب...</span>
            </button>
          </form>

          <!-- Footer Links -->
          <div class="auth-footer">
            <p>لديكِ حساب بالفعل؟ <a routerLink="/login" class="highlight-link">تسجيل الدخول</a></p>
            
            <div class="partners-box">
              <span>هل ترغبين في الانضمام كشريك في المنصة؟</span>
              <div class="partner-chips">
                <a routerLink="/apply/provider" class="chip-link"><i class="fa-solid fa-wand-magic-sparkles"></i> انضمي كأخصائية فريلانسر</a>
                <a routerLink="/apply/center" class="chip-link"><i class="fa-solid fa-store"></i> سجلي كمركز شريك</a>
              </div>
            </div>
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
      max-width: 520px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 0 15px 35px rgba(45, 38, 34, 0.08);
      border: 1px solid var(--color-border-light);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 1.75rem;
    }
    .auth-title {
      font-size: 2rem;
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
      @media (max-width: 540px) {
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
    .input-with-icon {
      position: relative;
      display: flex;
      align-items: center;
      .icon {
        position: absolute;
        right: 1rem;
        color: #9CA3AF;
        font-size: 0.95rem;
        pointer-events: none;
      }
      input {
        width: 100%;
        padding-right: 2.75rem;
        padding-left: 2.75rem;
      }
      .eye-toggle-btn {
        position: absolute;
        left: 0.75rem;
        background: none;
        border: none;
        color: #9CA3AF;
        cursor: pointer;
        font-size: 1rem;
      }
    }
    .loyalty-welcome-pill {
      background: #FEF3C7;
      border: 1px solid #FDE68A;
      color: #92400E;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      i { font-size: 1.1rem; color: #D97706; }
    }
    .btn-block {
      width: 100%;
      padding: 0.9rem;
      font-size: 1rem;
      font-weight: 700;
      margin-top: 0.25rem;
    }
    .auth-footer {
      margin-top: 2rem;
      text-align: center;
      font-size: 0.88rem;
      color: var(--color-text-muted);
      border-top: 1px solid var(--color-border-light);
      padding-top: 1.5rem;
      p { margin-bottom: 1.25rem; }
    }
    .highlight-link {
      color: var(--color-primary);
      font-weight: 800;
      text-decoration: none;
      &:hover { text-decoration: underline; }
    }
    .partners-box {
      background: #FAF7F5;
      border: 1px solid var(--color-border-light);
      border-radius: 12px;
      padding: 1rem;
      span {
        font-size: 0.8rem;
        color: var(--color-text-subtle);
        display: block;
        margin-bottom: 0.6rem;
      }
    }
    .partner-chips {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }
    .chip-link {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--color-primary);
      background: #FFFFFF;
      border: 1px solid var(--color-primary-subtle);
      padding: 0.35rem 0.75rem;
      border-radius: 9999px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: var(--transition-smooth);
      &:hover {
        background: var(--color-primary);
        color: #FFFFFF;
      }
    }
    .confirmation-box {
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      border-radius: 18px;
      padding: 1.75rem;
      text-align: center;
      margin-bottom: 1.5rem;
      .conf-icon {
        font-size: 2.5rem;
        color: #10B981;
        margin-bottom: 0.75rem;
      }
      h3 { font-size: 1.35rem; font-weight: 800; color: #065F46; margin-bottom: 0.5rem; }
      p { font-size: 0.9rem; color: #047857; line-height: 1.6; margin: 0; }
      .conf-sub { font-size: 0.82rem; color: #059669; margin-top: 0.75rem; }
    }
  `]
})
export class SignupComponent {
  auth = inject(AuthService);
  router = inject(Router);

  fullName: string = '';
  email: string = '';
  phone: string = '';
  city: string = 'القاهرة';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  showConfirmationNotice: boolean = false;

  async onSubmit(): Promise<void> {
    if (!this.fullName || !this.email || !this.password || !this.phone) return;
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const res = await this.auth.signUpCustomer({
        email: this.email.trim(),
        password: this.password,
        fullName: this.fullName.trim(),
        phone: this.phone.trim(),
        city: this.city
      });

      if (!res.success) {
        this.errorMessage = res.error || 'فشل في إنشاء الحساب، يرجى المحاولة مرة أخرى.';
        return;
      }

      if (res.requiresEmailConfirmation) {
        this.showConfirmationNotice = true;
        return;
      }

      // Direct customer routing
      this.router.navigate(['/account']);
    } catch (err: any) {
      console.error('Signup submit error:', err);
      this.errorMessage = err.message || 'حدث خطأ غير متوقع أثناء إنشاء الحساب';
    } finally {
      this.isLoading = false;
    }
  }
}
