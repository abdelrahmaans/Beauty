import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { OrdersService } from '../../core/services/orders.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, Order, OrderStatus, Coupon } from '../../core/models';
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
            <span class="badge-luxury">لوحة إدارة المتجر الإلكتروني</span>
            <h1 class="admin-title">نظام التحكم والعمليات</h1>
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
              <span class="metric-label">إجمالي المبيعات</span>
              <strong class="metric-val">{{ getTotalSales() }} <small>ج.م</small></strong>
              <span class="metric-sub text-success"><i class="fa-solid fa-arrow-trend-up"></i> +18% هذا الشهر</span>
            </div>
          </div>

          <div class="metric-card beauty-card">
            <div class="metric-icon orders"><i class="fa-solid fa-box-open"></i></div>
            <div class="metric-info">
              <span class="metric-label">إجمالي الطلبات</span>
              <strong class="metric-val">{{ ordersService.orders().length }}</strong>
              <span class="metric-sub">{{ getPendingOrdersCount() }} طلبات جديدة قيد الانتظار</span>
            </div>
          </div>

          <div class="metric-card beauty-card">
            <div class="metric-icon products"><i class="fa-solid fa-pump-soap"></i></div>
            <div class="metric-info">
              <span class="metric-label">المنتجات في الكتالوج</span>
              <strong class="metric-val">{{ productsService.products().length }}</strong>
              <span class="metric-sub text-warning">{{ getLowStockCount() }} منتجات أوشكت على النفاد</span>
            </div>
          </div>

          <div class="metric-card beauty-card">
            <div class="metric-icon users"><i class="fa-solid fa-users"></i></div>
            <div class="metric-info">
              <span class="metric-label">العملاء المسجلون</span>
              <strong class="metric-val">1,480</strong>
              <span class="metric-sub text-success">+42 عميلة جديدة هذا الأسبوع</span>
            </div>
          </div>
        </div>

        <!-- Dashboard Navigation Tabs -->
        <div class="dashboard-tabs">
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
            <i class="fa-solid fa-truck-ramp-box"></i> إدارة الطلبات ({{ ordersService.orders().length }})
          </button>
          <button
            class="tab-btn"
            [class.active]="activeTab === 'coupons'"
            (click)="activeTab = 'coupons'"
          >
            <i class="fa-solid fa-ticket"></i> أكواد الخصم والكوبونات
          </button>
          <button
            class="tab-btn phase2-tab"
            [class.active]="activeTab === 'matching'"
            (click)="activeTab = 'matching'"
          >
            <i class="fa-solid fa-wand-magic-sparkles"></i> طابور الحجوزات والترشيح (المرحلة 2)
          </button>
        </div>

        <!-- Tab 1: Products Management -->
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
                  <td>
                    <span class="rating-badge">★ {{ prod.rating_avg }}</span>
                  </td>
                  <td>
                    <span class="status-pill active" *ngIf="prod.is_active">مفعّل</span>
                    <span class="status-pill disabled" *ngIf="!prod.is_active">معطّل</span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button (click)="openEditProductModal(prod)" class="action-icon edit" title="تعديل">
                        <i class="fa-solid fa-pen-to-square"></i>
                      </button>
                      <button (click)="deleteProduct(prod.id)" class="action-icon delete" title="حذف">
                        <i class="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tab 2: Orders Management -->
        <div class="tab-panel beauty-card" *ngIf="activeTab === 'orders'">
          <div class="panel-header">
            <h3>تتبع وتحديث طلبات العملاء</h3>
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
                      {{ getStatusArabic(ord.status) }}
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

        <!-- Tab 3: Coupons Management -->
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

        <!-- Tab 4: Phase 2 Matching Queue Preview -->
        <div class="tab-panel beauty-card" *ngIf="activeTab === 'matching'">
          <div class="panel-header">
            <div>
              <span class="badge-emerald">مُجهَّز للمرحلة الثانية</span>
              <h3 class="mt-1">طابور طلبات الجلسات المنزلية والمطابقة الذكية</h3>
            </div>
          </div>

          <div class="matching-preview-card">
            <div class="matching-info">
              <i class="fa-solid fa-wand-magic-sparkles magic-icon"></i>
              <div>
                <h4>نظام ترشيح الفريلانسرز المساعد</h4>
                <p>
                  يستدعي النظام دالة <code dir="ltr">suggest_providers_for_booking()</code> في Supabase Postgres لحساب المسافة الجغرافية بالكيلومتر وترتيب المتخصصات حسب التقييم والتخصص. يتيح للأدمن مراجعة وتعديل العرض قبل إرساله للعميلة.
                </p>
              </div>
            </div>

            <!-- Demo Request Row -->
            <div class="demo-booking-row">
              <div class="booking-req-info">
                <span class="req-service">جلسة بروتين وترميم شعر منزلي</span>
                <span class="req-meta"><i class="fa-solid fa-location-dot"></i> التجمع الخامس، القاهرة • السبت 22 أغسطس 04:00 م</span>
              </div>
              <div class="suggested-candidate">
                <div class="candidate-avatar">أ</div>
                <div>
                  <strong>أمنية السعيد (أخصائية معتمدة)</strong>
                  <span class="c-rating">★ 4.9 (48 جلسة ناجحة) • المسافة: 4.2 كم</span>
                </div>
              </div>
              <div class="booking-actions">
                <button class="btn-primary btn-sm">قبول وترشيح للعميلة</button>
                <button class="btn-outline btn-sm">اختيار بديل</button>
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
              <input type="text" [(ngModel)]="formProduct.name" class="input-custom" placeholder="مثال: سيروم الهايلورونيك والنضارة" />
            </div>

            <div class="form-group">
              <label>الاسم بالإنجليزية</label>
              <input type="text" [(ngModel)]="formProduct.name_en" class="input-custom" dir="ltr" placeholder="Radiance Glow Serum" />
            </div>

            <div class="form-group">
              <label>القسم / التصنيف</label>
              <select [(ngModel)]="formProduct.category_id" class="input-custom">
                <option *ngFor="let c of productsService.categories()" [value]="c.id">{{ c.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>السعر الأساسي (ج.م) <span class="req">*</span></label>
              <input type="number" [(ngModel)]="formProduct.price" class="input-custom" />
            </div>

            <div class="form-group">
              <label>سعر الخصم (ج.م - اختياري)</label>
              <input type="number" [(ngModel)]="formProduct.discount_price" class="input-custom" />
            </div>

            <div class="form-group">
              <label>كمية المخزون <span class="req">*</span></label>
              <input type="number" [(ngModel)]="formProduct.stock_quantity" class="input-custom" />
            </div>

            <div class="form-group">
              <label>العلامة التجارية (Brand)</label>
              <input type="text" [(ngModel)]="formProduct.brand" class="input-custom" />
            </div>

            <div class="form-group full-width">
              <label>رابط صورة المنتج (URL)</label>
              <input type="text" [(ngModel)]="formProduct.main_image" class="input-custom" dir="ltr" />
            </div>

            <div class="form-group full-width">
              <label>وصف المنتج</label>
              <textarea [(ngModel)]="formProduct.description" class="input-custom" rows="3"></textarea>
            </div>

            <div class="form-group full-width">
              <label>المكونات الفعالة</label>
              <textarea [(ngModel)]="formProduct.ingredients" class="input-custom" rows="2"></textarea>
            </div>

            <div class="form-group full-width">
              <label>طريقة الاستخدام</label>
              <textarea [(ngModel)]="formProduct.how_to_use" class="input-custom" rows="2"></textarea>
            </div>

            <div class="form-group full-width checkbox-group">
              <label class="check-label">
                <input type="checkbox" [(ngModel)]="formProduct.is_featured" />
                <span>إظهار في قسم "الأكثر طلباً" بالصفحة الرئيسية</span>
              </label>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button (click)="closeModal()" class="btn-outline">إلغاء</button>
          <button (click)="saveProduct()" class="btn-primary">
            <i class="fa-solid fa-floppy-disk"></i> حفظ المنتج
          </button>
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
      &.phase2-tab {
        border-style: dashed;
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
    .table-search-input {
      padding: 0.5rem 1rem;
      border: 1px solid var(--color-border);
      border-radius: 9999px;
      font-family: inherit;
      font-size: 0.85rem;
      width: 280px;
      outline: none;
    }

    .table-responsive {
      overflow-x: auto;
    }
    .custom-table {
      width: 100%;
      border-collapse: collapse;
      text-align: right;

      th {
        padding: 0.85rem 1rem;
        background: #FAF7F5;
        color: var(--color-text-muted);
        font-size: 0.82rem;
        font-weight: 700;
        border-bottom: 1.5px solid var(--color-border);
      }
      td {
        padding: 1rem;
        border-bottom: 1px solid var(--color-border-light);
        font-size: 0.9rem;
        vertical-align: middle;
      }
    }
    .table-product-cell {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .t-thumb {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      object-fit: cover;
    }
    .text-strike {
      text-decoration: line-through;
      color: var(--color-text-subtle);
      font-size: 0.78rem;
      margin-right: 0.4rem;
    }
    .stock-pill {
      background: #EBF5F0;
      color: #15803D;
      font-weight: 700;
      font-size: 0.8rem;
      padding: 0.2rem 0.55rem;
      border-radius: 9999px;

      &.danger {
        background: #FEE2E2;
        color: #B91C1C;
      }
    }
    .rating-badge {
      color: #D97706;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .status-pill {
      font-size: 0.78rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;

      &.active { background: #DCFCE7; color: #15803D; }
      &.disabled { background: #F3F4F6; color: #6B7280; }
    }
    .row-actions {
      display: flex;
      gap: 0.5rem;
    }
    .action-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      border: 1px solid var(--color-border);
      background: #FFFFFF;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--transition-smooth);

      &.edit:hover { color: var(--color-primary); border-color: var(--color-primary); }
      &.delete:hover { color: #EF4444; border-color: #EF4444; }
    }
    .status-select {
      padding: 0.35rem 0.65rem;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      font-family: inherit;
      font-size: 0.82rem;
      cursor: pointer;
    }

    .coupons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.5rem;
    }
    .coupon-card {
      border: 1.5px dashed var(--color-border);
      border-radius: 16px;
      padding: 1.25rem;
      background: #FAF7F5;
    }
    .c-code-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .c-code {
      font-size: 1.15rem;
      font-weight: 900;
      color: var(--color-primary);
      letter-spacing: 1px;
    }
    .c-val {
      background: #DCFCE7;
      color: #15803D;
      font-weight: 700;
      font-size: 0.82rem;
      padding: 0.2rem 0.5rem;
      border-radius: 9999px;
    }
    .c-terms {
      font-size: 0.82rem;
      color: var(--color-text-muted);
      margin-bottom: 1rem;
    }
    .c-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.78rem;
      color: var(--color-text-subtle);
      border-top: 1px solid var(--color-border-light);
      padding-top: 0.75rem;
    }

    .matching-preview-card {
      background: #FDFBF7;
      border: 1px solid #EADBCE;
      border-radius: 18px;
      padding: 1.75rem;
    }
    .matching-info {
      display: flex;
      gap: 1.25rem;
      margin-bottom: 2rem;
      .magic-icon {
        font-size: 2rem;
        color: #D97706;
      }
      h4 { font-size: 1.15rem; font-weight: 800; margin-bottom: 0.35rem; }
      p { font-size: 0.88rem; color: var(--color-text-muted); line-height: 1.6; }
    }
    .demo-booking-row {
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      border-radius: 14px;
      padding: 1.25rem;
      display: grid;
      grid-template-columns: 1.5fr 1.5fr 1fr;
      align-items: center;
      gap: 1.25rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }
    .req-service {
      font-weight: 800;
      font-size: 0.95rem;
      display: block;
      color: var(--color-text-main);
    }
    .req-meta {
      font-size: 0.8rem;
      color: var(--color-text-subtle);
    }
    .suggested-candidate {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .candidate-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-primary-light);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
    }
    .c-rating {
      font-size: 0.78rem;
      color: var(--color-text-muted);
      display: block;
    }
    .btn-sm {
      padding: 0.45rem 0.85rem;
      font-size: 0.8rem;
    }
    .booking-actions {
      display: flex;
      gap: 0.5rem;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(30, 27, 24, 0.55);
      backdrop-filter: blur(4px);
      z-index: 2000;
    }
    .modal-content {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 90%;
      max-width: 680px;
      max-height: 90vh;
      overflow-y: auto;
      background: #FFFFFF;
      border-radius: 20px;
      padding: 2rem;
      z-index: 2001;
      box-shadow: 0 20px 50px rgba(0,0,0,0.25);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border-light);
      margin-bottom: 1.5rem;
      h3 { font-size: 1.25rem; font-weight: 800; }
    }
    .close-modal-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.15rem;
    }
    .full-width { grid-column: 1 / -1; }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      label { font-size: 0.85rem; font-weight: 700; }
      .req { color: #EF4444; }
    }
    .check-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.88rem;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--color-border-light);
    }
    .mt-1 { margin-top: 0.35rem; }
  `]
})
export class AdminComponent {
  productsService = inject(ProductsService);
  ordersService = inject(OrdersService);
  auth = inject(AuthService);

  activeTab: 'products' | 'orders' | 'coupons' | 'matching' = 'products';
  productSearch: string = '';
  couponsList: Coupon[] = MOCK_COUPONS;

  isModalOpen: boolean = false;
  editingProduct: Product | null = null;

  formProduct: Partial<Product> = {
    name: '',
    name_en: '',
    price: 0,
    discount_price: null,
    stock_quantity: 10,
    category_id: 'cat-1',
    brand: '',
    main_image: '',
    description: '',
    ingredients: '',
    how_to_use: '',
    is_featured: false,
    is_active: true
  };

  getTotalSales(): number {
    return this.ordersService.orders().reduce((sum, o) => sum + o.total_price, 0);
  }

  getPendingOrdersCount(): number {
    return this.ordersService.orders().filter(o => o.status === 'pending').length;
  }

  getLowStockCount(): number {
    return this.productsService.products().filter(p => p.stock_quantity <= 5).length;
  }

  getAdminFilteredProducts(): Product[] {
    const q = this.productSearch.trim().toLowerCase();
    if (!q) return this.productsService.products();
    return this.productsService.products().filter(p =>
      p.name.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q))
    );
  }

  getStatusArabic(status: OrderStatus): string {
    const map: Record<OrderStatus, string> = {
      pending: 'قيد الانتظار',
      confirmed: 'تم التأكيد',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي'
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
      name_en: '',
      price: 0,
      discount_price: null,
      stock_quantity: 20,
      category_id: this.productsService.categories()[0]?.id || 'cat-1',
      brand: 'BEAUTY Care',
      main_image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      description: '',
      ingredients: '',
      how_to_use: '',
      is_featured: false,
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
