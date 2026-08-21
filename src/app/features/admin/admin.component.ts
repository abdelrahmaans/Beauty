import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { OrdersService } from '../../core/services/orders.service';
import { BookingsService } from '../../core/services/bookings.service';
import { ProvidersService } from '../../core/services/providers.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, OrderStatus, Coupon, Booking, Provider, BookingStatus } from '../../core/models';
import { MOCK_COUPONS } from '../../core/mock/mock-data';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="admin-dashboard">
      <div class="container-custom">
        <!-- Admin Top Bar -->
        <div class="admin-topbar">
          <div>
            <span class="badge-luxury">لوحة إدارة المتجر وسوق الجلسات المنزلية</span>
            <h1 class="admin-title">نظام التحكم والعمليات المركزي</h1>
          </div>
          <div class="admin-actions">
            <button (click)="openNewProductModal()" class="btn-primary">
              <i class="fa-solid fa-plus"></i> إضافة منتج جديد
            </button>
          </div>
        </div>

        <!-- KPI Metrics Grid -->
        <div class="metrics-grid">
          <div class="metric-card beauty-card">
            <div class="metric-icon money"><i class="fa-solid fa-sack-dollar"></i></div>
            <div class="metric-info">
              <span class="metric-label">إجمالي المبيعات (المتجر)</span>
              <strong class="metric-val">{{ getTotalSales() }} <small>ج.م</small></strong>
              <span class="metric-sub text-success"><i class="fa-solid fa-arrow-trend-up"></i> طلبات المتجر</span>
            </div>
          </div>

          <div class="metric-card beauty-card">
            <div class="metric-icon orders"><i class="fa-solid fa-spa"></i></div>
            <div class="metric-info">
              <span class="metric-label">طلبات الجلسات المنزلية</span>
              <strong class="metric-val">{{ bookingsService.bookings().length }}</strong>
              <span class="metric-sub text-warning">{{ bookingsService.pendingRequests().length }} طلبات جديدة تحتاج ترشيح</span>
            </div>
          </div>

          <div class="metric-card beauty-card">
            <div class="metric-icon products"><i class="fa-solid fa-user-check"></i></div>
            <div class="metric-info">
              <span class="metric-label">الأخصائيات المعتمدات</span>
              <strong class="metric-val">{{ providersService.providers().length }}</strong>
              <span class="metric-sub text-success">تغطية القاهرة، الجيزة وبني سويف</span>
            </div>
          </div>

          <div class="metric-card beauty-card">
            <div class="metric-icon users"><i class="fa-solid fa-percent"></i></div>
            <div class="metric-info">
              <span class="metric-label">عمولات المنصة من الحجوزات</span>
              <strong class="metric-val">{{ getBookingsCommission() }} <small>ج.م</small></strong>
              <span class="metric-sub">نسبة 15% من كل جلسة مكتملة</span>
            </div>
          </div>
        </div>

        <!-- Dashboard Navigation Tabs -->
        <div class="dashboard-tabs">
          <button
            class="tab-btn active-highlight"
            [class.active]="activeTab === 'matching'"
            (click)="activeTab = 'matching'"
          >
            <i class="fa-solid fa-wand-magic-sparkles"></i> طابور ترشيح ومطابقة الجلسات ({{ bookingsService.pendingRequests().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'providers'"
            (click)="activeTab = 'providers'"
          >
            <i class="fa-solid fa-id-card-clip"></i> توثيق الأخصائيات ({{ providersService.providers().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'products'"
            (click)="activeTab = 'products'"
          >
            <i class="fa-solid fa-tags"></i> إدارة المنتجات ({{ productsService.products().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'orders'"
            (click)="activeTab = 'orders'"
          >
            <i class="fa-solid fa-truck-ramp-box"></i> طلبات المتجر ({{ ordersService.orders().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'coupons'"
            (click)="activeTab = 'coupons'"
          >
            <i class="fa-solid fa-ticket"></i> الكوبونات
          </button>
        </div>

        <!-- Tab 1: Live Bookings Matching & Dispatching Queue -->
        <div class="tab-panel beauty-card" *ngIf="activeTab === 'matching'">
          <div class="panel-header">
            <div>
              <span class="badge-emerald">خوارزمية الترشيح الجغرافي الذكي</span>
              <h3 class="mt-1">طابور طلبات الجلسات المنزلية والمطابقة</h3>
            </div>
          </div>

          <div class="empty-state" *ngIf="bookingsService.bookings().length === 0">
            <i class="fa-solid fa-calendar-check empty-icon"></i>
            <h4>لا توجد طلبات جلسات منزلية حالياً</h4>
          </div>

          <div class="matching-queue-list" *ngIf="bookingsService.bookings().length > 0">
            <div
              class="queue-booking-item"
              *ngFor="let bk of bookingsService.bookings()"
              [class.highlight-pending]="bk.status === 'requested'"
            >
              <!-- Request Header Info -->
              <div class="q-top">
                <div class="q-client-box">
                  <span class="q-id">طلب #{{ bk.id }}</span>
                  <h4 class="q-srv">{{ bk.service_type }}</h4>
                  <div class="q-meta">
                    <span><i class="fa-solid fa-user"></i> {{ bk.customer_name }}</span>
                    <span><i class="fa-solid fa-phone"></i> {{ bk.customer_phone }}</span>
                    <span><i class="fa-solid fa-location-dot"></i> {{ bk.requested_area }}</span>
                    <span><i class="fa-regular fa-clock"></i> {{ bk.scheduled_at | date:'medium' }}</span>
                  </div>
                  <p class="q-notes" *ngIf="bk.notes">
                    <i class="fa-regular fa-message"></i> ملاحظات العميلة: "{{ bk.notes }}"
                  </p>
                </div>

                <div class="q-status-box">
                  <span class="status-pill" [ngClass]="'status-' + bk.status">
                    {{ getBookingStatusArabic(bk.status) }}
                  </span>
                  <div class="q-price" *ngIf="bk.agreed_price">
                    السعر المعتمد: <strong>{{ bk.agreed_price }} ج.م</strong>
                  </div>
                </div>
              </div>

              <!-- Matching / Provider Recommendation Engine (For requested status) -->
              <div class="matching-engine-box" *ngIf="bk.status === 'requested'">
                <div class="engine-header">
                  <i class="fa-solid fa-wand-magic-sparkles"></i>
                  <strong>ترشيح النظام التلقائي (حسب التخصص والقرب الجغرافي والتقييم):</strong>
                </div>

                <div class="candidates-cards-grid">
                  <div
                    class="candidate-card"
                    *ngFor="let cand of getCandidateProviders(bk.service_type, bk.requested_area); let idx = index"
                    [class.selected]="selectedProviderId[bk.id] === cand.id || (!selectedProviderId[bk.id] && idx === 0)"
                    (click)="selectCandidate(bk.id, cand.id, cand.basePrice || 1150)"
                  >
                    <div class="c-rank-badge">المرشحة #{{ idx + 1 }} {{ idx === 0 ? '(الأفضل مطابقة)' : '' }}</div>
                    <div class="c-profile">
                      <img [src]="cand.avatar_url" class="c-avatar" />
                      <div>
                        <strong>{{ cand.display_name }}</strong>
                        <span class="c-rating">★ {{ cand.rating_avg }} ({{ cand.rating_count }} جلسة)</span>
                        <span class="c-dist"><i class="fa-solid fa-map-pin"></i> المسافة التقديرية: {{ cand.distance_km }} كم</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Admin Action confirmation bar -->
                <div class="admin-offer-confirm-bar">
                  <div class="price-input-box">
                    <label>السعر النهائي للجلسة (ج.م):</label>
                    <input
                      type="number"
                      [ngModel]="offerPrices[bk.id] || 1150"
                      (ngModelChange)="offerPrices[bk.id] = $event"
                      class="input-custom price-input"
                    />
                  </div>

                  <button
                    (click)="confirmAndDispatchOffer(bk.id)"
                    class="btn-primary dispatch-btn"
                  >
                    <i class="fa-solid fa-paper-plane"></i> اعتماد وترشيح الأخصائية وإرسال العرض للعميلة
                  </button>
                </div>
              </div>

              <!-- Current Assigned Provider Preview if already offered or confirmed -->
              <div class="assigned-provider-bar" *ngIf="bk.provider && bk.status !== 'requested'">
                <div class="ap-info">
                  <img [src]="bk.provider.avatar_url" class="ap-avatar" />
                  <div>
                    <span class="ap-lbl">الأخصائية المسندة:</span>
                    <strong>{{ bk.provider.display_name }}</strong> (★ {{ bk.provider.rating_avg }})
                  </div>
                </div>
                <div class="admin-quick-status">
                  <label>تحديث الحالة:</label>
                  <select
                    [ngModel]="bk.status"
                    (ngModelChange)="onUpdateBookingStatus(bk.id, $event)"
                    class="status-select"
                  >
                    <option value="offered">تم إرسال العرض</option>
                    <option value="confirmed">تم التأكيد والدفع</option>
                    <option value="in_progress">الجلسة جارية</option>
                    <option value="completed">مكتملة</option>
                    <option value="cancelled">ملغية</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 2: Provider Verification & Documents -->
        <div class="tab-panel beauty-card" *ngIf="activeTab === 'providers'">
          <div class="panel-header">
            <h3>سجل الأخصائيات ومراجعة وثائق التوثيق</h3>
          </div>

          <div class="providers-admin-grid">
            <div class="provider-admin-card" *ngFor="let p of providersService.providers()">
              <div class="pa-header">
                <img [src]="p.avatar_url" class="pa-avatar" />
                <div>
                  <span class="badge-pill" [ngClass]="p.status">{{ p.status }}</span>
                  <h4 class="pa-name">{{ p.display_name }}</h4>
                  <span class="pa-city"><i class="fa-solid fa-location-dot"></i> {{ p.city }}</span>
                </div>
              </div>

              <div class="pa-specialties">
                <span class="sp-chip" *ngFor="let s of p.specialties">{{ s }}</span>
              </div>

              <div class="pa-docs" *ngIf="p.documents && p.documents.length > 0">
                <span class="docs-lbl">مستندات التوثيق:</span>
                <div class="doc-item" *ngFor="let d of p.documents">
                  <i class="fa-solid fa-file-pdf"></i>
                  <span>{{ d.title }}</span>
                  <span class="doc-badge" [class.verified]="d.reviewed">{{ d.reviewed ? 'تم التوثيق ✓' : 'بانتظار المراجعة' }}</span>
                  <button *ngIf="!d.reviewed" (click)="verifyDoc(p.id, d.id)" class="btn-micro">اعتماد التوثيق</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Products Management -->
        <div class="tab-panel beauty-card" *ngIf="activeTab === 'products'">
          <div class="panel-header">
            <h3>قائمة المنتجات والمخزون</h3>
            <input
              type="text"
              placeholder="بحث في المنتجات بالاسم أو الماركة..."
              [(ngModel)]="productSearch"
              class="table-search-input"
            />
          </div>

          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>المنتج</th>
                  <th>القسم</th>
                  <th>السعر</th>
                  <th>المخزون</th>
                  <th>التقييم</th>
                  <th>الحالة</th>
                  <th>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let prod of getAdminFilteredProducts()">
                  <td>
                    <div class="table-product-cell">
                      <img [src]="prod.main_image" [alt]="prod.name" class="t-thumb" />
                      <div>
                        <strong>{{ prod.name }}</strong>
                        <small class="text-muted d-block">{{ prod.brand }} • {{ prod.sku }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ prod.category?.name || 'عام' }}</td>
                  <td>
                    <strong>{{ prod.discount_price ?? prod.price }} ج.م</strong>
                    <small *ngIf="prod.discount_price" class="text-strike">{{ prod.price }} ج.م</small>
                  </td>
                  <td>
                    <span class="stock-pill" [class.danger]="prod.stock_quantity <= 5">
                      {{ prod.stock_quantity }} قطع
                    </span>
                  </td>
                  <td><span class="rating-badge">★ {{ prod.rating_avg }}</span></td>
                  <td>
                    <span class="status-pill active" *ngIf="prod.is_active">مفعّل</span>
                    <span class="status-pill disabled" *ngIf="!prod.is_active">معطّل</span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button (click)="openEditProductModal(prod)" class="action-icon edit" title="تعديل"><i class="fa-solid fa-pen-to-square"></i></button>
                      <button (click)="deleteProduct(prod.id)" class="action-icon delete" title="حذف"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 4: Orders Management -->
        <div class="tab-panel beauty-card" *ngIf="activeTab === 'orders'">
          <div class="panel-header">
            <h3>تتبع وتحديث طلبات المتجر</h3>
          </div>

          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>العميل</th>
                  <th>العنوان والمحافظة</th>
                  <th>الإجمالي</th>
                  <th>طريقة الدفع</th>
                  <th>الحالة الحالية</th>
                  <th>تغيير الحالة</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ord of ordersService.orders()">
                  <td><strong>#{{ ord.id }}</strong></td>
                  <td>
                    <strong>{{ ord.shipping_full_name }}</strong>
                    <small class="d-block text-muted">{{ ord.shipping_phone }}</small>
                  </td>
                  <td>{{ ord.shipping_city }} — {{ ord.shipping_address }}</td>
                  <td><strong class="text-primary">{{ ord.total_price }} ج.م</strong></td>
                  <td>{{ ord.payment_method === 'cash_on_delivery' ? 'كاش عند الاستلام' : 'دفع إلكتروني' }}</td>
                  <td>
                    <span class="status-badge" [ngClass]="'status-' + ord.status">
                      {{ getOrderStatusArabic(ord.status) }}
                    </span>
                  </td>
                  <td>
                    <select
                      [ngModel]="ord.status"
                      (ngModelChange)="onUpdateStatus(ord.id, $event)"
                      class="status-select"
                    >
                      <option value="pending">قيد الانتظار</option>
                      <option value="confirmed">تم التأكيد</option>
                      <option value="shipped">تم الشحن</option>
                      <option value="delivered">تم التوصيل</option>
                      <option value="cancelled">ملغي</option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 5: Coupons Management -->
        <div class="tab-panel beauty-card" *ngIf="activeTab === 'coupons'">
          <div class="panel-header">
            <h3>أكواد الخصم والعروض الترويجية</h3>
          </div>

          <div class="coupons-grid">
            <div class="coupon-card" *ngFor="let coup of couponsList">
              <div class="c-code-row">
                <span class="c-code">{{ coup.code }}</span>
                <span class="c-val">{{ coup.discount_type === 'percentage' ? coup.value + '%' : coup.value + ' ج.م' }} خصم</span>
              </div>
              <p class="c-terms">الحد الأدنى للطلب: <strong>{{ coup.min_order_amount }} ج.م</strong></p>
              <div class="c-footer">
                <span>مرات الاستخدام: {{ coup.times_used }}</span>
                <span class="status-pill active">ساري</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Add/Edit Product Modal Dialog -->
      <div class="modal-backdrop" *ngIf="isModalOpen" (click)="closeModal()"></div>
      <div class="modal-content beauty-card animate-fade-in" *ngIf="isModalOpen">
        <div class="modal-header">
          <h3>{{ editingProduct?.id ? 'تعديل بيانات المنتج' : 'إضافة منتج عناية جديد' }}</h3>
          <button (click)="closeModal()" class="close-modal-btn"><i class="fa-solid fa-xmark"></i></button>
        </div>

        <div class="modal-body">
          <div class="form-grid">
            <div class="form-group full-width">
              <label>اسم المنتج بالعربي <span class="req">*</span></label>
              <input type="text" [(ngModel)]="formProduct.name" class="input-custom" />
            </div>

            <div class="form-group">
              <label>السعر الأساسي (ج.م) <span class="req">*</span></label>
              <input type="number" [(ngModel)]="formProduct.price" class="input-custom" />
            </div>

            <div class="form-group">
              <label>كمية المخزون <span class="req">*</span></label>
              <input type="number" [(ngModel)]="formProduct.stock_quantity" class="input-custom" />
            </div>

            <div class="form-group full-width">
              <label>رابط صورة المنتج (URL)</label>
              <input type="text" [(ngModel)]="formProduct.main_image" class="input-custom" dir="ltr" />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button (click)="closeModal()" class="btn-outline">إلغاء</button>
          <button (click)="saveProduct()" class="btn-primary">حفظ المنتج</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2.5rem 0 5rem;
      background: #FAF7F5;
      min-height: 90vh;
    }
    .admin-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1.5rem;
    }
    .admin-title {
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--color-text-main);
      margin-top: 0.35rem;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }
    .metric-card {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .metric-icon {
      width: 55px;
      height: 55px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;

      &.money { background: #DCFCE7; color: #15803D; }
      &.orders { background: #DBEAFE; color: #1D4ED8; }
      &.products { background: #FEF3C7; color: #B45309; }
      &.users { background: #F3E8FF; color: #7E22CE; }
    }
    .metric-info {
      display: flex;
      flex-direction: column;
    }
    .metric-label {
      font-size: 0.82rem;
      color: var(--color-text-muted);
      font-weight: 600;
    }
    .metric-val {
      font-size: 1.65rem;
      font-weight: 900;
      color: var(--color-text-main);
      line-height: 1.2;
      margin: 0.2rem 0;

      small { font-size: 0.95rem; }
    }
    .metric-sub {
      font-size: 0.75rem;
      color: var(--color-text-subtle);

      &.text-success { color: #10B981; font-weight: 700; }
      &.text-warning { color: #EA580C; font-weight: 700; }
    }

    .dashboard-tabs {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }
    .tab-btn {
      padding: 0.75rem 1.35rem;
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: 12px;
      font-family: inherit;
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--color-text-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      white-space: nowrap;
      transition: var(--transition-smooth);

      &.active {
        background: var(--color-primary);
        color: #FFFFFF;
        border-color: var(--color-primary);
        box-shadow: 0 4px 14px rgba(196, 109, 91, 0.3);
      }
      &.active-highlight {
        border-color: var(--color-primary);
      }
    }

    .tab-panel {
      padding: 1.75rem 2rem;
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;

      h3 { font-size: 1.25rem; font-weight: 800; }
    }
    .mt-1 { margin-top: 0.35rem; }

    /* Matching Queue */
    .matching-queue-list {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .queue-booking-item {
      border: 1px solid var(--color-border);
      border-radius: 18px;
      padding: 1.5rem;
      background: #FAF7F5;

      &.highlight-pending {
        border-color: var(--color-primary);
        background: #FFFDFB;
        box-shadow: 0 4px 18px rgba(196, 109, 91, 0.1);
      }
    }
    .q-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .q-id { font-size: 0.8rem; color: var(--color-text-subtle); }
    .q-srv { font-size: 1.15rem; font-weight: 800; color: var(--color-text-main); margin: 0.2rem 0 0.5rem; }
    .q-meta {
      display: flex;
      gap: 1.25rem;
      font-size: 0.85rem;
      color: var(--color-text-muted);
      flex-wrap: wrap;
      i { color: var(--color-primary); }
    }
    .q-notes {
      margin-top: 0.5rem;
      font-size: 0.82rem;
      color: #92400E;
      background: #FFFBEB;
      padding: 0.4rem 0.85rem;
      border-radius: 8px;
      display: inline-block;
    }
    .q-status-box { text-align: left; }
    .q-price { margin-top: 0.35rem; font-size: 0.85rem; strong { font-size: 1.1rem; color: var(--color-primary); } }

    .matching-engine-box {
      background: #FFFFFF;
      border: 1.5px dashed var(--color-border);
      border-radius: 14px;
      padding: 1.25rem;
      margin-top: 1rem;
    }
    .engine-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: var(--color-primary);
      margin-bottom: 1rem;
    }
    .candidates-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .candidate-card {
      border: 1.5px solid var(--color-border);
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      background: #FAF7F5;
      transition: var(--transition-smooth);

      &:hover { border-color: var(--color-primary); }
      &.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-subtle);
        box-shadow: 0 4px 12px rgba(196, 109, 91, 0.15);
      }
    }
    .c-rank-badge { font-size: 0.72rem; font-weight: 700; color: var(--color-primary); margin-bottom: 0.4rem; }
    .c-profile { display: flex; gap: 0.75rem; align-items: center; }
    .c-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; }
    .c-rating { font-size: 0.78rem; color: #D97706; font-weight: 700; display: block; }
    .c-dist { font-size: 0.75rem; color: var(--color-text-subtle); display: block; }

    .admin-offer-confirm-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border-light);
      flex-wrap: wrap;
      gap: 1rem;
    }
    .price-input-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      label { font-size: 0.88rem; font-weight: 700; }
    }
    .price-input { width: 140px; padding: 0.45rem 0.75rem; font-weight: 800; color: var(--color-primary); }

    .assigned-provider-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FFFFFF;
      padding: 0.85rem 1.25rem;
      border-radius: 12px;
      margin-top: 0.85rem;
    }
    .ap-info { display: flex; align-items: center; gap: 0.75rem; }
    .ap-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
    .ap-lbl { font-size: 0.78rem; color: var(--color-text-subtle); margin-left: 0.35rem; }
    .admin-quick-status { display: flex; align-items: center; gap: 0.5rem; label { font-size: 0.82rem; } }

    /* Provider Verification Tab */
    .providers-admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .provider-admin-card {
      border: 1px solid var(--color-border);
      border-radius: 16px;
      padding: 1.25rem;
      background: #FAF7F5;
    }
    .pa-header { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; }
    .pa-avatar { width: 56px; height: 56px; border-radius: 50%; object-fit: cover; }
    .pa-name { font-size: 1.05rem; font-weight: 800; margin: 0.2rem 0; }
    .pa-city { font-size: 0.78rem; color: var(--color-text-subtle); }
    .pa-specialties { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem; }
    .sp-chip { font-size: 0.72rem; background: #FFFFFF; border: 1px solid var(--color-border); padding: 0.2rem 0.5rem; border-radius: 9999px; }
    .pa-docs { border-top: 1px solid var(--color-border-light); padding-top: 0.75rem; }
    .docs-lbl { font-size: 0.78rem; font-weight: 700; color: var(--color-text-muted); display: block; margin-bottom: 0.4rem; }
    .doc-item {
      display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
      background: #FFFFFF; padding: 0.45rem 0.75rem; border-radius: 8px; font-size: 0.8rem; margin-bottom: 0.35rem;
    }
    .doc-badge { font-size: 0.72rem; color: #D97706; &.verified { color: #15803D; font-weight: 700; } }
    .btn-micro { background: var(--color-primary); color: #fff; border: none; border-radius: 6px; padding: 0.2rem 0.5rem; font-size: 0.72rem; cursor: pointer; }

    /* Tables */
    .table-responsive { overflow-x: auto; }
    .custom-table {
      width: 100%; border-collapse: collapse; text-align: right;
      th { padding: 0.85rem 1rem; background: #FAF7F5; color: var(--color-text-muted); font-size: 0.82rem; font-weight: 700; border-bottom: 1.5px solid var(--color-border); }
      td { padding: 1rem; border-bottom: 1px solid var(--color-border-light); font-size: 0.9rem; vertical-align: middle; }
    }
    .table-product-cell { display: flex; align-items: center; gap: 0.85rem; }
    .t-thumb { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; }
    .text-strike { text-decoration: line-through; color: var(--color-text-subtle); font-size: 0.78rem; margin-right: 0.4rem; }
    .stock-pill { background: #EBF5F0; color: #15803D; font-weight: 700; font-size: 0.8rem; padding: 0.2rem 0.55rem; border-radius: 9999px; &.danger { background: #FEE2E2; color: #B91C1C; } }
    .rating-badge { color: #D97706; font-weight: 700; font-size: 0.85rem; }
    .status-pill { font-size: 0.78rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 9999px; &.active { background: #DCFCE7; color: #15803D; } &.disabled { background: #F3F4F6; color: #6B7280; } }
    .row-actions { display: flex; gap: 0.5rem; }
    .action-icon { width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--color-border); background: #FFFFFF; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--transition-smooth); &.edit:hover { color: var(--color-primary); border-color: var(--color-primary); } &.delete:hover { color: #EF4444; border-color: #EF4444; } }
    .status-select { padding: 0.35rem 0.65rem; border: 1px solid var(--color-border); border-radius: 8px; font-family: inherit; font-size: 0.82rem; cursor: pointer; }
    .table-search-input { padding: 0.5rem 1rem; border: 1px solid var(--color-border); border-radius: 9999px; font-family: inherit; font-size: 0.85rem; width: 280px; outline: none; }

    /* Coupons */
    .coupons-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }
    .coupon-card { border: 1.5px dashed var(--color-border); border-radius: 16px; padding: 1.25rem; background: #FAF7F5; }
    .c-code-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .c-code { font-size: 1.15rem; font-weight: 900; color: var(--color-primary); }
    .c-val { background: #DCFCE7; color: #15803D; font-weight: 700; font-size: 0.82rem; padding: 0.2rem 0.5rem; border-radius: 9999px; }
    .c-terms { font-size: 0.82rem; color: var(--color-text-muted); margin-bottom: 1rem; }
    .c-footer { display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: var(--color-text-subtle); border-top: 1px solid var(--color-border-light); padding-top: 0.75rem; }

    /* Modals */
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(30, 27, 24, 0.55); backdrop-filter: blur(4px); z-index: 2000; }
    .modal-content { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; background: #FFFFFF; border-radius: 20px; padding: 2rem; z-index: 2001; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 1px solid var(--color-border-light); margin-bottom: 1.5rem; h3 { font-size: 1.25rem; font-weight: 800; } }
    .close-modal-btn { background: none; border: none; font-size: 1.25rem; cursor: pointer; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.15rem; }
    .full-width { grid-column: 1 / -1; }
    .form-group { display: flex; flex-direction: column; gap: 0.35rem; label { font-size: 0.85rem; font-weight: 700; } .req { color: #EF4444; } }
    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid var(--color-border-light); }
  `]
})
export class AdminComponent {
  productsService = inject(ProductsService);
  ordersService = inject(OrdersService);
  bookingsService = inject(BookingsService);
  providersService = inject(ProvidersService);
  auth = inject(AuthService);

  activeTab: 'matching' | 'providers' | 'products' | 'orders' | 'coupons' = 'matching';
  productSearch: string = '';
  couponsList: Coupon[] = MOCK_COUPONS;

  selectedProviderId: Record<string, string> = {};
  offerPrices: Record<string, number> = {};

  isModalOpen: boolean = false;
  editingProduct: Product | null = null;
  formProduct: Partial<Product> = { name: '', price: 0, stock_quantity: 10, main_image: '' };

  getTotalSales(): number {
    return this.ordersService.orders().reduce((sum, o) => sum + o.total_price, 0);
  }

  getBookingsCommission(): number {
    const totalBookingsValue = this.bookingsService.bookings()
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.agreed_price || 0), 0);
    return Math.round(totalBookingsValue * 0.15);
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
    const candidates = this.providersService.providers();
    const provId = this.selectedProviderId[bookingId] || candidates[0]?.id;
    const finalPrice = this.offerPrices[bookingId] || 1150;

    if (provId) {
      await this.bookingsService.confirmBookingOffer(bookingId, provId, finalPrice);
    }
  }

  async onUpdateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    await this.bookingsService.updateBookingStatus(bookingId, status);
  }

  async verifyDoc(providerId: string, docId: string): Promise<void> {
    await this.providersService.verifyDocument(providerId, docId);
  }

  getAdminFilteredProducts(): Product[] {
    const q = this.productSearch.trim().toLowerCase();
    if (!q) return this.productsService.products();
    return this.productsService.products().filter(p =>
      p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q))
    );
  }

  getOrderStatusArabic(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      pending: 'قيد الانتظار',
      confirmed: 'تم التأكيد',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي'
    };
    return map[status] || status;
  }

  getBookingStatusArabic(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
      requested: 'طلب جديد (يحتاج ترشيح)',
      offered: 'تم إرسال العرض للعميلة',
      confirmed: 'مؤكد ومدفوع',
      in_progress: 'الجلسة جارية',
      completed: 'مكتملة',
      cancelled: 'ملغية',
      reported: 'بلاغ قيد المراجعة'
    };
    return map[status] || status;
  }

  async onUpdateStatus(orderId: string, status: OrderStatus): Promise<void> {
    await this.ordersService.updateOrderStatus(orderId, status);
  }

  openNewProductModal(): void {
    this.editingProduct = null;
    this.formProduct = {
      name: '',
      price: 0,
      stock_quantity: 20,
      category_id: 'cat-1',
      main_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
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
    if (confirm('هل أنتِ متأكدة من حذف هذا المنتج؟')) {
      await this.productsService.deleteProduct(id);
    }
  }
}
