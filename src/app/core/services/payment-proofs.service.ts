import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { NotificationsService } from './notifications.service';
import { OrdersService } from './orders.service';
import { BookingsService } from './bookings.service';
import { PaymentProof, PaymentReferenceType, PaymentChannel, PaymentProofStatus } from '../models';
import { MOCK_PAYMENT_PROOFS } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class PaymentProofsService {
  private _proofs = signal<PaymentProof[]>([]);
  private _isLoading = signal<boolean>(false);

  readonly proofs = this._proofs.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Pending proofs queue for admin review
  readonly pendingProofs = computed(() => {
    return this._proofs().filter(p => p.status === 'pending_review');
  });

  // Customer's own submitted proofs
  readonly myProofs = computed(() => {
    const userProfile = this.auth.profile();
    if (!userProfile) return [];
    return this._proofs().filter(p => p.user_id === userProfile.id || p.user_id === 'usr-cust-01');
  });

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService,
    private notifications: NotificationsService,
    private ordersService: OrdersService,
    private bookingsService: BookingsService
  ) {
    this.loadProofs();
  }

  async loadProofs(): Promise<void> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data, error } = await client
          .from('payment_proofs')
          .select('*, user:profiles(*)');

        if (data && !error && data.length > 0) {
          this._proofs.set(data as PaymentProof[]);
        } else {
          this._proofs.set(MOCK_PAYMENT_PROOFS);
        }
      } catch {
        this._proofs.set(MOCK_PAYMENT_PROOFS);
      }
    } else {
      const saved = localStorage.getItem('beauty_payment_proofs');
      if (saved) {
        try {
          this._proofs.set(JSON.parse(saved));
        } catch {
          this._proofs.set(MOCK_PAYMENT_PROOFS);
        }
      } else {
        this._proofs.set(MOCK_PAYMENT_PROOFS);
      }
    }
    this._isLoading.set(false);
  }

  private saveProofs(): void {
    localStorage.setItem('beauty_payment_proofs', JSON.stringify(this._proofs()));
  }

  getProofForReference(refType: PaymentReferenceType, refId: string): PaymentProof | undefined {
    return this._proofs().find(p => p.reference_type === refType && p.reference_id === refId);
  }

  // 1. Customer submits a payment receipt / proof
  async submitPaymentProof(payload: {
    referenceType: PaymentReferenceType;
    referenceId: string;
    channel: PaymentChannel;
    senderName?: string;
    amountClaimed: number;
    receiptStoragePath: string;
  }): Promise<{ success: boolean; proof?: PaymentProof; error?: string }> {
    this._isLoading.set(true);
    const userProfile = this.auth.profile();

    const newProof: PaymentProof = {
      id: 'prf-' + Date.now(),
      reference_type: payload.referenceType,
      reference_id: payload.referenceId,
      user_id: userProfile?.id || 'usr-cust-01',
      user: userProfile || undefined,
      channel: payload.channel,
      sender_name: payload.senderName || userProfile?.full_name || 'العميل',
      amount_claimed: payload.amountClaimed,
      receipt_storage_path: payload.receiptStoragePath,
      status: 'pending_review',
      created_at: new Date().toISOString()
    };

    const client = this.supabase.client;
    if (client) {
      try {
        await client.from('payment_proofs').insert([newProof]);
      } catch (e) {
        console.warn('Fallback to local storage for payment proof:', e);
      }
    }

    this._proofs.update(list => [newProof, ...list]);
    this.saveProofs();

    // Alert Admin
    this.notifications.addNotification(
      'إثبات تحويل بنكي جديد للمراجعة!',
      `قامت العميلة (${newProof.sender_name}) برفع إثبات تحويل بمبلغ ${payload.amountClaimed} ج.م عبر (${payload.channel}) بانتظار مراجعتك.`,
      'usr-admin-01'
    );

    this._isLoading.set(false);
    return { success: true, proof: newProof };
  }

  // 2. Admin approves payment proof -> Triggers Order / Booking confirmation
  async approveProof(proofId: string): Promise<boolean> {
    const proof = this._proofs().find(p => p.id === proofId);
    if (!proof) return false;

    this._proofs.update(list =>
      list.map(p => {
        if (p.id === proofId) {
          return {
            ...p,
            status: 'approved' as PaymentProofStatus,
            reviewed_by: this.auth.profile()?.id || 'usr-admin-01',
            reviewed_at: new Date().toISOString()
          };
        }
        return p;
      })
    );
    this.saveProofs();

    // Execute state updates for linked order or booking
    if (proof.reference_type === 'order') {
      await this.ordersService.updateOrderStatus(proof.reference_id, 'confirmed');
    } else if (proof.reference_type === 'booking') {
      await this.bookingsService.acceptBookingOffer(proof.reference_id);
    }

    // Send in-app notification to customer
    this.notifications.addNotification(
      'تم اعتماد التحويل وتأكيد طلبكِ بنجاح!',
      `تم مراجعة إيصال التحويل بمبلغ ${proof.amount_claimed} ج.م بنجاح وتأكيد ${proof.reference_type === 'order' ? 'طلب المتجر' : 'حجز الجلسة المنزلية'}.`,
      proof.user_id
    );

    return true;
  }

  // 3. Admin rejects payment proof with a reason
  async rejectProof(proofId: string, reason: string): Promise<boolean> {
    const proof = this._proofs().find(p => p.id === proofId);
    if (!proof) return false;

    this._proofs.update(list =>
      list.map(p => {
        if (p.id === proofId) {
          return {
            ...p,
            status: 'rejected' as PaymentProofStatus,
            admin_note: reason,
            reviewed_by: this.auth.profile()?.id || 'usr-admin-01',
            reviewed_at: new Date().toISOString()
          };
        }
        return p;
      })
    );
    this.saveProofs();

    // Send in-app notification to customer with rejection reason
    this.notifications.addNotification(
      'تنبيه بخصوص إثبات التحويل',
      `تم رفض إثبات التحويل للسبب التالي: "${reason}". يرجى رفع إيصال صحيح لتأكيد طلبك.`,
      proof.user_id
    );

    return true;
  }
}
