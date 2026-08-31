import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-pending-review',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="pending-page-wrapper">
      <div class="container-custom">
        <div class="pending-card beauty-card animate-fade-in">
          <!-- Icon animation -->
          <div class="clock-icon-bubble">
            <i class="fa-solid fa-hourglass-half fa-spin-pulse"></i>
          </div>

          <span class="badge-gold">طلب الشراكة قيد التدقيق والمراجعة</span>

          <h1 class="pending-title">حسابكِ قيد المراجعة والتوثيق</h1>

          <p class="pending-desc">
            أهلاً بكِ في منصة بيوتي! لقد تم استلام طلبكِ بنجاح وفريق العمل يراجع بياناتكِ وسابقة الأعمال والمستندات بدقة لضمان أعلى معايير الجودة للعميلات.
          </p>

          <div class="steps-box">
            <div class="step-item active">
              <div class="step-num"><i class="fa-solid fa-check"></i></div>
              <div class="step-text">
                <strong>تقديم الطلب بنجاح</strong>
                <small>تم حفظ بياناتكِ وملفكِ التعريفي في النظام</small>
              </div>
            </div>

            <div class="step-item current">
              <div class="step-num">2</div>
              <div class="step-text">
                <strong>التدقيق المهني والتوثيق (جاري الآن)</strong>
                <small>مراجعة التخصصات وسابقة الأعمال ونطاق التغطية</small>
              </div>
            </div>

            <div class="step-item">
              <div class="step-num">3</div>
              <div class="step-text">
                <strong>تفعيل البوابة واستقبال العميلات</strong>
                <small>ستتلقين إشعاراً فورياً ورسالة واتساب عند الاعتماد</small>
              </div>
            </div>
          </div>

          <div class="estimated-time-box">
            <i class="fa-solid fa-bolt"></i>
            <span>الوقت المقدر للمراجعة: <strong>خلال 24 ساعة كحد أقصى</strong></span>
          </div>

          <div class="action-buttons">
            <a href="https://wa.me/201123456789" target="_blank" class="btn-whatsapp">
              <i class="fa-brands fa-whatsapp"></i> التواصل المباشر مع إدارة التوثيق
            </a>
            <button (click)="auth.signOut()" class="btn-outline">
              <i class="fa-solid fa-arrow-right-from-bracket"></i> تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pending-page-wrapper {
      padding: 5rem 1rem 7rem;
      background: linear-gradient(135deg, #FAF7F5 0%, #F5EFEB 100%);
      min-height: 85vh;
      display: flex;
      align-items: center;
    }
    .pending-card {
      max-width: 600px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 28px;
      padding: 3rem 2.5rem;
      box-shadow: 0 15px 35px rgba(45, 38, 34, 0.08);
      border: 1px solid var(--color-border-light);
      text-align: center;
    }
    .clock-icon-bubble {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: #FEF3C7;
      color: #D97706;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin-bottom: 1.25rem;
      box-shadow: 0 4px 15px rgba(217, 119, 6, 0.2);
    }
    .badge-gold {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      color: #92400E;
      font-size: 0.82rem;
      font-weight: 700;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      display: inline-block;
      margin-bottom: 1rem;
    }
    .pending-title {
      font-size: 2.1rem;
      font-weight: 800;
      color: var(--color-text-main);
      margin: 0 0 0.75rem;
    }
    .pending-desc {
      font-size: 0.95rem;
      color: var(--color-text-muted);
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .steps-box {
      text-align: right;
      background: #FAF7F5;
      border-radius: 18px;
      padding: 1.5rem;
      margin-bottom: 1.75rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      opacity: 0.55;
      &.active, &.current { opacity: 1; }
      .step-num {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #E5E7EB;
        color: #4B5563;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.85rem;
        flex-shrink: 0;
      }
      &.active .step-num {
        background: #10B981;
        color: #FFFFFF;
      }
      &.current .step-num {
        background: #F59E0B;
        color: #FFFFFF;
      }
      .step-text {
        strong {
          display: block;
          font-size: 0.9rem;
          color: var(--color-text-main);
        }
        small {
          font-size: 0.78rem;
          color: var(--color-text-muted);
        }
      }
    }
    .estimated-time-box {
      background: #EFF6FF;
      border: 1px solid #BFDBFE;
      color: #1E40AF;
      padding: 0.85rem 1.25rem;
      border-radius: 12px;
      font-size: 0.88rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      margin-bottom: 2rem;
      i { color: #3B82F6; }
    }
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .btn-whatsapp {
      background: #25D366;
      color: #FFFFFF;
      padding: 0.85rem;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      box-shadow: 0 4px 12px rgba(37, 211, 102, 0.25);
      transition: var(--transition-smooth);
      &:hover {
        background: #1EBE5D;
        transform: translateY(-2px);
      }
    }
  `]
})
export class PendingReviewComponent {
  auth = inject(AuthService);
}
