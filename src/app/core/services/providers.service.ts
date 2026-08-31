import { Injectable, signal, computed } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Provider, ProviderDocument, ProviderStatus } from '../models';
import { MOCK_PROVIDERS } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  private _providers = signal<Provider[]>([]);
  private _isLoading = signal<boolean>(false);

  readonly providers = this._providers.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  // Current logged in provider profile if role === 'provider'
  readonly currentProvider = computed(() => {
    const userProfile = this.auth.profile();
    if (!userProfile) return null;
    return this._providers().find(p => p.user_id === userProfile.id || p.display_name === userProfile.full_name) || null;
  });

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) {
    this.loadProviders();
  }

  async loadProviders(): Promise<void> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data, error } = await client
          .from('providers')
          .select('*, documents:provider_documents(*)');

        if (data && !error && data.length > 0) {
          this._providers.set(data as Provider[]);
        } else {
          this._providers.set(MOCK_PROVIDERS);
        }
      } catch {
        this._providers.set(MOCK_PROVIDERS);
      }
    } else {
      const saved = localStorage.getItem('beauty_providers');
      if (saved) {
        try {
          this._providers.set(JSON.parse(saved));
        } catch {
          this._providers.set(MOCK_PROVIDERS);
        }
      } else {
        this._providers.set(MOCK_PROVIDERS);
      }
    }
    this._isLoading.set(false);
  }

  private saveProviders(): void {
    localStorage.setItem('beauty_providers', JSON.stringify(this._providers()));
  }

  getProviderById(id: string): Provider | undefined {
    return this._providers().find(p => p.id === id);
  }

  // Geo-matching algorithm (Client simulation of suggest_providers_for_booking)
  suggestProviders(serviceType: string, customerArea: string, maxDistanceKm: number = 30): Provider[] {
    const candidates = this._providers().filter(p =>
      p.status === 'verified' || p.status === 'trusted'
    );

    // Approximate coordinate mappings for Egyptian key zones
    const areaCoordinates: Record<string, { lat: number; lng: number }> = {
      'التجمع': { lat: 30.0263, lng: 31.4967 },
      'القاهرة الجديدة': { lat: 30.0263, lng: 31.4967 },
      'المعادي': { lat: 29.9602, lng: 31.2569 },
      'مدينة نصر': { lat: 30.0561, lng: 31.3411 },
      'مصر الجديدة': { lat: 30.0894, lng: 31.3285 },
      'الشيخ زايد': { lat: 30.0561, lng: 30.9788 },
      '6 أكتوبر': { lat: 29.9737, lng: 30.9529 },
      'المهندسين': { lat: 30.0531, lng: 31.2056 },
      'الدقي': { lat: 30.0385, lng: 31.2124 },
      'بني سويف': { lat: 29.0661, lng: 31.0994 },
      'المنصورة': { lat: 31.0409, lng: 31.3785 }
    };

    let targetLat = 30.0263;
    let targetLng = 31.4967;

    for (const [key, coords] of Object.entries(areaCoordinates)) {
      if (customerArea.includes(key)) {
        targetLat = coords.lat;
        targetLng = coords.lng;
        break;
      }
    }

    // Calculate Haversine distance
    const scored = candidates.map(provider => {
      const pLat = provider.lat || 30.0263;
      const pLng = provider.lng || 31.4967;

      const dLat = ((pLat - targetLat) * Math.PI) / 180;
      const dLng = ((pLng - targetLng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((targetLat * Math.PI) / 180) *
        Math.cos((pLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = Math.round(6371 * c * 10) / 10; // in km

      const hasSpecialty = provider.specialties.some(s =>
        serviceType.includes(s) || s.includes(serviceType) ||
        (serviceType.includes('شعر') && s.includes('شعر')) ||
        (serviceType.includes('بشرة') && s.includes('بشرة'))
      );

      return {
        ...provider,
        distance_km: distance,
        isSpecialtyMatch: hasSpecialty
      };
    });

    // Rank: Specialty match first, then highest rating, then shortest distance
    return scored.sort((a, b) => {
      if (a.isSpecialtyMatch && !b.isSpecialtyMatch) return -1;
      if (!a.isSpecialtyMatch && b.isSpecialtyMatch) return 1;
      if (b.rating_avg !== a.rating_avg) return b.rating_avg - a.rating_avg;
      return (a.distance_km || 0) - (b.distance_km || 0);
    });
  }

  async registerProvider(payload: {
    displayName: string;
    phone: string;
    city: string;
    specialties: string[];
    bio: string;
    nationalIdFile?: string;
    certificateFile?: string;
  }): Promise<{ success: boolean; providerId?: string; error?: string }> {
    this._isLoading.set(true);
    const userProfile = this.auth.profile();
    const newProvId = 'prov-' + Date.now();

    const newDocs: ProviderDocument[] = [];
    if (payload.nationalIdFile) {
      newDocs.push({
        id: 'doc-' + Date.now(),
        provider_id: newProvId,
        doc_type: 'national_id',
        title: 'بطاقة الرقم القومي (تم الرفع)',
        storage_path: payload.nationalIdFile,
        reviewed: false,
        created_at: new Date().toISOString()
      });
    }
    if (payload.certificateFile) {
      newDocs.push({
        id: 'doc-' + (Date.now() + 1),
        provider_id: newProvId,
        doc_type: 'certificate',
        title: 'شهادة الاعتماد / الخبرة',
        storage_path: payload.certificateFile,
        reviewed: false,
        created_at: new Date().toISOString()
      });
    }

    const newProvider: Provider = {
      id: newProvId,
      user_id: userProfile?.id || ('usr-prov-' + Date.now()),
      type: 'freelancer',
      status: 'pending', // Pending Admin verification
      display_name: payload.displayName,
      phone: payload.phone,
      city: payload.city,
      specialties: payload.specialties,
      bio: payload.bio,
      rating_avg: 5.0,
      rating_count: 0,
      is_available: true,
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
      documents: newDocs,
      created_at: new Date().toISOString()
    };

    const client = this.supabase.client;
    if (client) {
      try {
        await client.from('providers').insert([newProvider]);
      } catch (err) {
        console.warn('Fallback to local storage for provider onboarding:', err);
      }
    }

    this._providers.update(list => [newProvider, ...list]);
    this.saveProviders();

    this.auth.updateProfileData({
      role: 'provider',
      full_name: payload.displayName,
      phone: payload.phone,
      city: payload.city
    });

    this._isLoading.set(false);
    return { success: true, providerId: newProvId };
  }

  async updateProviderStatus(providerId: string, status: ProviderStatus): Promise<void> {
    const client = this.supabase.client;
    if (client) {
      try {
        await client.from('providers').update({ status }).eq('id', providerId);
      } catch {}
    }

    this._providers.update(list =>
      list.map(p => (p.id === providerId ? { ...p, status } : p))
    );
    this.saveProviders();
  }

  async verifyDocument(providerId: string, docId: string): Promise<void> {
    this._providers.update(list =>
      list.map(p => {
        if (p.id === providerId && p.documents) {
          const updatedDocs = p.documents.map(d =>
            d.id === docId ? { ...d, reviewed: true } : d
          );
          return { ...p, documents: updatedDocs, status: 'verified' as ProviderStatus };
        }
        return p;
      })
    );
    this.saveProviders();
  }
}
