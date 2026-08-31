import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentProofsService } from '../../../core/services/payment-proofs.service';
import { PaymentReferenceType, PaymentChannel, PaymentProof } from '../../../core/models';
import { OFFICIAL_PAYMENT_CHANNELS } from '../../../core/mock/mock-data';

@Component({
  selector: 'app-upload-payment-proof',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payment-proof-card beauty-card animate-fade-in">
      <!-- Header / Instruction -->
      <div class="proof-header">
        <div class="header-icon">
          <i class="fa-solid fa-receipt"></i>
        </div>
        <div>
          <h3 class="proof-title">إتمام الدفع بالتحويل المباشر (مجاناً)</h3>
          <p class="proof-subtitle">
            يرجى تحويل المبلغ المطلوب عبر إحدى القنوات المعتمدة أدناه ثم إرفاق صورة الإيصال أو السكرين شوت لتأكيد العملية.
          </p>
        </div>
      </div>

      <!-- Amount Highlight -->
      <div class="amount-highlight-box">
        <span class="amount-label">المبلغ المطلوب تحويله بالظبط:</span>
        <strong class="amount-val">{{ requiredAmount }} <small>ج.م</small></strong>
      </div>

      <!-- Payment Channels Selector / Display -->
      <div class="channels-section">
        <label class="section-label"><i class="fa-solid fa-building-columns"></i> بيانات قنوات التحويل المعتمدة:</label>
        
        <div class="channel-cards-list">
          <div
            class="channel-item"
            *ngFor="let ch of channels"
            [class.selected]="selectedChannel === ch.type"
            (click)="selectedChannel = ch.type"
          >
            <div class="ch-left">
              <div class="ch-icon" [style.background]="ch.accentColor + '20'" [style.color]="ch.accentColor">
                <i class="fa-solid" [ngClass]="ch.icon"></i>
              </div>
              <div class="ch-info">
                <strong class="ch-title">{{ ch.title }}</strong>
                <div class="ch-data">
                  <span *ngIf="ch.accountHandle">عنوان الدفع: <code>{{ ch.accountHandle }}</code></span>
                  <span *ngIf="ch.accountNumber">الرقم: <code>{{ ch.accountNumber }}</code></span>
                  <small class="d-block text-muted">{{ ch.holderName }}</small>
                </div>
              </div>
            </div>

            <button
              (click)="copyToClipboard(ch.accountHandle || ch.accountNumber, $event)"
              class="copy-btn"
              title="نسخ الرقم"
            >
              <i class="fa-regular fa-copy"></i>
              <span>{{ copiedValue === (ch.accountHandle || ch.accountNumber) ? 'تم النسخ!' : 'نسخ' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Receipt Upload Form -->
      <div class="form-container">
        <label class="section-label"><i class="fa-solid fa-cloud-arrow-up"></i> بيانات وإثبات التحويل:</label>

        <div class="form-grid">
          <div class="form-group">
            <label>طريقة التحويل المستخدمة <span class="req">*</span></label>
            <select [(ngModel)]="selectedChannel" class="input-custom">
              <option value="instapay">انستاباي (InstaPay)</option>
              <option value="vodafone_cash">محفظة فودافون كاش</option>
              <option value="bank_transfer">تحويل بنكي (CIB)</option>
              <option value="other">طريقة أخرى</option>
            </select>
          </div>

          <div class="form-group">
            <label>اسم صاحب الحساب المُحَوِّل <span class="req">*</span></label>
            <input
              type="text"
              [(ngModel)]="senderName"
              placeholder="اكتبي الاسم الثلاثي للمحوّل للتطابق"
              class="input-custom"
            />
          </div>

          <div class="form-group">
            <label>المبلغ المحوّل (ج.م) <span class="req">*</span></label>
            <input
              type="number"
              [(ngModel)]="amountClaimed"
              class="input-custom"
            />
          </div>

          <div class="form-group">
            <label>صورة إيصال التحويل (Receipt URL أو اختيار تجريبي) <span class="req">*</span></label>
            <input
              type="text"
              [(ngModel)]="receiptUrl"
              placeholder="https://... أو سكرين شوت"
              class="input-custom"
              dir="ltr"
            />
          </div>
        </div>

        <!-- Quick Demo Receipt Image Buttons -->
        <div class="demo-receipts-row">
          <span class="demo-lbl">إيصال تجريبي سريع للمعاينة:</span>
          <button
            type="button"
            (click)="setDemoReceipt('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80')"
            class="receipt-sample-btn"
          >
            <i class="fa-solid fa-image"></i> سكرين شوت إنستاباي
          </button>
          <button
            type="button"
            (click)="setDemoReceipt('https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=800&q=80')"
            class="receipt-sample-btn"
          >
            <i class="fa-solid fa-receipt"></i> إشعار فودافون كاش
          </button>
        </div>

        <!-- Live Receipt Preview -->
        <div class="receipt-preview-box" *ngIf="receiptUrl">
          <span class="preview-tag"><i class="fa-solid fa-eye"></i> معاينة إيصال التحويل:</span>
          <img [src]="receiptUrl" alt="معاينة إيصال الدفع" class="receipt-preview-img" />
        </div>

        <!-- Reassurance Note -->
        <div class="reassurance-note">
          <i class="fa-solid fa-shield-check"></i>
          <div>
            <strong>تأكيد آمن وسريع:</strong>
            <p>يقوم فريق العمل بمراجعة إيصالات التحويل واعتماد الطلب رسميًا خلال 15 - 45 دقيقة فور استلام الإشعار.</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <button (click)="cancel()" class="btn-outline" *ngIf="showCancel">
            إلغاء
          </button>
          <button
            (click)="submitProof()"
            [disabled]="isSubmitting || !receiptUrl || !senderName || amountClaimed <= 0"
            class="btn-primary submit-btn"
          >
            <i class="fa-solid" [ngClass]="isSubmitting ? 'fa-spinner fa-spin' : 'fa-check'"></i>
            <span>{{ isSubmitting ? 'جاري إرسال الإثبات...' : 'إرسال إثبات التحويل للتأكيد' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-proof-card {
      padding: 2rem;
      border-radius: 20px;
      background: #FFFFFF;
      box-shadow: 0 8px 30px rgba(30, 27, 24, 0.08);
      max-width: 720px;
      margin: 0 auto;
    }
    .proof-header {
      display: flex;
      gap: 1.25rem;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .header-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: var(--color-primary-subtle);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .proof-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--color-text-main);
      margin-bottom: 0.35rem;
    }
    .proof-subtitle {
      font-size: 0.88rem;
      color: var(--color-text-muted);
      line-height: 1.6;
      margin: 0;
    }

    .amount-highlight-box {
      background: linear-gradient(135deg, #FAF7F5 0%, #F4EBE4 100%);
      border: 1.5px dashed var(--color-primary);
      border-radius: 16px;
      padding: 1.25rem 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .amount-label { font-size: 0.95rem; font-weight: 700; color: var(--color-text-main); }
    .amount-val {
      font-size: 1.75rem;
      font-weight: 900;
      color: var(--color-primary);
      small { font-size: 1rem; }
    }

    .section-label {
      font-size: 0.92rem;
      font-weight: 800;
      color: var(--color-text-main);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .channel-cards-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .channel-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border: 1.5px solid var(--color-border);
      border-radius: 14px;
      cursor: pointer;
      transition: var(--transition-smooth);
      background: #FAF7F5;

      &:hover { border-color: var(--color-primary); background: #FFFFFF; }
      &.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-subtle);
        box-shadow: 0 4px 14px rgba(196, 109, 91, 0.12);
      }
    }
    .ch-left { display: flex; gap: 1rem; align-items: center; }
    .ch-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .ch-title { font-size: 0.95rem; color: var(--color-text-main); display: block; margin-bottom: 0.2rem; }
    .ch-data {
      font-size: 0.82rem;
      color: var(--color-text-muted);
      code {
        background: #FFFFFF;
        padding: 0.15rem 0.45rem;
        border-radius: 6px;
        border: 1px solid var(--color-border);
        font-weight: 700;
        color: var(--color-primary);
        letter-spacing: 0.5px;
      }
    }
    .copy-btn {
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 0.4rem 0.8rem;
      font-family: inherit;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: var(--transition-smooth);

      &:hover { border-color: var(--color-primary); color: var(--color-primary); }
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 1.25rem;

      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      label { font-size: 0.85rem; font-weight: 700; color: var(--color-text-main); }
      .req { color: #EF4444; }
    }

    .demo-receipts-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .demo-lbl { font-size: 0.78rem; color: var(--color-text-subtle); }
    .receipt-sample-btn {
      background: #FAF7F5;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      padding: 0.3rem 0.75rem;
      font-family: inherit;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--color-text-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: var(--transition-smooth);

      &:hover { border-color: var(--color-primary); color: var(--color-primary); }
    }

    .receipt-preview-box {
      border: 1px solid var(--color-border);
      border-radius: 14px;
      padding: 1rem;
      background: #FAF7F5;
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .preview-tag {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--color-text-muted);
      display: block;
      margin-bottom: 0.75rem;
    }
    .receipt-preview-img {
      max-height: 260px;
      max-width: 100%;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      object-fit: contain;
    }

    .reassurance-note {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex;
      gap: 0.85rem;
      align-items: center;
      color: #166534;
      margin-bottom: 2rem;

      i { font-size: 1.4rem; color: #16A34A; }
      strong { font-size: 0.88rem; display: block; margin-bottom: 0.15rem; }
      p { font-size: 0.8rem; margin: 0; }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    .submit-btn {
      padding: 0.85rem 2rem;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
    }
  `]
})
export class UploadPaymentProofComponent implements OnInit {
  @Input() referenceType: PaymentReferenceType = 'order';
  @Input() referenceId: string = '';
  @Input() requiredAmount: number = 0;
  @Input() showCancel: boolean = false;

  @Output() proofSubmitted = new EventEmitter<PaymentProof>();
  @Output() cancelled = new EventEmitter<void>();

  private paymentProofsService = inject(PaymentProofsService);

  channels = OFFICIAL_PAYMENT_CHANNELS;
  selectedChannel: PaymentChannel = 'instapay';
  senderName: string = '';
  amountClaimed: number = 0;
  receiptUrl: string = '';
  isSubmitting: boolean = false;
  copiedValue: string | null = null;

  ngOnInit(): void {
    this.amountClaimed = this.requiredAmount;
  }

  copyToClipboard(val: string, event: Event): void {
    event.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(val);
    }
    this.copiedValue = val;
    setTimeout(() => (this.copiedValue = null), 2500);
  }

  setDemoReceipt(url: string): void {
    this.receiptUrl = url;
  }

  cancel(): void {
    this.cancelled.emit();
  }

  async submitProof(): Promise<void> {
    if (!this.receiptUrl || !this.senderName || this.amountClaimed <= 0) return;

    this.isSubmitting = true;
    const res = await this.paymentProofsService.submitPaymentProof({
      referenceType: this.referenceType,
      referenceId: this.referenceId,
      channel: this.selectedChannel,
      senderName: this.senderName,
      amountClaimed: this.amountClaimed,
      receiptStoragePath: this.receiptUrl
    });

    this.isSubmitting = false;
    if (res.success && res.proof) {
      this.proofSubmitted.emit(res.proof);
    }
  }
}
