import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProvidersService } from '../../core/services/providers.service';
import { BookingsService } from '../../core/services/bookings.service';
import { AuthService } from '../../core/services/auth.service';
import { Booking, BookingStatus } from '../../core/models';

@Component({
  selector: 'app-provider-portal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './provider-portal.component.html',
  styleUrl: './provider-portal.component.css'
})
export class ProviderPortalComponent {
  providersService = inject(ProvidersService);
  bookingsService = inject(BookingsService);
  auth = inject(AuthService);

  activeTab: 'overview' | 'bookings' | 'earnings' | 'reviews' | 'profile' = 'overview';
  bookingFilter: 'all' | 'confirmed' | 'in_progress' | 'completed' = 'all';
  Math = Math;

  // Mobile Drawer Sidebar State
  isMobileSidebarOpen: boolean = false;

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  setTab(tab: 'overview' | 'bookings' | 'earnings' | 'reviews' | 'profile'): void {
    this.activeTab = tab;
    this.closeMobileSidebar();
  }

  isAvailable: boolean = true;
  isPayoutModalOpen: boolean = false;
  payoutAmount: number = 0;
  payoutChannel: string = 'instapay';
  payoutTarget: string = '';

  onboardName: string = this.providersService.currentProvider()?.display_name || this.auth.profile()?.full_name || '';
  onboardPhone: string = this.providersService.currentProvider()?.phone || this.auth.profile()?.phone || '';
  onboardCity: string = this.providersService.currentProvider()?.city || 'التجمع الخامس والقاهرة الجديدة';
  onboardBio: string = this.providersService.currentProvider()?.bio || 'أخصائية معتمدة بخبرة 7 سنوات في علاجات وترميم الشعر بأحدث التقنيات البرازيلية ومواد الأرجان الأصلية.';
  hasNationalId: boolean = true;
  hasCert: boolean = true;
  isOnboardSaved: boolean = false;

  toggleAvailability(): void {
    this.isAvailable = !this.isAvailable;
  }

  getFilteredBookings(): Booking[] {
    const list = this.bookingsService.myProviderBookings();
    if (this.bookingFilter === 'all') return list;
    if (this.bookingFilter === 'confirmed') return list.filter(b => b.status === 'confirmed');
    if (this.bookingFilter === 'in_progress') return list.filter(b => b.status === 'in_progress');
    if (this.bookingFilter === 'completed') return list.filter(b => b.status === 'completed');
    return list;
  }

  getUpcomingBookings(): Booking[] {
    return this.bookingsService.myProviderBookings().filter(b => b.status === 'confirmed' || b.status === 'in_progress');
  }

  getUpcomingBookingsCount(): number {
    return this.getUpcomingBookings().length;
  }

  getCompletedBookingsCount(): number {
    return this.bookingsService.myProviderBookings().filter(b => b.status === 'completed').length;
  }

  getStatusBadge(status?: string): string {
    if (status === 'trusted') return 'أخصائية موثوقة ونخبة ★';
    if (status === 'verified') return 'أخصائية موثقة بالهوية ✓';
    return 'قيد مراجعة التوثيق';
  }

  getStatusArabic(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      requested: 'طلب جديد',
      offered: 'تم إرسال العرض للعميلة',
      confirmed: 'حجز مؤكد ومدفوع',
      in_progress: 'الجلسة جارية الآن',
      completed: 'مكتملة ومحسوبة ✓',
      cancelled: 'ملغية',
      reported: 'بلاغ قيد المراجعة'
    };
    return map[status] || status;
  }

  getTotalSessionValue(): number {
    return this.bookingsService.myProviderBookings().reduce((sum, b) => sum + (b.agreed_price || 0), 0);
  }

  getNetEarnings(): number {
    const total = this.getTotalSessionValue();
    return total - Math.round(total * 0.15);
  }

  async updateStatus(bookingId: string, status: BookingStatus): Promise<void> {
    await this.bookingsService.updateBookingStatus(bookingId, status);
  }

  openPayoutModal(): void {
    this.payoutAmount = this.getNetEarnings();
    this.isPayoutModalOpen = true;
  }

  closePayoutModal(): void {
    this.isPayoutModalOpen = false;
  }

  submitPayout(): void {
    if (!this.payoutAmount || !this.payoutTarget) {
      alert('يرجى تحديد المبلغ وبيانات المحفظة/الحساب');
      return;
    }
    alert(`تم تسجيل طلب سحب مبلغ ${this.payoutAmount} ج.م بنجاح عبر (${this.payoutChannel}) وسيتم التحويل خلال ساعتين.`);
    this.closePayoutModal();
  }

  getBookingCode(id: string): string {
    if (!id) return '';
    return id.replace(/-/g, '').slice(0, 8).toUpperCase();
  }

  async saveOnboarding(): Promise<void> {
    await this.providersService.registerProvider({
      displayName: this.onboardName,
      phone: this.onboardPhone,
      city: this.onboardCity,
      specialties: ['جلسة بروتين وكولاجين وترميم الشعر الفاخر', 'جلسة هيدرافيشال ونضارة البشرة الزجاجية'],
      bio: this.onboardBio,
      nationalIdFile: this.hasNationalId ? 'docs/national_id.pdf' : undefined,
      certificateFile: this.hasCert ? 'docs/cert.pdf' : undefined
    });
    this.isOnboardSaved = true;
    setTimeout(() => (this.isOnboardSaved = false), 3000);
  }
}
