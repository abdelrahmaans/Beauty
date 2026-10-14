import { Injectable, signal } from '@angular/core';
import { Order, OrderStatus } from '../models';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { MOCK_ORDERS } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private _orders = signal<Order[]>([]);
  private _isLoading = signal<boolean>(false);

  readonly orders = this._orders.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {
    this.loadOrders();
    this.initRealtime();
  }

  private initRealtime(): void {
    const client = this.supabase.client;
    if (client) {
      try {
        client.channel('realtime_orders_channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
            this.loadOrders();
          })
          .subscribe();
      } catch (e) {
        console.warn('Realtime orders subscription note:', e);
      }
    }
  }

  async loadOrders(): Promise<void> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data, error } = await client
          .from('orders')
          .select('*, items:order_items(*, product:products(*))')
          .order('created_at', { ascending: false });

        if (data && !error) {
          this._orders.set(data as Order[]);
        } else {
          this._orders.set(MOCK_ORDERS);
        }
      } catch {
        this._orders.set(MOCK_ORDERS);
      }
    } else {
      const saved = localStorage.getItem('beauty_orders');
      if (saved) {
        try {
          this._orders.set(JSON.parse(saved));
        } catch {
          this._orders.set(MOCK_ORDERS);
        }
      } else {
        this._orders.set(MOCK_ORDERS);
      }
    }
    this._isLoading.set(false);
  }

  async createOrder(orderPayload: Partial<Order>): Promise<{ success: boolean; orderId?: string; error?: string }> {
    this._isLoading.set(true);
    const newOrderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const currentUser = this.auth.profile();

    const newOrder: Order = {
      id: newOrderId,
      user_id: currentUser?.id || 'guest-user',
      status: 'pending',
      payment_status: 'unpaid',
      payment_method: orderPayload.payment_method || 'cash_on_delivery',
      shipping_full_name: orderPayload.shipping_full_name || 'عميل المتجر',
      shipping_phone: orderPayload.shipping_phone || '',
      shipping_address: orderPayload.shipping_address || '',
      shipping_city: orderPayload.shipping_city || 'القاهرة',
      subtotal: orderPayload.subtotal || 0,
      discount_amount: orderPayload.discount_amount || 0,
      shipping_fee: orderPayload.shipping_fee || 0,
      total_price: orderPayload.total_price || 0,
      notes: orderPayload.notes || '',
      items: orderPayload.items || [],
      created_at: new Date().toISOString()
    };

    const client = this.supabase.client;
    if (client && currentUser) {
      try {
        const orderRow: any = {
          user_id: currentUser.id,
          status: 'pending',
          payment_status: 'unpaid',
          payment_method: orderPayload.payment_method || 'cash_on_delivery',
          shipping_address: orderPayload.shipping_address || '',
          subtotal: orderPayload.subtotal || 0,
          discount_amount: orderPayload.discount_amount || 0,
          total_price: orderPayload.total_price || 0
        };
        if (orderPayload.shipping_full_name) orderRow.shipping_full_name = orderPayload.shipping_full_name;
        if (orderPayload.shipping_phone) orderRow.shipping_phone = orderPayload.shipping_phone;
        if (orderPayload.shipping_city) orderRow.shipping_city = orderPayload.shipping_city;
        if (orderPayload.shipping_fee) orderRow.shipping_fee = orderPayload.shipping_fee;
        if (orderPayload.notes) orderRow.notes = orderPayload.notes;

        const { data, error } = await client.from('orders').insert([orderRow]).select().single();
        if (data?.id) {
          newOrder.id = data.id;
          if (orderPayload.items && orderPayload.items.length > 0) {
            const itemRows = orderPayload.items.map(item => ({
              order_id: data.id,
              product_id: item.product_id,
              quantity: item.quantity,
              price_at_purchase: item.price_at_purchase
            }));
            await client.from('order_items').insert(itemRows);
          }
        }
        if (error) {
          console.warn('Orders Supabase insert note:', error.message);
        }
      } catch (e: any) {
        console.warn('Fallback to local storage for order creation:', e);
      }
    }

    this._orders.update(list => [newOrder, ...list]);
    localStorage.setItem('beauty_orders', JSON.stringify(this._orders()));

    // Award loyalty points (e.g. 1 point for every 10 EGP)
    const earnedPoints = Math.floor(newOrder.total_price / 10);
    if (currentUser) {
      this.auth.updateProfileData({
        loyalty_points: (currentUser.loyalty_points || 0) + earnedPoints
      });
    }

    this._isLoading.set(false);
    return { success: true, orderId: newOrderId };
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    const client = this.supabase.client;
    if (client) {
      await client.from('orders').update({ status }).eq('id', orderId);
    }

    this._orders.update(list =>
      list.map(o => (o.id === orderId ? { ...o, status } : o))
    );
    localStorage.setItem('beauty_orders', JSON.stringify(this._orders()));
    return true;
  }
}
