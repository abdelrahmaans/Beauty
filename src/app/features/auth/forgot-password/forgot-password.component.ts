import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="auth-page-wrapper">
      <div class="container-custom">
        <div class="auth-card beauty-card animate-fade-in">
          <!-- Header -->
          <div class="auth-header">
            <div class="auth-icon-circle">
              <i class="fa-solid fa-key"></i>
            </div>
            <h1 class="auth-title">استعادة كلمة المرور</h1>
            <p class="auth-subtitle">أدخلي بريدكِ الإلكتروني المسجل وسنرسل لكِ رابطاً آمناً لإعادة تعيين كلمة المرور فوراً.</p>
          </div>

          <!-- Success Alert -->
          <div class="success-alert" *ngIf="isSuccess">
            <i class="fa-solid fa-circle-check"></i>
            <div>
              <strong>تم إرسال رابط الاستعادة بنجاح!</strong>
              <p>يرجى تفقد بريدكِ الإلكتروني ({{ email }}) واتباع التعليمات لتعيين كلمة مرور جديدة.</p>
            </div>
          </div>

          <!-- Error Alert -->
          <div class="error-alert" *ngIf="errorMessage">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{{ errorMessage }}</span>
          </div>

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="auth-form" *ngIf="!isSuccess">
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

            <button type="submit" [disabled]="isLoading || !email" class="btn-primary btn-block">
              <span *ngIf="!isLoading">إرسال رابط الاستعادة</span>
              <span *ngIf="isLoading"><i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...</span>
            </button>
          </form>

          <!-- Back to login -->
          <div class="auth-footer">
            <a routerLink="/login" class="back-link">
              <i class="fa-solid fa-arrow-right"></i> العودة لصفحة تسجيل الدخول
            </a>
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
      max-width: 460px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 24px;
      padding: 2.5rem;
      box-shadow: 0 15px 35px rgba(45, 38, 34, 0.08);
      border: 1px solid var(--color-border-light);
      text-align: center;
    }
    .auth-icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: var(--color-primary-subtle);
      color: var(--color-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    .auth-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--color-text-main);
      margin: 0 0 0.5rem;
    }
    .auth-subtitle {
      font-size: 0.9rem;
      color: var(--color-text-muted);
      margin: 0;
      line-height: 1.5;
    }
    .success-alert {
      background: #ECFDF5;
      border: 1px solid #A7F3D0;
      color: #065F46;
      padding: 1.15rem;
      border-radius: 14px;
      font-size: 0.88rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      text-align: right;
      margin: 1.5rem 0;
      i { font-size: 1.25rem; color: #10B981; margin-top: 0.15rem; }
      strong { display: block; margin-bottom: 0.25rem; font-size: 0.95rem; }
      p { margin: 0; font-size: 0.85rem; color: #047857; }
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
      margin: 1.5rem 0;
      text-align: right;
    }
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      text-align: right;
      margin-top: 1.5rem;
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
      }
    }
    .btn-block {
      width: 100%;
      padding: 0.9rem;
      font-size: 1rem;
      font-weight: 700;
    }
    .auth-footer {
      margin-top: 2rem;
      border-top: 1px solid var(--color-border-light);
      padding-top: 1.25rem;
    }
    .back-link {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--color-text-muted);
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: var(--transition-smooth);
      &:hover { color: var(--color-primary); }
    }
  `]
})
export class ForgotPasswordComponent {
  auth = inject(AuthService);

  email: string = '';
  isLoading: boolean = false;
  isSuccess: boolean = false;
  errorMessage: string = '';

  async onSubmit(): Promise<void> {
    if (!this.email) return;
    this.isLoading = true;
    this.errorMessage = '';

    const res = await this.auth.resetPassword(this.email.trim());
    this.isLoading = false;

    if (!res.success) {
      this.errorMessage = res.error || 'حدث خطأ أثناء إرسال الرابط';
      return;
    }

    this.isSuccess = true;
  }
}
