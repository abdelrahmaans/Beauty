import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { OrdersService } from '../../core/services/orders.service';
import { BookingsService } from '../../core/services/bookings.service';
import { ProvidersService } from '../../core/services/providers.service';
import { CentersService } from '../../core/services/centers.service';
import { ReferralsService } from '../../core/services/referrals.service';
import { BannersService } from '../../core/services/banners.service';
import { PaymentProofsService } from '../../core/services/payment-proofs.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, OrderStatus, Coupon, Booking, Provider, BookingStatus, RedemptionStatus, Banner, PaymentProof, Order } from '../../core/models';
import { MOCK_COUPONS } from '../../core/mock/mock-data';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  productsService = inject(ProductsService);
  ordersService = inject(OrdersService);
  bookingsService = inject(BookingsService);
  providersService = inject(ProvidersService);
  centersService = inject(CentersService);
  referralsService = inject(ReferralsService);
  bannersService = inject(BannersService);
  paymentProofsService = inject(PaymentProofsService);
  auth = inject(AuthService);
  Math = Math;

  // Active Tab: Defaults to Executive Overview
  activeTab: 'overview' | 'orders' | 'matching' | 'providers' | 'products' | 'centers_referrals' | 'banners' | 'payments' | 'coupons' = 'overview';

  // Mobile Drawer Sidebar State
  isMobileSidebarOpen: boolean = false;

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  setTab(tab: 'overview' | 'orders' | 'matching' | 'providers' | 'products' | 'centers_referrals' | 'banners' | 'payments' | 'coupons'): void {
    this.activeTab = tab;
    this.closeMobileSidebar();
  }

  // Filters & Search States
  productSearch: string = '';
  selectedCategoryFilter: string = 'all';
  orderFilter: 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' = 'all';
  sessionFilter: 'all' | 'requested' | 'in_progress' | 'completed' = 'all';
  providerFilter: 'all' | 'pending' | 'freelancer' | 'center' = 'all';

  couponsList: Coupon[] = MOCK_COUPONS;

  // Matching Queue Selection States
  selectedProviderId: Record<string, string> = {};
  offerPrices: Record<string, number> = {};

  // Payment Proofs Review State
  previewReceiptUrl: string | null = null;
  rejectingProof: PaymentProof | null = null;
  rejectReason: string = '';

  // Product Modal State
  isModalOpen: boolean = false;
  editingProduct: Product | null = null;
  formProduct: Partial<Product> = {
    name: '',
    brand: '',
    price: 0,
    discount_price: undefined,
    stock_quantity: 20,
    category_id: '11111111-1111-1111-1111-111111111101',
    main_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    description: '',
    is_active: true
  };

  // Banner Modal State
  isBannerModalOpen: boolean = false;
  editingBanner: Banner | null = null;
  formBanner: Partial<Banner> = {
    title: '',
    subtitle: '',
    type: 'coupon',
    coupon_id: MOCK_COUPONS[0]?.id,
    center_id: null,
    image_storage_path: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
    cta_text: 'تسوقي بالخصم الآن',
    cta_link: '/products',
    sort_order: 1,
    is_active: true
  };

  // Quick Inline Editing
  editingPriceProductId: string | null = null;
  inlinePriceValue: number = 0;

  // KPI Calculations
  getTotalSales(): number {
    return this.ordersService.orders().reduce((sum, o) => sum + o.total_price, 0);
  }

  getBookingsCommission(): number {
    const totalBookingsValue = this.bookingsService.bookings()
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.agreed_price || 0), 0);
    return Math.round(totalBookingsValue * 0.15);
  }

  getTotalPlatformRevenue(): number {
    return this.getBookingsCommission() + this.referralsService.totalReferralCommissions();
  }

  // To-Do / Action Items Counters
  getPendingActionsCount(): number {
    return this.paymentProofsService.pendingProofs().length +
           this.getPendingProvidersCount() +
           this.bookingsService.pendingRequests().length +
           this.getOrdersCountByStatus('pending');
  }

  // Orders Management
  getFilteredOrders(): Order[] {
    const list = this.ordersService.orders();
    if (this.orderFilter === 'all') return list;
    return list.filter(o => o.status === this.orderFilter);
  }

  getOrdersCountByStatus(status: OrderStatus): number {
    return this.ordersService.orders().filter(o => o.status === status).length;
  }

  getOrderStatusArabic(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      pending: 'طلب جديد (قيد الانتظار)',
      confirmed: 'تم التأكيد (جاري التجهيز)',
      shipped: 'في الطريق مع الشحن',
      delivered: 'تم التسليم بنجاح ✓',
      cancelled: 'ملغي ✗'
    };
    return map[status] || status;
  }

  async onUpdateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    await this.ordersService.updateOrderStatus(orderId, status);
  }

  // Products Management
  getAdminFilteredProducts(): Product[] {
    let list = this.productsService.products();

    if (this.selectedCategoryFilter !== 'all') {
      list = list.filter(p => p.category_id === this.selectedCategoryFilter || p.category?.slug === this.selectedCategoryFilter);
    }

    const q = this.productSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getProductOrderCount(productId: string): number {
    return this.ordersService.orders().reduce((count, o) => {
      const match = o.items?.find((i: any) => i.product_id === productId || i.product?.id === productId);
      return count + (match ? match.quantity : 1); // Estimated demand fallback
    }, 0);
  }

  startEditPrice(product: Product): void {
    this.editingPriceProductId = product.id;
    this.inlinePriceValue = product.discount_price ?? product.price;
  }

  async saveInlinePrice(product: Product): Promise<void> {
    if (this.inlinePriceValue > 0) {
      await this.productsService.saveProduct({
        ...product,
        price: product.price,
        discount_price: this.inlinePriceValue < product.price ? this.inlinePriceValue : undefined
      });
    }
    this.editingPriceProductId = null;
  }

  cancelEditPrice(): void {
    this.editingPriceProductId = null;
  }

  async quickUpdateStock(product: Product, delta: number): Promise<void> {
    const newStock = Math.max(0, product.stock_quantity + delta);
    await this.productsService.saveProduct({ ...product, stock_quantity: newStock });
  }

  async toggleProductActive(product: Product): Promise<void> {
    await this.productsService.saveProduct({ ...product, is_active: !product.is_active });
  }

  openNewProductModal(): void {
    this.editingProduct = null;
    this.formProduct = {
      name: '',
      brand: '',
      price: 0,
      discount_price: undefined,
      stock_quantity: 20,
      category_id: this.productsService.categories()[0]?.id || '11111111-1111-1111-1111-111111111101',
      main_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      description: '',
      is_active: true
    };
    this.isModalOpen = true;
  }

  openEditProductModal(product: Product): void {
    this.editingProduct = product;
    this.formProduct = { ...product };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  async saveProduct(): Promise<void> {
    if (!this.formProduct.name || !this.formProduct.price) return;
    await this.productsService.saveProduct(this.formProduct);
    this.closeModal();
  }

  async deleteProduct(id: string): Promise<void> {
    if (confirm('هل أنتِ متأكدة من حذف هذا المنتج من المتجر؟')) {
      await this.productsService.deleteProduct(id);
    }
  }

  // Sessions Matching Queue & Reviews
  getFilteredBookings(): Booking[] {
    const list = this.bookingsService.bookings();
    if (this.sessionFilter === 'all') return list;
    if (this.sessionFilter === 'requested') return list.filter(b => b.status === 'requested');
    if (this.sessionFilter === 'in_progress') return list.filter(b => b.status === 'confirmed' || b.status === 'in_progress' || b.status === 'offered');
    if (this.sessionFilter === 'completed') return list.filter(b => b.status === 'completed');
    return list;
  }

  getCandidateProviders(serviceType: string, area: string): (Provider & { isSpecialtyMatch?: boolean; basePrice?: number })[] {
    return this.providersService.suggestProviders(serviceType, area, 35);
  }

  selectCandidate(bookingId: string, providerId: string, defaultPrice: number): void {
    this.selectedProviderId[bookingId] = providerId;
    if (!this.offerPrices[bookingId]) {
      this.offerPrices[bookingId] = defaultPrice;
    }
  }

  async confirmAndDispatchOffer(bookingId: string): Promise<void> {
    const candidates = this.providersService.providers().filter(p => p.status === 'verified' || p.status === 'trusted');
    const provId = this.selectedProviderId[bookingId] || candidates[0]?.id;
    const finalPrice = this.offerPrices[bookingId] || 1150;

    if (provId) {
      await this.bookingsService.confirmBookingOffer(bookingId, provId, finalPrice);
    }
  }

  async onUpdateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    await this.bookingsService.updateBookingStatus(bookingId, status);
  }

  getBookingStatusArabic(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      requested: 'طلب جديد (يحتاج ترشيح أخصائية)',
      offered: 'تم إرسال العرض للعميلة',
      confirmed: 'مؤكد ومدفوع ✓',
      in_progress: 'الجلسة جارية الآن',
      completed: 'مكتملة ومقيمة ★',
      cancelled: 'ملغية ✗',
      reported: 'بلاغ قيد المراجعة'
    };
    return map[status] || status;
  }

  // Providers Verification & Status
  getPendingProvidersCount(): number {
    return this.providersService.providers().filter(p => p.status === 'pending').length;
  }

  getFilteredProviders(): Provider[] {
    let list = this.providersService.providers();
    if (this.providerFilter === 'pending') {
      return list.filter(p => p.status === 'pending');
    }
    if (this.providerFilter === 'freelancer') {
      return list.filter(p => p.type === 'freelancer');
    }
    if (this.providerFilter === 'center') {
      return list.filter(p => p.type === 'center');
    }
    return list;
  }

  getProviderStatusArabic(status: string): string {
    const map: Record<string, string> = {
      pending: 'طلب جديد (قيد المراجعة والتوثيق)',
      verified: 'معتمد ونشط ✓',
      trusted: 'موثوق مميز ★',
      suspended: 'موقوف مؤقتاً'
    };
    return map[status] || status;
  }

  async approveProvider(providerId: string): Promise<void> {
    await this.providersService.updateProviderStatus(providerId, 'verified');
    await this.providersService.loadProviders();
    await this.centersService.loadCenters();
  }

  async rejectProvider(providerId: string): Promise<void> {
    if (confirm('هل أنتِ متأكدة من إيقاف أو رفض هذا الشريك؟')) {
      await this.providersService.updateProviderStatus(providerId, 'suspended');
      await this.providersService.loadProviders();
      await this.centersService.loadCenters();
    }
  }

  async updateProviderStatus(providerId: string, status: any): Promise<void> {
    await this.providersService.updateProviderStatus(providerId, status);
    await this.providersService.loadProviders();
    await this.centersService.loadCenters();
  }

  // Partner Centers & Referrals
  async markPaidOut(redemptionId: string): Promise<void> {
    await this.referralsService.markAsPaidOut(redemptionId);
  }

  getRedemptionStatusArabic(status: RedemptionStatus): string {
    const map: Record<RedemptionStatus, string> = {
      claimed: 'كود ساري (بانتظار تأكيد المركز)',
      confirmed_by_center: 'مؤكد من المركز ✓ (مستحق التحصيل)',
      paid_out: 'تم التحصيل والتسوية ✓',
      rejected: 'مرفوض'
    };
    return map[status] || status;
  }

  // Banners Management
  openNewBannerModal(): void {
    this.editingBanner = null;
    this.formBanner = {
      title: '',
      subtitle: '',
      type: 'coupon',
      coupon_id: this.couponsList[0]?.id,
      center_id: this.centersService.centers()[0]?.id || null,
      image_storage_path: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
      cta_text: 'تسوقي بالخصم الآن',
      cta_link: '/products',
      sort_order: this.bannersService.banners().length + 1,
      is_active: true
    };
    this.isBannerModalOpen = true;
  }

  openEditBannerModal(banner: Banner): void {
    this.editingBanner = banner;
    this.formBanner = { ...banner };
    this.isBannerModalOpen = true;
  }

  closeBannerModal(): void {
    this.isBannerModalOpen = false;
  }

  onBannerTypeChange(): void {
    if (this.formBanner.type === 'center') {
      const firstCenter = this.centersService.centers()[0];
      if (firstCenter) {
        this.formBanner.center_id = firstCenter.id;
        this.formBanner.cta_link = `/centers/${firstCenter.id}`;
        this.formBanner.cta_text = 'احجزي بالصالون بالخصم';
      }
    } else if (this.formBanner.type === 'coupon') {
      this.formBanner.cta_link = '/products';
      this.formBanner.cta_text = 'تسوقي بالخصم الآن';
    } else {
      this.formBanner.cta_link = '/booking/request';
      this.formBanner.cta_text = 'استكشفي الجلسات';
    }
  }

  onBannerCenterSelect(centerId: string): void {
    this.formBanner.center_id = centerId;
    this.formBanner.cta_link = `/centers/${centerId}`;
  }

  async saveBanner(): Promise<void> {
    if (!this.formBanner.title || !this.formBanner.image_storage_path) return;

    if (this.editingBanner) {
      await this.bannersService.updateBanner(this.editingBanner.id, this.formBanner);
    } else {
      await this.bannersService.createBanner(this.formBanner);
    }
    this.closeBannerModal();
  }

  async deleteBanner(id: string): Promise<void> {
    if (confirm('هل أنتِ متأكدة من حذف هذا البانر الترويجي؟')) {
      await this.bannersService.deleteBanner(id);
    }
  }

  getBannerCenterName(centerId?: string | null): string {
    if (!centerId) return '—';
    return this.centersService.getCenterById(centerId)?.display_name || 'مركز شريك';
  }

  // Payment Proofs Review
  openPreviewReceipt(url: string): void {
    this.previewReceiptUrl = url;
  }

  closePreviewReceipt(): void {
    this.previewReceiptUrl = null;
  }

  openRejectModal(proof: PaymentProof): void {
    this.rejectingProof = proof;
    this.rejectReason = '';
  }

  closeRejectModal(): void {
    this.rejectingProof = null;
    this.rejectReason = '';
  }

  async confirmReject(): Promise<void> {
    if (!this.rejectingProof || !this.rejectReason.trim()) return;
    await this.paymentProofsService.rejectProof(this.rejectingProof.id, this.rejectReason);
    this.closeRejectModal();
  }

  async approvePayment(proofId: string): Promise<void> {
    await this.paymentProofsService.approveProof(proofId);
  }

  getProofStatusArabic(status: string): string {
    const map: Record<string, string> = {
      pending_review: 'بانتظار المراجعة والتدقيق',
      approved: 'تم الاعتماد والتأكيد ✓',
      rejected: 'تم الرفض ✗'
    };
    return map[status] || status;
  }

  getChannelLabel(channel: string): string {
    const map: Record<string, string> = {
      instapay: 'انستاباي (InstaPay)',
      vodafone_cash: 'فودافون كاش',
      bank_transfer: 'تحويل بنكي (CIB)',
      other: 'أخرى'
    };
    return map[channel] || channel;
  }
}
