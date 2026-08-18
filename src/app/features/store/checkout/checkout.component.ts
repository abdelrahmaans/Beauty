import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { OrdersService } from '../../../core/services/orders.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentMethod } from '../../../core/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="checkout-page">
      <div class="container-custom">
        <!-- Breadcrumb -->
        <div class="breadcrumb py-3">
          <a routerLink="/">الرئيسية</a>
          <i class="fa-solid fa-chevron-left"></i>
          <a routerLink="/products">المتجر</a>
          <i class="fa-solid fa-chevron-left"></i>
          <span class="active-crumb">إتمام الطلب والدفع</span>
        </div>

        <!-- Success Screen View -->
        <div class="success-screen beauty-card animate-fade-in" *ngIf="orderSuccessId">
          <div class="success-icon">
            <i class="fa-solid fa-check"></i>
          </div>
          <h2>تم استلام طلبك بنجاح!</h2>
          <p class="order-num-text">رقم الطلب الخاص بك: <strong>#{{ orderSuccessId }}</strong></p>
          <p class="success-sub">
            سيتواصل معك مندوب الشحن لتأكيد الموعد والتسليم خلال 24 إلى 48 ساعة.
          </p>

          <div class="earned-points-banner">
            <i class="fa-solid fa-gem"></i>
            <span>مبروك! كسبتي <strong>{{ Math.floor(placedOrderTotal / 10) }}</strong> نقطة ولاء تمت إضافتها لحسابك.</span>
          </div>

          <div class="success-actions">
            <a routerLink="/account" class="btn-secondary">
              <i class="fa-regular fa-user"></i> تتبع الطلب من حسابي
            </a>
            <a routerLink="/products" class="btn-primary">
              <i class="fa-solid fa-bag-shopping"></i> متابعة التسوق
            </a>
          </div>
        </div>

        <!-- Empty Cart Notice -->
        <div class="empty-checkout beauty-card" *ngIf="!orderSuccessId && cart.items().length === 0">
          <div class="empty-icon"><i class="fa-solid fa-basket-shopping"></i></div>
          <h3>سلة المشتريات فارغة</h3>
          <p>أضيفي بعض المنتجات لتتمكني من إتمام الطلب.</p>
          <a routerLink="/products" class="btn-primary">تصفحي المنتجات الآن</a>
        </div>

        <!-- Checkout Form Grid -->
        <div class="checkout-grid" *ngIf="!orderSuccessId && cart.items().length > 0">
          <!-- Right: Shipping & Payment Form -->
          <div class="form-column">
            <!-- 1. Shipping Info -->
            <div class="form-section beauty-card">
              <div class="section-title-box">
                <span class="step-badge">1</span>
                <h3>عنوان ومعلومات الشحن والتوصيل</h3>
              </div>

              <div class="form-grid">
                <div class="form-group full-width">
                  <label>الاسم بالكامل <span class="req">*</span></label>
                  <input
                    type="text"
                    [(ngModel)]="shippingName"
                    placeholder="مثال: سارة محمد أحمد"
                    class="input-custom"
                  />
                </div>

                <div class="form-group">
                  <label>رقم الموبايل للتواصل <span class="req">*</span></label>
                  <input
                    type="tel"
                    [(ngModel)]="shippingPhone"
                    placeholder="01012345678"
                    class="input-custom"
                    dir="ltr"
                  />
                </div>

                <div class="form-group">
                  <label>المحافظة / المدينة <span class="req">*</span></label>
                  <select [(ngModel)]="shippingCity" class="input-custom select-city">
                    <option value="القاهرة">القاهرة</option>
                    <option value="الجيزة">الجيزة</option>
                    <option value="الإسكندرية">الإسكندرية</option>
                    <option value="المنصورة (الدقهلية)">المنصورة (الدقهلية)</option>
                    <option value="طنطا (الغربية)">طنطا (الغربية)</option>
                    <option value="بني سويف">بني سويف</option>
                    <option value="أسيوط">أسيوط</option>
                    <option value="باقي المحافظات">باقي المحافظات</option>
                  </select>
                </div>

                <div class="form-group full-width">
                  <label>العنوان بالتفصيل (اسم الشارع، رقم العمارة، الدور، الشقة) <span class="req">*</span></label>
                  <input
                    type="text"
                    [(ngModel)]="shippingAddress"
                    placeholder="مثال: شارع مصطفى النحاس، عمارة 25، الدور الرابع، شقة 8"
                    class="input-custom"
                  />
                </div>

                <div class="form-group full-width">
                  <label>ملاحظات إضافية للمندوب (اختياري)</label>
                  <input
                    type="text"
                    [(ngModel)]="orderNotes"
                    placeholder="مثال: يرجى الاتصال قبل الوصول بنصف ساعة"
                    class="input-custom"
                  />
                </div>
              </div>
            </div>

            <!-- 2. Payment Method -->
            <div class="form-section beauty-card">
              <div class="section-title-box">
                <span class="step-badge">2</span>
                <h3>طريقة الدفع</h3>
              </div>

              <div class="payment-options">
                <label
                  class="payment-card"
                  [class.selected]="selectedPayment === 'cash_on_delivery'"
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cash_on_delivery"
                    [(ngModel)]="selectedPayment"
                  />
                  <div class="payment-icon"><i class="fa-solid fa-money-bill-wave"></i></div>
                  <div class="payment-text">
                    <strong>الدفع نقداً عند الاستلام (COD)</strong>
                    <p>ادفعي كاش أو بفيزا عند وصول المندوب لباب بيتك</p>
                  </div>
                </label>

                <label
                  class="payment-card"
                  [class.selected]="selectedPayment === 'card'"
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    [(ngModel)]="selectedPayment"
                  />
                  <div class="payment-icon"><i class="fa-solid fa-credit-card"></i></div>
                  <div class="payment-text">
                    <strong>بطاقة بنكية / فيزا أو ماستركارد (Paymob Gateway)</strong>
                    <p>دفع إلكتروني آمن ومشفر 100%</p>
                  </div>
                </label>

                <label
                  class="payment-card"
                  [class.selected]="selectedPayment === 'wallet'"
                >
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    [(ngModel)]="selectedPayment"
                  />
                  <div class="payment-icon"><i class="fa-solid fa-mobile-screen"></i></div>
                  <div class="payment-text">
                    <strong>محفظة إلكترونية (فودافون كاش، اتصالات كاش، إنستاباي)</strong>
                    <p>تحويل مباشر وسريع عبر المحفظة</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <!-- Left: Order Summary Column -->
          <div class="summary-column">
            <div class="order-summary-card beauty-card">
              <h3 class="summary-title">ملخص الطلب ({{ cart.totalItemsCount() }} منتجات)</h3>

              <div class="items-mini-list">
                <div class="mini-item" *ngFor="let item of cart.items()">
                  <img [src]="item.product.main_image" [alt]="item.product.name" class="mini-thumb" />
                  <div class="mini-info">
                    <strong>{{ item.product.name }}</strong>
                    <div class="mini-meta">
                      <span>الكمية: {{ item.quantity }}</span>
                      <span class="mini-price">{{ (item.product.discount_price ?? item.product.price) * item.quantity }} ج.م</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Breakdown -->
              <div class="breakdown-list">
                <div class="b-row">
                  <span>المجموع الفرعي:</span>
                  <strong>{{ cart.subtotal() }} ج.م</strong>
                </div>

                <div class="b-row discount-row" *ngIf="cart.discountAmount() > 0">
                  <span>كود الخصم ({{ cart.appliedCoupon()?.code }}):</span>
                  <strong>- {{ cart.discountAmount() }} ج.م</strong>
                </div>

                <div class="b-row">
                  <span>مصاريف الشحن:</span>
                  <span *ngIf="cart.isFreeShipping()" class="free-tag">مجاني</span>
                  <strong *ngIf="!cart.isFreeShipping()">{{ cart.actualShippingFee() }} ج.م</strong>
                </div>

                <div class="b-row total-row">
                  <span>الإجمالي للدفع:</span>
                  <strong class="grand-total">{{ cart.totalPrice() }} ج.م</strong>
                </div>
              </div>

              <!-- Submit Button -->
              <button
                (click)="submitOrder()"
                [disabled]="isSubmitting || !isFormValid()"
                class="btn-primary place-order-btn"
              >
                <span *ngIf="!isSubmitting">
                  <i class="fa-solid fa-lock"></i> تأكيد الطلب ({{ cart.totalPrice() }} ج.م)
                </span>
                <span *ngIf="isSubmitting">
                  <i class="fa-solid fa-spinner fa-spin"></i> جاري تأكيد طلبك...
                </span>
              </button>

              <p class="privacy-note">
                <i class="fa-solid fa-shield-check"></i> بياناتك الشخصية محمية بالكامل ومشفرة طبقا لأعلى معايير الأمان.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-page {
      padding-bottom: 5rem;
      background: #FAF7F5;
      min-height: 80vh;
    }
    .py-3 { padding: 1.25rem 0; }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--color-text-subtle);

      a {
        color: var(--color-text-muted);
        text-decoration: none;
        &:hover { color: var(--color-primary); }
      }
      i { font-size: 0.65rem; }
      .active-crumb {
        color: var(--color-primary);
        font-weight: 700;
      }
    }
    .checkout-grid {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 2.5rem;
      align-items: flex-start;

      @media (max-width: 960px) {
        grid-template-columns: 1fr;
      }
    }
    .form-column {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .form-section {
      padding: 1.75rem 2rem;
    }
    .section-title-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--color-border-light);

      h3 { font-size: 1.15rem; font-weight: 700; }
    }
    .step-badge {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--color-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.85rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;

      @media (max-width: 600px) {
        grid-template-columns: 1fr;
      }
    }
    .full-width {
      grid-column: 1 / -1;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;

      label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--color-text-main);
      }
      .req { color: #EF4444; }
    }
    .select-city {
      cursor: pointer;
    }

    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .payment-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.15rem 1.25rem;
      border: 1.5px solid var(--color-border);
      border-radius: 14px;
      cursor: pointer;
      transition: var(--transition-smooth);
      background: #FAF7F5;

      input[type="radio"] {
        accent-color: var(--color-primary);
        width: 18px;
        height: 18px;
      }

      &.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-subtle);
      }
    }
    .payment-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: #FFFFFF;
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    .payment-text {
      strong { font-size: 0.92rem; display: block; margin-bottom: 0.15rem; }
      p { font-size: 0.78rem; color: var(--color-text-muted); margin: 0; }
    }

    .order-summary-card {
      padding: 2rem;
      position: sticky;
      top: 100px;
    }
    .summary-title {
      font-size: 1.2rem;
      font-weight: 800;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border-light);
    }
    .items-mini-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      max-height: 240px;
      overflow-y: auto;
      margin-bottom: 1.5rem;
      padding-left: 0.25rem;
    }
    .mini-item {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .mini-thumb {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid var(--color-border-light);
    }
    .mini-info {
      flex: 1;
      strong { font-size: 0.85rem; display: block; line-height: 1.3; }
    }
    .mini-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: var(--color-text-subtle);
      margin-top: 0.2rem;
    }
    .mini-price {
      color: var(--color-primary);
      font-weight: 700;
    }
    .breakdown-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-light);
    }
    .b-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9rem;
      color: var(--color-text-muted);

      &.discount-row { color: #10B981; }
    }
    .free-tag {
      background: #EBF5F0;
      color: #10B981;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
    }
    .total-row {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-border-light);
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--color-text-main);
    }
    .grand-total {
      font-size: 1.4rem;
      color: var(--color-primary);
    }
    .place-order-btn {
      width: 100%;
      margin-top: 1.5rem;
      padding: 0.95rem;
      font-size: 1.05rem;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    }
    .privacy-note {
      font-size: 0.75rem;
      color: var(--color-text-subtle);
      text-align: center;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
    }

    .success-screen {
      text-align: center;
      padding: 4rem 2rem;
      max-width: 620px;
      margin: 2rem auto;

      .success-icon {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: #10B981;
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 2.2rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35);
      }
      h2 { font-size: 1.85rem; font-weight: 800; margin-bottom: 0.5rem; }
      .order-num-text { font-size: 1.1rem; color: var(--color-primary); margin-bottom: 0.75rem; }
      .success-sub { color: var(--color-text-muted); font-size: 0.95rem; margin-bottom: 2rem; }
    }
    .earned-points-banner {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #FFFBEB;
      border: 1px solid #FDE68A;
      color: #92400E;
      padding: 0.75rem 1.25rem;
      border-radius: 9999px;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }
    .success-actions {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .empty-checkout {
      text-align: center;
      padding: 4rem 2rem;
      max-width: 500px;
      margin: 3rem auto;
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
export class CheckoutComponent {
  cart = inject(CartService);
  private ordersService = inject(OrdersService);
  private auth = inject(AuthService);

  shippingName: string = this.auth.profile()?.full_name || '';
  shippingPhone: string = this.auth.profile()?.phone || '';
  shippingCity: string = this.auth.profile()?.city || 'القاهرة';
  shippingAddress: string = this.auth.profile()?.address_line || '';
  orderNotes: string = '';
  selectedPayment: PaymentMethod = 'cash_on_delivery';

  isSubmitting: boolean = false;
  orderSuccessId: string | null = null;
  placedOrderTotal: number = 0;
  Math = Math;

  isFormValid(): boolean {
    return !!(
      this.shippingName.trim() &&
      this.shippingPhone.trim() &&
      this.shippingAddress.trim() &&
      this.shippingCity
    );
  }

  async submitOrder(): Promise<void> {
    if (!this.isFormValid()) return;

    this.isSubmitting = true;
    this.placedOrderTotal = this.cart.totalPrice();

    const orderItems = this.cart.items().map(item => ({
      product_id: item.product_id,
      product: item.product,
      quantity: item.quantity,
      price_at_purchase: item.product.discount_price ?? item.product.price
    }));

    const result = await this.ordersService.createOrder({
      shipping_full_name: this.shippingName,
      shipping_phone: this.shippingPhone,
      shipping_city: this.shippingCity,
      shipping_address: this.shippingAddress,
      notes: this.orderNotes,
      payment_method: this.selectedPayment,
      subtotal: this.cart.subtotal(),
      discount_amount: this.cart.discountAmount(),
      shipping_fee: this.cart.actualShippingFee(),
      total_price: this.cart.totalPrice(),
      items: orderItems,
      coupon_id: this.cart.appliedCoupon()?.id
    });

    this.isSubmitting = false;

    if (result.success && result.orderId) {
      this.orderSuccessId = result.orderId;
      this.cart.clearCart();
    }
  }
}
