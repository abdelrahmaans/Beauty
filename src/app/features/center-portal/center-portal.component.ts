import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CentersService } from '../../core/services/centers.service';
import { ReferralsService } from '../../core/services/referrals.service';
import { AuthService } from '../../core/services/auth.service';
import { CenterService, RedemptionStatus, ReferralRedemption } from '../../core/models';

@Component({
  selector: 'app-center-portal',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './center-portal.component.html',
  styleUrl: './center-portal.component.css'
})
export class CenterPortalComponent {
  centersService = inject(CentersService);
  referralsService = inject(ReferralsService);
  auth = inject(AuthService);
  Math = Math;

  activeTab: 'overview' | 'redemptions' | 'services' | 'finances' | 'info' = 'overview';
  redemptionFilter: 'pending' | 'confirmed' | 'all' = 'pending';

  // Mobile Drawer Sidebar State
  isMobileSidebarOpen: boolean = false;

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen = false;
  }

  setTab(tab: 'overview' | 'redemptions' | 'services' | 'finances' | 'info'): void {
    this.activeTab = tab;
    this.closeMobileSidebar();
  }

  isConfirmModalOpen: boolean = false;
  activeRedemption: ReferralRedemption | null = null;
  invoiceValue: number = 1500;

  isServiceModalOpen: boolean = false;
  editingService: CenterService | null = null;
  serviceForm: Partial<CenterService> = {
    service_name: '',
    price_from: 500,
    price_to: 1000,
    description: '',
    category: 'hair'
  };

  isSavedNotice: boolean = false;

  getStatusArabic(status: RedemptionStatus): string {
    const map: Record<RedemptionStatus, string> = {
      claimed: 'طلب جديد (بانتظار التأكيد)',
      confirmed_by_center: 'مؤكد وتمت الزيارة ✓',
      paid_out: 'مكتمل ومسجل',
      rejected: 'مرفوض'
    };
    return map[status] || status;
  }

  getCategoryArabic(cat?: string): string {
    const map: Record<string, string> = {
      hair: 'عناية وترميم الشعر (Hair)',
      skin: 'بشرة ونضارة (Skin)',
      spa: 'حمام مغربي وسبا (Spa)',
      makeup: 'ميك أب وتسريحات (Beauty)'
    };
    return (cat && map[cat]) ? map[cat] : 'عناية متكاملة';
  }

  getFilteredRedemptions(): ReferralRedemption[] {
    const all = this.referralsService.myCenterRedemptions();
    if (this.redemptionFilter === 'pending') {
      return all.filter(r => r.status === 'claimed');
    }
    if (this.redemptionFilter === 'confirmed') {
      return all.filter(r => r.status === 'confirmed_by_center' || r.status === 'paid_out');
    }
    return all;
  }

  getPendingClaims(): ReferralRedemption[] {
    return this.referralsService.myCenterRedemptions().filter(r => r.status === 'claimed');
  }

  getConfirmedRedemptions(): ReferralRedemption[] {
    return this.referralsService.myCenterRedemptions().filter(r => r.status === 'confirmed_by_center' || r.status === 'paid_out');
  }

  getPendingClaimsCount(): number {
    return this.referralsService.myCenterRedemptions().filter(r => r.status === 'claimed').length;
  }

  getConfirmedCount(): number {
    return this.referralsService.myCenterRedemptions().filter(r => r.status === 'confirmed_by_center' || r.status === 'paid_out').length;
  }

  getConfirmedRevenue(): number {
    return this.referralsService.myCenterRedemptions()
      .filter(r => r.status === 'confirmed_by_center' || r.status === 'paid_out')
      .reduce((sum, r) => sum + (r.estimated_value || 0), 0);
  }

  getTotalCommissionsOwed(): number {
    return this.referralsService.myCenterRedemptions()
      .filter(r => r.status === 'confirmed_by_center' || r.status === 'paid_out')
      .reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  }

  openConfirmModal(redemption: ReferralRedemption): void {
    this.activeRedemption = redemption;
    this.invoiceValue = 1500;
    this.isConfirmModalOpen = true;
  }

  async submitConfirmRedemption(): Promise<void> {
    if (!this.activeRedemption || !this.invoiceValue) return;
    await this.referralsService.confirmRedemption(this.activeRedemption.id, this.invoiceValue);
    this.isConfirmModalOpen = false;
  }

  async rejectClaim(id: string): Promise<void> {
    if (confirm('هل أنتِ متأكدة من رفض هذا الكود؟')) {
      await this.referralsService.rejectRedemption(id);
    }
  }

  openAddServiceModal(): void {
    this.editingService = null;
    this.serviceForm = { service_name: '', price_from: 600, price_to: 1200, description: '', category: 'hair' };
    this.isServiceModalOpen = true;
  }

  openEditServiceModal(service: CenterService): void {
    this.editingService = service;
    this.serviceForm = { ...service };
    this.isServiceModalOpen = true;
  }

  async saveService(): Promise<void> {
    const center = this.centersService.currentCenter();
    if (!center || !this.serviceForm.service_name) return;

    await this.centersService.saveCenterService(center.id, {
      id: this.editingService?.id,
      ...this.serviceForm
    });
    this.isServiceModalOpen = false;
  }

  async deleteService(serviceId: string): Promise<void> {
    const center = this.centersService.currentCenter();
    if (!center) return;
    if (confirm('هل أنتِ متأكدة من حذف هذه الخدمة؟')) {
      await this.centersService.deleteCenterService(center.id, serviceId);
    }
  }

  saveInfoNotice(): void {
    this.isSavedNotice = true;
    setTimeout(() => (this.isSavedNotice = false), 3000);
  }
}
