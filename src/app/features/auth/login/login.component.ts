import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page-wrapper">
      <div class="container-custom">
        <div class="auth-card beauty-card animate-fade-in">
          <!-- Header -->
          <div class="auth-header">
            <span class="badge-luxury">بوابة الدخول الموحدة</span>
            <h1 class="auth-title">تسجيل الدخول</h1>
            <p class="auth-subtitle">أهلاً بكِ مجدداً في منصة العناية بالشعر والبشرة</p>
          </div>

          <!-- Return URL Notice -->
          <div class="return-url-notice" *ngIf="returnUrl">
            <i class="fa-solid fa-lock text-primary"></i>
            <span>يرجى تسجيل الدخول أولاً لتتمكني من متابعة طلب الخدمة.</span>
          </div>

          <!-- Error Alert -->
          <div class="error-alert" *ngIf="errorMessage()">
            <i class="fa-solid fa-circle-exclamation"></i>
            <div>
              <strong>{{ errorMessage() }}</strong>
              <div *ngIf="errorMessage().includes('تأكيده')" class="mt-2 text-xs" style="line-height: 1.5; opacity: 0.95;">
                💡 <strong>حل سريع لتخطي هذه الخطوة:</strong> ادخلي على Supabase Dashboard ➔ Authentication ➔ Providers ➔ Email وقومي بتعطيل (Confirm email) لحفظ الدخول المباشر فوراً، أو من قائمة Users اضغطي على (...) بجانب إيميلك واختاري Auto Confirm User.
              </div>
            </div>
          </div>

          <!-- Login Form -->
          <form (ngSubmit)="onSubmit()" class="auth-form">
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

            <div class="form-group">
              <div class="label-row">
                <label>كلمة المرور <span class="req">*</span></label>
                <a routerLink="/forgot-password" class="forgot-link">نسيت كلمة المرور؟</a>
              </div>
              <div class="input-with-icon">
                <i class="fa-solid fa-lock icon"></i>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  class="input-custom"
                  dir="ltr"
                />
                <button type="button" class="eye-toggle-btn" (click)="showPassword.set(!showPassword())">
                  <i class="fa-solid" [ngClass]="showPassword() ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
            </div>

            <button type="submit" [disabled]="isLoading() || !email || !password" class="btn-primary btn-block">
              <span *ngIf="!isLoading()">دخول إلى الحساب</span>
              <span *ngIf="isLoading()"><i class="fa-solid fa-spinner fa-spin"></i> جاري التحقق...</span>
            </button>
          </form>

          <!-- Footer Links -->
          <div class="auth-footer">
            <p>ليس لديكِ حساب بعد؟ <a routerLink="/signup" class="highlight-link">إنشاء حساب عميلة جديد</a></p>
            <div class="partners-onboarding-links">
              <span>هل أنتِ متخصصة أو تديرين صالوناً؟</span>
              <div class="partner-chips">
                <a routerLink="/apply/provider" class="chip-link"><i class="fa-solid fa-user-tie"></i> انضمي كأخصائية فريلانسر</a>
                <a routerLink="/apply/center" class="chip-link"><i class="fa-solid fa-spa"></i> سجلي كمركز شريك</a>
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
      max-width: 480px;
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
      font-size: 2rem;
      font-weight: 800;
      color: var(--color-text-main);
      margin: 0.75rem 0 0.4rem;
    }
    .auth-subtitle {
      font-size: 0.92rem;
      color: var(--color-text-muted);
      margin: 0;
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
      gap: 1.25rem;
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
    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .forgot-link {
      font-size: 0.8rem;
      color: var(--color-primary);
      text-decoration: none;
      font-weight: 700;
      &:hover { text-decoration: underline; }
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
    .btn-block {
      width: 100%;
      padding: 0.9rem;
      font-size: 1rem;
      font-weight: 700;
      margin-top: 0.5rem;
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
    .partners-onboarding-links {
      background: #FFFBF9;
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
  `]
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  email: string = '';
  password: string = '';
  showPassword = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  errorMessage = signal<string>('');
  returnUrl: string | null = this.route.snapshot.queryParams['returnUrl'] || null;

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) return;
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.cdr.markForCheck();

    try {
      const res = await this.auth.signInWithEmail(this.email.trim(), this.password);

      if (!res.success) {
        this.errorMessage.set(res.error || 'فشل في تسجيل الدخول');
        this.cdr.markForCheck();
        return;
      }

      // If returnUrl was specified (e.g. from service booking request), navigate back to it
      if (this.returnUrl) {
        this.router.navigateByUrl(this.returnUrl);
        return;
      }

      const ctx = res.context;
      if (!ctx) {
        this.router.navigate(['/account']);
        return;
      }

      // Role & status based routing
      if (ctx.status === 'pending') {
        this.router.navigate(['/pending-review']);
        return;
      }

      switch (ctx.view) {
        case 'admin':
          this.router.navigate(['/admin']);
          break;
        case 'provider':
          this.router.navigate(['/provider']);
          break;
        case 'center':
          this.router.navigate(['/center']);
          break;
        default:
          this.router.navigate(['/account']);
          break;
      }
    } catch (err: any) {
      console.error('Login submit error:', err);
      this.errorMessage.set(err.message || 'حدث خطأ غير متوقع أثناء تسجيل الدخول');
    } finally {
      this.isLoading.set(false);
      this.cdr.markForCheck();
    }
  }
}
