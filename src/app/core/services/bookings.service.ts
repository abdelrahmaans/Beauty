import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { NotificationsService } from './notifications.service';
import { ProvidersService } from './providers.service';
import { Booking, BookingStatus, BookingReview, BookingReport, Commission } from '../models';
import { MOCK_BOOKINGS } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  private _bookings = signal<Booking[]>([]);
  private _commissions = signal<Commission[]>([]);
  private _reports = signal<BookingReport[]>([]);
  private _isLoading = signal<boolean>(false);

  readonly bookings = this._bookings.asReadonly();
  readonly commissions = this._commissions.asReadonly();
  readonly reports = this._reports.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Customer specific bookings
  readonly myCustomerBookings = computed(() => {
    const userProfile = this.auth.profile();
    if (!userProfile) return [];
    return this._bookings().filter(b => b.user_id === userProfile.id || b.customer_phone === userProfile.phone);
  });

  // Specialist / Provider specific bookings
  readonly myProviderBookings = computed(() => {
    const userProfile = this.auth.profile();
    const currentProvider = this.providersService.currentProvider();
    if (!userProfile && !currentProvider) return [];

    const provId = currentProvider?.id;
    return this._bookings().filter(b => b.provider_id === provId || (b.provider && b.provider.user_id === userProfile?.id));
  });

  // Admin Queue: New incoming booking requests
  readonly pendingRequests = computed(() => {
    return this._bookings().filter(b => b.status === 'requested');
  });

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService,
    private notifications: NotificationsService,
    private providersService: ProvidersService
  ) {
    this.loadBookings();
  }

  async loadBookings(): Promise<void> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data, error } = await client
          .from('bookings')
          .select('*, provider:providers(*), review:booking_reviews(*), report:booking_reports(*)');

        if (data && !error && data.length > 0) {
          this._bookings.set(data as Booking[]);
        } else {
          this._bookings.set(MOCK_BOOKINGS);
        }
      } catch {
        this._bookings.set(MOCK_BOOKINGS);
      }
    } else {
      const saved = localStorage.getItem('beauty_bookings');
      if (saved) {
        try {
          this._bookings.set(JSON.parse(saved));
        } catch {
          this._bookings.set(MOCK_BOOKINGS);
        }
      } else {
        this._bookings.set(MOCK_BOOKINGS);
      }
    }
    this._isLoading.set(false);
  }

  private saveBookings(): void {
    localStorage.setItem('beauty_bookings', JSON.stringify(this._bookings()));
  }

  getBookingById(id: string): Booking | undefined {
    return this._bookings().find(b => b.id === id);
  }

  // 1. Customer creates a new home care booking request
  async createBookingRequest(payload: {
    serviceType: string;
    requestedArea: string;
    scheduledAt: string;
    notes?: string;
    customerName: string;
    customerPhone: string;
  }): Promise<{ success: boolean; bookingId?: string; error?: string }> {
    this._isLoading.set(true);
    const userProfile = this.auth.profile();
    const newBookingId = 'bok-' + Math.floor(100 + Math.random() * 900);

    const newBooking: Booking = {
      id: newBookingId,
      user_id: userProfile?.id || ('usr-cust-' + Date.now()),
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      provider_id: null,
      service_type: payload.serviceType,
      status: 'requested',
      requested_area: payload.requestedArea,
      scheduled_at: payload.scheduledAt,
      agreed_price: null,
      payment_status: 'unpaid',
      notes: payload.notes || '',
      created_at: new Date().toISOString()
    };

    const client = this.supabase.client;
    if (client) {
      try {
        await client.from('bookings').insert([newBooking]);
      } catch (e) {
        console.warn('Fallback to local storage for booking request:', e);
      }
    }

    this._bookings.update(list => [newBooking, ...list]);
    this.saveBookings();

    // Notify admin
    this.notifications.addNotification(
      'طلب جلسة منزلية جديد!',
      `تم استلام طلب جديد لـ (${payload.serviceType}) في (${payload.requestedArea}) يتطلب مراجعة وترشيح أخصائية.`,
      'usr-admin-01',
      newBookingId
    );

    this._isLoading.set(false);
    return { success: true, bookingId: newBookingId };
  }

  // 2. Admin reviews candidates and sends confirmed offer to customer
  async confirmBookingOffer(bookingId: string, providerId: string, finalPrice: number): Promise<boolean> {
    const provider = this.providersService.getProviderById(providerId);
    if (!provider) return false;

    this._bookings.update(list =>
      list.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            provider_id: providerId,
            provider,
            agreed_price: finalPrice,
            status: 'offered' as BookingStatus,
            updated_at: new Date().toISOString()
          };
        }
        return b;
      })
    );
    this.saveBookings();

    const booking = this.getBookingById(bookingId);
    if (booking) {
      // Send in-app notification to customer
      this.notifications.addNotification(
        'عرض الجلسة المنزلية جاهز!',
        `تم ترشيح الأخصائية (${provider.display_name}) لجلسة (${booking.service_type}) بسعر ${finalPrice} ج.م. اضغطي لمراجعة العرض وتأكيد الحجز.`,
        booking.user_id,
        bookingId
      );
    }

    return true;
  }

  // 3. Customer accepts offer and pays online
  async acceptBookingOffer(bookingId: string): Promise<boolean> {
    this._bookings.update(list =>
      list.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status: 'confirmed' as BookingStatus,
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          };
        }
        return b;
      })
    );
    this.saveBookings();

    const booking = this.getBookingById(bookingId);
    if (booking && booking.provider) {
      // Notify Specialist
      this.notifications.addNotification(
        'تم تأكيد جلسة جديدة لك!',
        `تم تأكيد حجز جلسة (${booking.service_type}) مع العميلة (${booking.customer_name}) بتاريخ ${new Date(booking.scheduled_at || '').toLocaleDateString('ar-EG')}.`,
        booking.provider.user_id,
        bookingId
      );
    }

    return true;
  }

  // 4. Specialist or Admin updates booking progress status
  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<boolean> {
    this._bookings.update(list =>
      list.map(b => {
        if (b.id === bookingId) {
          return {
            ...b,
            status,
            updated_at: new Date().toISOString()
          };
        }
        return b;
      })
    );
    this.saveBookings();

    const booking = this.getBookingById(bookingId);

    // If completed: record commission & award loyalty points
    if (status === 'completed' && booking && booking.agreed_price) {
      const commissionRate = 15; // 15% standard commission
      const commissionAmount = Math.round((booking.agreed_price * commissionRate) / 100);

      const commissionRecord: Commission = {
        id: 'com-' + Date.now(),
        booking_id: bookingId,
        session_value: booking.agreed_price,
        commission_rate: commissionRate,
        commission_amount: commissionAmount,
        payout_status: 'pending',
        created_at: new Date().toISOString()
      };

      this._commissions.update(c => [commissionRecord, ...c]);

      // Award loyalty points to customer (1 point per 10 EGP)
      const earnedPoints = Math.floor(booking.agreed_price / 10);
      const userProfile = this.auth.profile();
      if (userProfile) {
        this.auth.updateProfileData({
          loyalty_points: (userProfile.loyalty_points || 0) + earnedPoints
        });
      }

      // Notify customer to rate session
      this.notifications.addNotification(
        'اكتملت جلستكِ بنجاح!',
        `نتمنى أن تكون جلسة العناية قد نالت إعجابكِ! تم إضافة ${earnedPoints} نقطة ولاء لمحفظتك، شاركينا تقييمك للأخصائية.`,
        booking.user_id,
        bookingId
      );
    }

    return true;
  }

  // 5. Submit Session Review
  async submitReview(bookingId: string, rating: number, comment: string): Promise<boolean> {
    const booking = this.getBookingById(bookingId);
    if (!booking || !booking.provider_id) return false;

    const review: BookingReview = {
      id: 'rev-b-' + Date.now(),
      booking_id: bookingId,
      user_id: booking.user_id,
      provider_id: booking.provider_id,
      rating,
      comment,
      created_at: new Date().toISOString()
    };

    this._bookings.update(list =>
      list.map(b => (b.id === bookingId ? { ...b, review } : b))
    );
    this.saveBookings();
    return true;
  }

  // 6. Report Issue to Admin
  async submitReport(bookingId: string, description: string): Promise<boolean> {
    const booking = this.getBookingById(bookingId);
    if (!booking) return false;

    const report: BookingReport = {
      id: 'rep-' + Date.now(),
      booking_id: bookingId,
      reported_by: booking.user_id,
      description,
      status: 'open',
      created_at: new Date().toISOString()
    };

    this._reports.update(r => [report, ...r]);
    this._bookings.update(list =>
      list.map(b => (b.id === bookingId ? { ...b, status: 'reported' as BookingStatus, report } : b))
    );
    this.saveBookings();

    // Alert Admin
    this.notifications.addNotification(
      'بلاغ عاجل بخصوص جلسة منزلية!',
      `تم استلام بلاغ من العميلة بخصوص الحجز #${bookingId}: "${description}"`,
      'usr-admin-01',
      bookingId
    );

    return true;
  }
}
