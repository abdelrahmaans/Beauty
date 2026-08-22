import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Provider, CenterService } from '../models';
import { MOCK_CENTERS } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class CentersService {
  private _centers = signal<Provider[]>([]);
  private _selectedCity = signal<string>('all');
  private _selectedCategory = signal<string>('all');
  private _searchQuery = signal<string>('');
  private _isLoading = signal<boolean>(false);

  readonly centers = this._centers.asReadonly();
  readonly selectedCity = this._selectedCity.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly searchQuery = this._searchQuery.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Current logged in center profile if role === 'center'
  readonly currentCenter = computed(() => {
    const userProfile = this.auth.profile();
    if (!userProfile) return null;
    return this._centers().find(c => c.user_id === userProfile.id || c.id === 'ctr-1') || this._centers()[0] || null;
  });

  // Filtered Centers computation
  readonly filteredCenters = computed(() => {
    let list = this._centers();
    const city = this._selectedCity();
    const cat = this._selectedCategory();
    const q = this._searchQuery().trim().toLowerCase();

    if (city !== 'all') {
      list = list.filter(c => c.city?.includes(city));
    }

    if (cat !== 'all') {
      list = list.filter(c =>
        c.specialties.some(s => s.toLowerCase().includes(cat)) ||
        c.center_services?.some(cs => cs.category === cat || cs.service_name.toLowerCase().includes(cat))
      );
    }

    if (q) {
      list = list.filter(c =>
        c.display_name.toLowerCase().includes(q) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.bio && c.bio.toLowerCase().includes(q)) ||
        c.specialties.some(s => s.toLowerCase().includes(q))
      );
    }

    return list;
  });

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {
    this.loadCenters();
  }

  async loadCenters(): Promise<void> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data, error } = await client
          .from('providers')
          .select('*, center_services(*), referral_codes(*)')
          .eq('type', 'center');

        if (data && !error && data.length > 0) {
          this._centers.set(data as Provider[]);
        } else {
          this._centers.set(MOCK_CENTERS);
        }
      } catch {
        this._centers.set(MOCK_CENTERS);
      }
    } else {
      const saved = localStorage.getItem('beauty_partner_centers');
      if (saved) {
        try {
          this._centers.set(JSON.parse(saved));
        } catch {
          this._centers.set(MOCK_CENTERS);
        }
      } else {
        this._centers.set(MOCK_CENTERS);
      }
    }
    this._isLoading.set(false);
  }

  private saveCenters(): void {
    localStorage.setItem('beauty_partner_centers', JSON.stringify(this._centers()));
  }

  setCityFilter(city: string): void {
    this._selectedCity.set(city);
  }

  setCategoryFilter(cat: string): void {
    this._selectedCategory.set(cat);
  }

  setSearchQuery(q: string): void {
    this._searchQuery.set(q);
  }

  getCenterById(id: string): Provider | undefined {
    return this._centers().find(c => c.id === id);
  }

  // Center Portal: Add or Update Center Service
  async saveCenterService(providerId: string, service: Partial<CenterService>): Promise<void> {
    this._centers.update(list =>
      list.map(c => {
        if (c.id === providerId) {
          const currentServices = c.center_services || [];
          let updatedServices: CenterService[];

          if (service.id) {
            updatedServices = currentServices.map(s => (s.id === service.id ? { ...s, ...service } as CenterService : s));
          } else {
            const newSrv: CenterService = {
              id: 'cs-' + Date.now(),
              provider_id: providerId,
              service_name: service.service_name || 'خدمة جديدة',
              description: service.description || '',
              price_from: Number(service.price_from) || 500,
              price_to: Number(service.price_to) || 1000,
              is_active: true,
              category: service.category || 'hair'
            };
            updatedServices = [...currentServices, newSrv];
          }
          return { ...c, center_services: updatedServices };
        }
        return c;
      })
    );
    this.saveCenters();
  }

  async deleteCenterService(providerId: string, serviceId: string): Promise<void> {
    this._centers.update(list =>
      list.map(c => {
        if (c.id === providerId && c.center_services) {
          return {
            ...c,
            center_services: c.center_services.filter(s => s.id !== serviceId)
          };
        }
        return c;
      })
    );
    this.saveCenters();
  }
}
