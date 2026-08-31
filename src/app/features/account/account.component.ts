import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { OrdersService } from '../../core/services/orders.service';
import { PaymentProofsService } from '../../core/services/payment-proofs.service';
import { OrderStatus, PaymentMethod, PaymentProof } from '../../core/models';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="account-page">
      <div class="container-custom">
        <!-- Header -->
        <div class="account-header">
          <div class="user-greeting">
            <div class="avatar-large">
              {{ auth.profile()?.full_name?.charAt(0) || 'ع' }}
            </div>
            <div>
              <h1>أهلاً بكِ، {{ auth.profile()?.full_name || 'عميلة المتجر' }}</h1>
              <p class="user-meta">
                <span class="role-badge" [class.admin]="auth.isAdmin()">
                  {{ auth.isAdmin() ? 'حساب مديرة المتجر (Admin)' : 'عضوية برنامج الجمال' }}
                </span>
                <span>• مسجلة منذ أغسطس 2026</span>
              </p>
            </div>
          </div>

          <!-- Loyalty Points Card -->
          <div class="points-card glass-panel">
            <div class="points-icon"><i class="fa-solid fa-gem"></i></div>
            <div class="points-details">
              <span class="points-sub">رصيد نقاط الولاء</span>
              <strong class="points-num">{{ auth.loyaltyPoints() }} <small>نقطة</small></strong>
              <p class="points-equiv">تعادل خصم بقيمة <strong>{{ auth.loyaltyPoints() }} ج.م</strong> على طلباتك القادمة</p>
            </div>
          </div>
        </div>

        <!-- Account Navigation Tabs -->
        <div class="account-tabs">
          <button
            class="tab-link"
            [class.active]="activeTab === 'orders'"
            (click)="activeTab = 'orders'"
          >
            <i class="fa-solid fa-box-archive"></i> طلباتي ({{ ordersService.orders().length }})
          </button>
          <button
            class="tab-link"
            [class.active]="activeTab === 'profile'"
            (click)="activeTab = 'profile'"
          >
            <i class="fa-regular fa-id-card"></i> البيانات والعناوين
          </button>
        </div>

        <!-- Tab 1: Orders History -->
        <div class="orders-tab-content animate-fade-in" *ngIf="activeTab === 'orders'">
          <div class="empty-orders beauty-card" *ngIf="ordersService.orders().length === 0">
            <div class="empty-icon"><i class="fa-solid fa-box-open"></i></div>
            <h3>لا توجد طلبات سابقة حتى الآن</h3>
            <p>ابدأي رحلة العناية الفاخرة وتسوقي أفضل المنتجات الآن.</p>
            <a routerLink="/products" class="btn-primary">تصفحي المنتجات</a>
          </div>

          <div class="orders-list" *ngIf="ordersService.orders().length > 0">
            <div class="order-card beauty-card" *ngFor="let order of ordersService.orders()">
              <div class="order-card-header">
                <div>
                  <span class="order-id">طلب رقم: <strong>#{{ order.id }}</strong></span>
                  <span class="order-date">{{ order.created_at | date:'yyyy/MM/dd - hh:mm a' }}</span>
                </div>
                <div class="status-badge" [ngClass]="getStatusClass(order.status)">
                  {{ getStatusArabic(order.status) }}
                </div>
              </div>

              <!-- Payment Proof status banner for manual orders -->
              <div class="account-order-proof-box" *ngIf="getOrderProof(order.id)?.status === 'pending_review'">
                <i class="fa-solid fa-clock-rotate-left"></i>
                <span>تم إرسال إيصال التحويل بمبلغ {{ getOrderProof(order.id)?.amount_claimed }} ج.م عبر ({{ getOrderProof(order.id)?.channel }}) — جاري التحقق من الإدارة لتأكيد الشحن فوراً.</span>
              </div>

              <!-- Order Items preview -->
              <div class="order-card-body">
                <div class="order-items-grid">
                  <div class="item-preview" *ngFor="let it of order.items">
                    <img [src]="it.product?.main_image" [alt]="it.product?.name" class="it-thumb" />
                    <div class="it-info">
                      <strong>{{ it.product?.name }}</strong>
                      <span class="it-meta">{{ it.quantity }} × {{ it.price_at_purchase }} ج.م</span>
                    </div>
                  </div>
                </div>

                <!-- Shipping summary -->
                <div class="shipping-preview">
                  <div class="preview-line">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>{{ order.shipping_city }} — {{ order.shipping_address }}</span>
                  </div>
                  <div class="preview-line">
                    <i class="fa-solid fa-phone"></i>
                    <span>{{ order.shipping_phone }} ({{ order.shipping_full_name }})</span>
                  </div>
                </div>
              </div>

              <!-- Footer with total -->
              <div class="order-card-footer">
                <div class="payment-info">
                  <i class="fa-solid" [ngClass]="order.payment_method === 'manual_transfer' ? 'fa-bolt text-indigo' : 'fa-credit-card'"></i>
                  <span>طريقة الدفع: {{ getPaymentMethodArabic(order.payment_method) }}</span>
                </div>
                <div class="order-total-price">
                  <span>الإجمالي:</span>
                  <strong>{{ order.total_price }} ج.م</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Profile & Addresses -->
        <div class="profile-tab-content beauty-card animate-fade-in" *ngIf="activeTab === 'profile'">
          <h3 class="tab-title">تعديل البيانات الشخصية وعنوان الشحن</h3>

          <div class="form-grid">
            <div class="form-group">
              <label>الاسم الكامل</label>
              <input type="text" [(ngModel)]="profileName" class="input-custom" />
            </div>

            <div class="form-group">
              <label>رقم الموبايل</label>
              <input type="tel" [(ngModel)]="profilePhone" class="input-custom" dir="ltr" />
            </div>

            <div class="form-group">
              <label>المحافظة الافتراضية</label>
              <select [(ngModel)]="profileCity" class="input-custom">
                <option value="القاهرة">القاهرة</option>
                <option value="الجيزة">الجيزة</option>
                <option value="الإسكندرية">الإسكندرية</option>
                <option value="المنصورة (الدقهلية)">المنصورة (الدقهلية)</option>
                <option value="طنطا (الغربية)">طنطا (الغربية)</option>
                <option value="بني سويف">بني سويف</option>
                <option value="أسيوط">أسيوط</option>
              </select>
            </div>

            <div class="form-group">
              <label>العنوان بالتفصيل</label>
              <input type="text" [(ngModel)]="profileAddress" class="input-custom" />
            </div>
          </div>

          <div class="save-profile-box">
            <button (click)="saveProfile()" class="btn-primary">
              <i class="fa-solid fa-floppy-disk"></i> حفظ التعديلات
            </button>
            <span class="save-msg" *ngIf="isSaved">تم حفظ البيانات بنجاح!</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .account-page {
      padding: 2.5rem 0 5rem;
      background: #FAF7F5;
      min-height: 85vh;
    }
    .account-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 2rem;
      margin-bottom: 2.5rem;
    }
    .user-greeting {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .avatar-large {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary) 0%, #D4AF37 100%);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.85rem;
      font-weight: 800;
      box-shadow: var(--shadow-md);
    }
    .user-greeting h1 {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--color-text-main);
      margin-bottom: 0.25rem;
    }
    .user-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--color-text-subtle);
    }
    .role-badge {
      background: var(--color-secondary-light);
      color: var(--color-secondary);
      font-weight: 700;
      padding: 0.15rem 0.6rem;
      border-radius: 9999px;

      &.admin {
        background: #FEE2E2;
        color: #B91C1C;
      }
    }
    .points-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.75rem;
      border-radius: 20px;
      border: 1px solid rgba(212, 175, 55, 0.4);
      background: linear-gradient(135deg, #FFFFFF 0%, #FFFDF7 100%);
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.12);
    }
    .points-icon {
      width: 50px;
      height: 50px;
      border-radius: 14px;
      background: #FEF3C7;
      color: #D97706;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .points-sub {
      font-size: 0.8rem;
      color: var(--color-text-subtle);
      display: block;
    }
    .points-num {
      font-size: 1.6rem;
      font-weight: 900;
      color: #B45309;

      small { font-size: 0.9rem; }
    }
    .points-equiv {
      font-size: 0.78rem;
      color: var(--color-text-muted);
      margin: 0;
    }

    .account-tabs {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--color-border-light);
      padding-bottom: 0.5rem;
    }
    .tab-link {
      background: none;
      border: none;
      padding: 0.75rem 1.5rem;
      font-family: inherit;
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text-muted);
      cursor: pointer;
      border-radius: 10px;
      transition: var(--transition-smooth);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;

      &.active {
        background: #FFFFFF;
        color: var(--color-primary);
        box-shadow: var(--shadow-sm);
      }
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .order-card {
      padding: 1.5rem 1.75rem;
    }
    .order-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border-light);
      margin-bottom: 1.25rem;
    }
    .order-id {
      font-size: 1.05rem;
      color: var(--color-text-main);
      margin-left: 1rem;
    }
    .order-date {
      font-size: 0.8rem;
      color: var(--color-text-subtle);
    }
    .status-badge {
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;

      &.status-pending { background: #FEF3C7; color: #B45309; }
      &.status-confirmed { background: #DBEAFE; color: #1D4ED8; }
      &.status-shipped { background: #E0E7FF; color: #4338CA; }
      &.status-delivered { background: #DCFCE7; color: #15803D; }
      &.status-cancelled { background: #FEE2E2; color: #B91C1C; }
    }
    .order-card-body {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.25rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }
    .order-items-grid {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .item-preview {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .it-thumb {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid var(--color-border-light);
    }
    .it-info strong {
      font-size: 0.88rem;
      display: block;
    }
    .it-meta {
      font-size: 0.78rem;
      color: var(--color-text-subtle);
    }
    .shipping-preview {
      background: #FAF7F5;
      padding: 1rem;
      border-radius: 12px;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .preview-line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: var(--color-text-muted);

      i { color: var(--color-primary); }
    }
    .order-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-light);
    }
    .payment-info {
      font-size: 0.85rem;
      color: var(--color-text-subtle);
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .order-total-price {
      display: flex;
      align-items: baseline;
      gap: 0.4rem;
      font-size: 0.95rem;

      strong {
        font-size: 1.3rem;
        font-weight: 800;
        color: var(--color-primary);
      }
    }

    .profile-tab-content {
      padding: 2.5rem;
    }
    .tab-title {
      font-size: 1.25rem;
      font-weight: 800;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border-light);
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;

      @media (max-width: 600px) {
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
      }
    }
    .save-profile-box {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .save-msg {
      color: #10B981;
      font-size: 0.88rem;
      font-weight: 700;
    }
    .account-order-proof-box {
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      color: #92400E;
      font-size: 0.82rem;
      padding: 0.65rem 1rem;
      border-radius: 10px;
      margin: 0.75rem 1.5rem 0.25rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      i { color: #D97706; }
    }
    .text-indigo { color: #6366F1 !important; }
    .empty-orders {
      text-align: center;
      padding: 4rem 2rem;
      .empty-icon {
        font-size: 3rem;
        color: var(--color-primary);
        margin-bottom: 1rem;
      }
      h3 { margin-bottom: 0.5rem; }
      p { color: var(--color-text-muted); margin-bottom: 1.5rem; }
    }
  `]
})
export class AccountComponent {
  auth = inject(AuthService);
  ordersService = inject(OrdersService);
  paymentProofsService = inject(PaymentProofsService);

  activeTab: 'orders' | 'profile' = 'orders';

  profileName: string = this.auth.profile()?.full_name || '';
  profilePhone: string = this.auth.profile()?.phone || '';
  profileCity: string = this.auth.profile()?.city || 'القاهرة';
  profileAddress: string = this.auth.profile()?.address_line || '';
  isSaved: boolean = false;

  getStatusArabic(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      pending: 'قيد المراجعة والانتظار',
      confirmed: 'تم التأكيد وتجهيز الشحنة',
      shipped: 'تم تسليمها للمندوب (قيد الشحن)',
      delivered: 'تم التوصيل بنجاح',
      cancelled: 'ملغي'
    };
    return map[status] || status;
  }

  getStatusClass(status: OrderStatus): string {
    return `status-${status}`;
  }

  getOrderProof(orderId: string): PaymentProof | undefined {
    return this.paymentProofsService.getProofForReference('order', orderId);
  }

  getPaymentMethodArabic(method: PaymentMethod): string {
    const map: Record<PaymentMethod, string> = {
      cash_on_delivery: 'كاش عند الاستلام (COD)',
      manual_transfer: 'تحويل مباشر (InstaPay / فودافون كاش / بنكي)',
      card: 'بطاقة بنكية / فيزا أو ماستركارد',
      wallet: 'محفظة إلكترونية'
    };
    return map[method] || method;
  }

  saveProfile(): void {
    this.auth.updateProfileData({
      full_name: this.profileName,
      phone: this.profilePhone,
      city: this.profileCity,
      address_line: this.profileAddress
    });
    this.isSaved = true;
    setTimeout(() => (this.isSaved = false), 3000);
  }
}
