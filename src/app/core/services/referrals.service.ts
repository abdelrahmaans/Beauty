import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { NotificationsService } from './notifications.service';
import { CentersService } from './centers.service';
import { ReferralRedemption, RedemptionStatus } from '../models';
import { MOCK_REFERRAL_REDEMPTIONS } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class ReferralsService {
  private _redemptions = signal<ReferralRedemption[]>([]);
  private _isLoading = signal<boolean>(false);

  readonly redemptions = this._redemptions.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Customer's claimed referral codes
  readonly myClaimedCodes = computed(() => {
    const userProfile = this.auth.profile();
    if (!userProfile) return [];
    return this._redemptions().filter(r => r.user_id === userProfile.id || r.user_id === 'usr-cust-01');
  });

  // Partner Center's incoming redemptions
  readonly myCenterRedemptions = computed(() => {
    const currentCenter = this.centersService.currentCenter();
    if (!currentCenter) return [];
    return this._redemptions().filter(r => r.provider_id === currentCenter.id);
  });

  // Admin: Total confirmed referral commissions
  readonly totalReferralCommissions = computed(() => {
    return this._redemptions()
      .filter(r => r.status === 'confirmed_by_center' || r.status === 'paid_out')
      .reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  });

  // Admin: Long pending claimed codes (audit alert)
  readonly pendingAuditAlerts = computed(() => {
    return this._redemptions().filter(r => r.status === 'claimed');
  });

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService,
    private notifications: NotificationsService,
    private centersService: CentersService
  ) {
    this.loadRedemptions();
  }

  async loadRedemptions(): Promise<void> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data, error } = await client
          .from('referral_redemptions')
          .select('*, referral_code:referral_codes(*), provider:providers(*), user:profiles(*)');

        if (data && !error && data.length > 0) {
          this._redemptions.set(data as ReferralRedemption[]);
        } else {
          this._redemptions.set(MOCK_REFERRAL_REDEMPTIONS);
        }
      } catch {
        this._redemptions.set(MOCK_REFERRAL_REDEMPTIONS);
      }
    } else {
      const saved = localStorage.getItem('beauty_referral_redemptions');
      if (saved) {
        try {
          this._redemptions.set(JSON.parse(saved));
        } catch {
          this._redemptions.set(MOCK_REFERRAL_REDEMPTIONS);
        }
      } else {
        this._redemptions.set(MOCK_REFERRAL_REDEMPTIONS);
      }
    }
    this._isLoading.set(false);
  }

  private saveRedemptions(): void {
    localStorage.setItem('beauty_referral_redemptions', JSON.stringify(this._redemptions()));
  }

  // 1. Customer claims an exclusive referral code for a partner center
  async claimReferralCode(centerId: string, notes?: string): Promise<{ success: boolean; redemption?: ReferralRedemption; error?: string }> {
    this._isLoading.set(true);
    const userProfile = this.auth.profile();
    const center = this.centersService.getCenterById(centerId);

    if (!center || !center.referral_code) {
      this._isLoading.set(false);
      return { success: false, error: 'كود الإحالة غير متوفر لهذا المركز حالياً' };
    }

    const newRedemption: ReferralRedemption = {
      id: 'rdm-' + Date.now(),
      referral_code_id: center.referral_code.id,
      referral_code: center.referral_code,
      user_id: userProfile?.id || ('usr-cust-' + Date.now()),
      user: userProfile || undefined,
      provider_id: centerId,
      provider: center,
      status: 'claimed',
      notes: notes || 'كود خصم حصري من منصة بيوتي للاستخدام في المركز',
      claimed_at: new Date().toISOString()
    };

    const client = this.supabase.client;
    if (client) {
      try {
        await client.from('referral_redemptions').insert([newRedemption]);
      } catch (err) {
        console.warn('Fallback to local storage for referral redemption:', err);
      }
    }

    this._redemptions.update(list => [newRedemption, ...list]);
    this.saveRedemptions();

    // In-app Notification for customer
    this.notifications.addNotification(
      'تم إصدار كود الخصم الحصري!',
      `كود الخصم الخاص بكِ في (${center.display_name}) هو: ${center.referral_code.code} (${center.referral_code.discount_description}). أظهري الكود عند زيارة المركز.`,
      userProfile?.id || 'usr-cust-01'
    );

    this._isLoading.set(false);
    return { success: true, redemption: newRedemption };
  }

  // 2. Partner Center confirms customer redemption and inputs service invoice value
  async confirmRedemption(redemptionId: string, estimatedValue: number): Promise<boolean> {
    const target = this._redemptions().find(r => r.id === redemptionId);
    if (!target) return false;

    const rate = target.referral_code?.commission_rate || 10;
    const commissionAmount = Math.round(estimatedValue * (rate / 100));

    this._redemptions.update(list =>
      list.map(r => {
        if (r.id === redemptionId) {
          return {
            ...r,
            status: 'confirmed_by_center' as RedemptionStatus,
            estimated_value: estimatedValue,
            commission_amount: commissionAmount,
            confirmed_at: new Date().toISOString()
          };
        }
        return r;
      })
    );
    this.saveRedemptions();

    // Award loyalty points to customer (1 point per 20 EGP of center service)
    const earnedPoints = Math.floor(estimatedValue / 20);
    const userProfile = this.auth.profile();
    if (userProfile && target.user_id === userProfile.id) {
      this.auth.updateProfileData({
        loyalty_points: (userProfile.loyalty_points || 0) + earnedPoints
      });
    }

    return true;
  }

  // 3. Partner Center rejects redemption (e.g. customer no-show)
  async rejectRedemption(redemptionId: string, reason?: string): Promise<boolean> {
    this._redemptions.update(list =>
      list.map(r => {
        if (r.id === redemptionId) {
          return {
            ...r,
            status: 'rejected' as RedemptionStatus,
            notes: reason || 'تم الرفض لعدم حضور العميل أو عدم استخدام الكود',
            confirmed_at: new Date().toISOString()
          };
        }
        return r;
      })
    );
    this.saveRedemptions();
    return true;
  }

  // 4. Admin payout confirmation
  async markAsPaidOut(redemptionId: string): Promise<boolean> {
    this._redemptions.update(list =>
      list.map(r => (r.id === redemptionId ? { ...r, status: 'paid_out' as RedemptionStatus } : r))
    );
    this.saveRedemptions();
    return true;
  }
}
