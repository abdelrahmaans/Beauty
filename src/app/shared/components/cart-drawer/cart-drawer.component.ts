import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Backdrop Overlay -->
    <div
      class="drawer-backdrop"
      *ngIf="cart.isDrawerOpen()"
      (click)="cart.closeDrawer()"
    ></div>

    <!-- Drawer Content -->
    <aside class="cart-drawer" [class.open]="cart.isDrawerOpen()">
      <!-- Drawer Header -->
      <div class="drawer-header">
        <div class="header-title">
          <i class="fa-solid fa-bag-shopping"></i>
          <h3>سلة المشتريات</h3>
          <span class="items-pill" *ngIf="cart.totalItemsCount() > 0">
            {{ cart.totalItemsCount() }} منتجات
          </span>
        </div>
        <button (click)="cart.closeDrawer()" class="close-btn" title="إغلاق السلة">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Free Shipping Goal Progress Bar -->
      <div class="shipping-progress" *ngIf="cart.items().length > 0">
        <div class="progress-text" *ngIf="!cart.isFreeShipping()">
          باقي <strong>{{ 800 - cart.subtotal() }} ج.م</strong> للحصول على <strong>شحن مجاني</strong>!
        </div>
        <div class="progress-text free" *ngIf="cart.isFreeShipping()">
          <i class="fa-solid fa-circle-check"></i> مبارك! حصلتي على <strong>شحن مجاني</strong> لهذا الطلب!
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            [style.width.%]="getProgressPercentage()"
          ></div>
        </div>
      </div>

      <!-- Empty Cart View -->
      <div class="empty-cart" *ngIf="cart.items().length === 0">
        <div class="empty-icon">
          <i class="fa-solid fa-basket-shopping"></i>
        </div>
        <h4>سلة التسوق فارغة حالياً</h4>
        <p>استكشفي تشكيلتنا الفاخرة من منتجات العناية بالشعر والبشرة وأضيفي ما يناسبك.</p>
        <button (click)="cart.closeDrawer()" routerLink="/products" class="btn-primary">
          تسوقي الآن
        </button>
      </div>

      <!-- Cart Items List -->
      <div class="drawer-body" *ngIf="cart.items().length > 0">
        <div class="cart-item-row" *ngFor="let item of cart.items()">
          <img [src]="item.product.main_image" [alt]="item.product.name" class="item-thumb" />
          
          <div class="item-info">
            <h4 class="item-name">{{ item.product.name }}</h4>
            <div class="item-price">
              {{ item.product.discount_price ?? item.product.price }} <small>ج.م</small>
            </div>

            <!-- Quantity Controls -->
            <div class="qty-actions">
              <div class="qty-box">
                <button (click)="cart.updateQuantity(item.product_id, item.quantity - 1)" class="qty-btn">
                  <i class="fa-solid fa-minus"></i>
                </button>
                <span class="qty-val">{{ item.quantity }}</span>
                <button (click)="cart.updateQuantity(item.product_id, item.quantity + 1)" class="qty-btn">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>

              <button
                (click)="cart.removeFromCart(item.product_id)"
                class="remove-item-btn"
                title="حذف من السلة"
              >
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Coupon Section -->
        <div class="coupon-box">
          <div class="coupon-input-group" *ngIf="!cart.appliedCoupon()">
            <input
              type="text"
              [(ngModel)]="couponCode"
              placeholder="كود الخصم (جربي: BEAUTY10)"
              class="coupon-input"
            />
            <button (click)="applyCoupon()" class="coupon-btn">
              تطبيق
            </button>
          </div>

          <!-- Applied Coupon Tag -->
          <div class="applied-tag" *ngIf="cart.appliedCoupon()">
            <div class="tag-details">
              <i class="fa-solid fa-tag"></i>
              <span>الكوبون <strong>{{ cart.appliedCoupon()?.code }}</strong> مفعل</span>
            </div>
            <button (click)="cart.removeCoupon()" class="remove-coupon-btn">
              إلغاء
            </button>
          </div>

          <div class="coupon-msg" *ngIf="couponMessage" [class.error]="isCouponError">
            {{ couponMessage }}
          </div>
        </div>
      </div>

      <!-- Drawer Footer Summary & Checkout Button -->
      <div class="drawer-footer" *ngIf="cart.items().length > 0">
        <div class="summary-line">
          <span>المجموع الفرعي:</span>
          <strong>{{ cart.subtotal() }} ج.م</strong>
        </div>

        <div class="summary-line discount" *ngIf="cart.discountAmount() > 0">
          <span>قيمة الخصم:</span>
          <strong>- {{ cart.discountAmount() }} ج.م</strong>
        </div>

        <div class="summary-line">
          <span>الشحن:</span>
          <span *ngIf="cart.isFreeShipping()" class="free-badge">مجاني</span>
          <strong *ngIf="!cart.isFreeShipping()">{{ cart.actualShippingFee() }} ج.م</strong>
        </div>

        <div class="summary-line total-line">
          <span>الإجمالي النهائي:</span>
          <strong class="total-value">{{ cart.totalPrice() }} ج.م</strong>
        </div>

        <a
          routerLink="/checkout"
          (click)="cart.closeDrawer()"
          class="btn-primary checkout-btn"
        >
          <span>متابعة إتمام الطلب</span>
          <i class="fa-solid fa-arrow-left"></i>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .drawer-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(30, 27, 24, 0.45);
      backdrop-filter: blur(4px);
      z-index: 1000;
      animation: fadeIn 0.25s ease;
    }
    .cart-drawer {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      max-width: 420px;
      height: 100vh;
      background: #FFFFFF;
      z-index: 1001;
      display: flex;
      flex-direction: column;
      box-shadow: -10px 0 30px rgba(0,0,0,0.15);
      transform: translateX(-100%);
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);

      &.open {
        transform: translateX(0);
      }
    }
    .drawer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--color-border-light);
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 0.6rem;

      i { color: var(--color-primary); }
      h3 { font-size: 1.15rem; font-weight: 700; }
    }
    .items-pill {
      font-size: 0.75rem;
      font-weight: 700;
      background: var(--color-primary-light);
      color: var(--color-primary);
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      color: var(--color-text-subtle);
      cursor: pointer;
      padding: 0.25rem;
      &:hover { color: var(--color-text-main); }
    }
    .shipping-progress {
      background: #FAF7F5;
      padding: 0.85rem 1.5rem;
      border-bottom: 1px solid var(--color-border-light);
    }
    .progress-text {
      font-size: 0.82rem;
      color: var(--color-text-main);
      margin-bottom: 0.4rem;

      &.free {
        color: var(--color-secondary);
        font-weight: 700;
      }
    }
    .progress-track {
      width: 100%;
      height: 6px;
      background: #E8E0D7;
      border-radius: 9999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-primary) 0%, #10B981 100%);
      transition: width 0.3s ease;
    }
    .empty-cart {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }
    .empty-icon {
      width: 70px;
      height: 70px;
      border-radius: 50%;
      background: var(--color-primary-light);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      margin-bottom: 1.25rem;
    }
    .empty-cart h4 {
      font-size: 1.15rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    .empty-cart p {
      font-size: 0.88rem;
      color: var(--color-text-muted);
      margin-bottom: 1.5rem;
    }
    .drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .cart-item-row {
      display: flex;
      gap: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border-light);
    }
    .item-thumb {
      width: 65px;
      height: 65px;
      border-radius: 10px;
      object-fit: cover;
      border: 1px solid var(--color-border-light);
    }
    .item-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .item-name {
      font-size: 0.88rem;
      font-weight: 700;
      line-height: 1.3;
      margin-bottom: 0.35rem;
    }
    .item-price {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--color-primary);
      margin-bottom: 0.5rem;
    }
    .qty-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .qty-box {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--color-border);
      border-radius: 9999px;
      background: #FAF7F5;
    }
    .qty-btn {
      width: 28px;
      height: 28px;
      border: none;
      background: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      color: var(--color-text-main);
      &:hover { color: var(--color-primary); }
    }
    .qty-val {
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0 0.4rem;
    }
    .remove-item-btn {
      background: none;
      border: none;
      color: #9CA3AF;
      cursor: pointer;
      font-size: 0.95rem;
      transition: color 0.2s ease;
      &:hover { color: #EF4444; }
    }
    .coupon-box {
      margin-top: 0.5rem;
      background: #FAF7F5;
      padding: 0.85rem;
      border-radius: 12px;
      border: 1px dashed var(--color-border);
    }
    .coupon-input-group {
      display: flex;
      gap: 0.5rem;
    }
    .coupon-input {
      flex: 1;
      padding: 0.5rem 0.85rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-size: 0.85rem;
      outline: none;
    }
    .coupon-btn {
      padding: 0.5rem 1rem;
      background: var(--color-text-main);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
    }
    .applied-tag {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--color-secondary);
      font-size: 0.85rem;
    }
    .tag-details {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }
    .remove-coupon-btn {
      background: none;
      border: none;
      color: #EF4444;
      font-size: 0.75rem;
      cursor: pointer;
      text-decoration: underline;
    }
    .coupon-msg {
      font-size: 0.78rem;
      margin-top: 0.4rem;
      color: var(--color-secondary);

      &.error { color: #EF4444; }
    }
    .drawer-footer {
      padding: 1.25rem 1.5rem;
      border-top: 1px solid var(--color-border-light);
      background: #FFFFFF;
      box-shadow: 0 -4px 15px rgba(0,0,0,0.04);
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      color: var(--color-text-muted);

      &.discount {
        color: #10B981;
      }
    }
    .free-badge {
      background: #EBF5F0;
      color: #10B981;
      font-weight: 700;
      padding: 0.15rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
    }
    .total-line {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--color-border-light);
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--color-text-main);
    }
    .total-value {
      font-size: 1.3rem;
      color: var(--color-primary);
    }
    .checkout-btn {
      width: 100%;
      margin-top: 1rem;
      padding: 0.85rem;
      font-size: 1rem;
    }
  `]
})
export class CartDrawerComponent {
  cart = inject(CartService);
  couponCode: string = '';
  couponMessage: string = '';
  isCouponError: boolean = false;

  getProgressPercentage(): number {
    const sub = this.cart.subtotal();
    return Math.min(100, Math.round((sub / 800) * 100));
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) return;
    const res = this.cart.applyCouponCode(this.couponCode);
    this.couponMessage = res.message;
    this.isCouponError = !res.success;
    if (res.success) {
      this.couponCode = '';
    }
  }
}
