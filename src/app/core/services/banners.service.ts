import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Banner } from '../models';
import { MOCK_BANNERS, MOCK_COUPONS } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class BannersService {
  private _banners = signal<Banner[]>([]);
  private _isLoading = signal<boolean>(false);

  readonly banners = this._banners.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Active banners for homepage carousel
  readonly activeBanners = computed(() => {
    const now = new Date().getTime();
    return this._banners()
      .filter(b => {
        if (!b.is_active) return false;
        if (b.start_at && new Date(b.start_at).getTime() > now) return false;
        if (b.end_at && new Date(b.end_at).getTime() < now) return false;
        return true;
      })
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  });

  constructor(private supabase: SupabaseService) {
    this.loadBanners();
  }

  async loadBanners(): Promise<void> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data, error } = await client
          .from('banners')
          .select('*, coupon:coupons(*)');

        if (data && !error && data.length > 0) {
          this._banners.set(data as Banner[]);
        } else {
          this._banners.set(MOCK_BANNERS);
        }
      } catch {
        this._banners.set(MOCK_BANNERS);
      }
    } else {
      const saved = localStorage.getItem('beauty_banners');
      if (saved) {
        try {
          this._banners.set(JSON.parse(saved));
        } catch {
          this._banners.set(MOCK_BANNERS);
        }
      } else {
        this._banners.set(MOCK_BANNERS);
      }
    }
    this._isLoading.set(false);
  }

  private saveBanners(): void {
    localStorage.setItem('beauty_banners', JSON.stringify(this._banners()));
  }

  async createBanner(bannerData: Partial<Banner>): Promise<Banner> {
    const coupon = bannerData.coupon_id ? MOCK_COUPONS.find(c => c.id === bannerData.coupon_id) : undefined;
    const newBanner: Banner = {
      id: 'ban-' + Date.now(),
      type: bannerData.type || 'announcement',
      placement: 'homepage',
      title: bannerData.title || '',
      subtitle: bannerData.subtitle || '',
      image_storage_path: bannerData.image_storage_path || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1600&q=80',
      cta_text: bannerData.cta_text || 'عرض التفاصيل',
      cta_link: bannerData.cta_link || '/products',
      coupon_id: bannerData.coupon_id || null,
      coupon: coupon,
      is_active: bannerData.is_active ?? true,
      start_at: bannerData.start_at || null,
      end_at: bannerData.end_at || null,
      sort_order: bannerData.sort_order ?? (this._banners().length + 1),
      created_at: new Date().toISOString()
    };

    const client = this.supabase.client;
    if (client) {
      try {
        await client.from('banners').insert([newBanner]);
      } catch (err) {
        console.warn('Fallback to local storage for banner creation:', err);
      }
    }

    this._banners.update(list => [...list, newBanner]);
    this.saveBanners();
    return newBanner;
  }

  async updateBanner(id: string, updates: Partial<Banner>): Promise<void> {
    const coupon = updates.coupon_id ? MOCK_COUPONS.find(c => c.id === updates.coupon_id) : undefined;

    this._banners.update(list =>
      list.map(b => (b.id === id ? { ...b, ...updates, coupon: coupon ?? b.coupon, updated_at: new Date().toISOString() } : b))
    );
    this.saveBanners();

    const client = this.supabase.client;
    if (client) {
      try {
        await client.from('banners').update(updates).eq('id', id);
      } catch (err) {
        console.warn('Fallback to local storage for banner update:', err);
      }
    }
  }

  async deleteBanner(id: string): Promise<void> {
    this._banners.update(list => list.filter(b => b.id !== id));
    this.saveBanners();

    const client = this.supabase.client;
    if (client) {
      try {
        await client.from('banners').delete().eq('id', id);
      } catch (err) {
        console.warn('Fallback to local storage for banner deletion:', err);
      }
    }
  }

  async toggleBannerActive(id: string): Promise<void> {
    const banner = this._banners().find(b => b.id === id);
    if (banner) {
      await this.updateBanner(id, { is_active: !banner.is_active });
    }
  }
}
