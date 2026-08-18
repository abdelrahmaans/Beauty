import { Injectable, signal, computed } from '@angular/core';
import { CartItem, Product, Coupon } from '../models';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { MOCK_COUPONS } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private _items = signal<CartItem[]>([]);
  private _appliedCoupon = signal<Coupon | null>(null);
  private _isDrawerOpen = signal<boolean>(false);
  private _shippingFee = signal<number>(50); // EGP standard shipping

  // Readonly Signals
  readonly items = this._items.asReadonly();
  readonly appliedCoupon = this._appliedCoupon.asReadonly();
  readonly isDrawerOpen = this._isDrawerOpen.asReadonly();
  readonly shippingFee = this._shippingFee.asReadonly();

  // Computed Values
  readonly totalItemsCount = computed(() => {
    return this._items().reduce((sum, item) => sum + item.quantity, 0);
  });

  readonly subtotal = computed(() => {
    return this._items().reduce((sum, item) => {
      const price = item.product.discount_price ?? item.product.price;
      return sum + (price * item.quantity);
    }, 0);
  });

  readonly discountAmount = computed(() => {
    const coupon = this._appliedCoupon();
    const sub = this.subtotal();
    if (!coupon || sub === 0) return 0;

    if (coupon.min_order_amount && sub < coupon.min_order_amount) {
      return 0;
    }

    if (coupon.discount_type === 'percentage') {
      const calc = (sub * coupon.value) / 100;
      return coupon.max_discount_amount ? Math.min(calc, coupon.max_discount_amount) : calc;
    } else {
      return Math.min(coupon.value, sub);
    }
  });

  readonly isFreeShipping = computed(() => this.subtotal() >= 800);

  readonly actualShippingFee = computed(() => {
    if (this._items().length === 0) return 0;
    return this.isFreeShipping() ? 0 : this._shippingFee();
  });

  readonly totalPrice = computed(() => {
    if (this._items().length === 0) return 0;
    return Math.max(0, this.subtotal() - this.discountAmount() + this.actualShippingFee());
  });

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {
    this.loadCart();
  }

  private loadCart(): void {
    const saved = localStorage.getItem('beauty_cart');
    if (saved) {
      try {
        this._items.set(JSON.parse(saved));
      } catch {
        this._items.set([]);
      }
    }
  }

  private saveCart(): void {
    localStorage.setItem('beauty_cart', JSON.stringify(this._items()));
  }

  openDrawer(): void {
    this._isDrawerOpen.set(true);
  }

  closeDrawer(): void {
    this._isDrawerOpen.set(false);
  }

  toggleDrawer(): void {
    this._isDrawerOpen.update(v => !v);
  }

  addToCart(product: Product, quantity: number = 1): void {
    this._items.update(currentItems => {
      const existingIdx = currentItems.findIndex(i => i.product_id === product.id);
      if (existingIdx > -1) {
        const updated = [...currentItems];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity
        };
        return updated;
      } else {
        return [
          ...currentItems,
          {
            product_id: product.id,
            product,
            quantity
          }
        ];
      }
    });

    this.saveCart();
    this.openDrawer();
  }

  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    this._items.update(current =>
      current.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
    this.saveCart();
  }

  removeFromCart(productId: string): void {
    this._items.update(current => current.filter(i => i.product_id !== productId));
    this.saveCart();
  }

  clearCart(): void {
    this._items.set([]);
    this._appliedCoupon.set(null);
    this.saveCart();
  }

  applyCouponCode(code: string): { success: boolean; message: string } {
    const trimmed = code.trim().toUpperCase();
    const found = MOCK_COUPONS.find(c => c.code === trimmed && c.is_active);

    if (!found) {
      return { success: false, message: 'كود الخصم غير صالح أو منتهي الصلاحية' };
    }

    if (found.min_order_amount && this.subtotal() < found.min_order_amount) {
      return {
        success: false,
        message: `الحد الأدنى لتفعيل هذا الكوبون هو ${found.min_order_amount} ج.م`
      };
    }

    this._appliedCoupon.set(found);
    return { success: true, message: `تم تطبيق خصم ${found.discount_type === 'percentage' ? found.value + '%' : found.value + ' ج.م'} بنجاح!` };
  }

  removeCoupon(): void {
    this._appliedCoupon.set(null);
  }
}
