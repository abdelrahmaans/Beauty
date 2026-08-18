import { Injectable, signal, computed } from '@angular/core';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Profile, UserRole } from '../models';
import { MOCK_CUSTOMER_PROFILE, MOCK_ADMIN_PROFILE } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Reactive Signals for State
  private _currentUser = signal<User | null>(null);
  private _profile = signal<Profile | null>(null);
  private _isLoading = signal<boolean>(false);
  private _isInitialized = signal<boolean>(false);

  // Public readonly computed signals
  readonly currentUser = this._currentUser.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isInitialized = this._isInitialized.asReadonly();

  readonly isAuthenticated = computed(() => !!this._profile());
  readonly isAdmin = computed(() => this._profile()?.role === 'admin');
  readonly userRole = computed<UserRole>(() => this._profile()?.role ?? 'customer');
  readonly loyaltyPoints = computed(() => this._profile()?.loyalty_points ?? 0);

  constructor(private supabase: SupabaseService) {
    this.initAuth();
  }

  private async initAuth(): Promise<void> {
    const client = this.supabase.client;
    if (client) {
      const { data } = await client.auth.getSession();
      if (data?.session?.user) {
        this._currentUser.set(data.session.user);
        await this.loadProfile(data.session.user.id);
      }

      client.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          this._currentUser.set(session.user);
          await this.loadProfile(session.user.id);
        } else {
          this._currentUser.set(null);
          this._profile.set(null);
        }
      });
    } else {
      // Check localStorage for offline demo auth
      const savedProfile = localStorage.getItem('beauty_demo_profile');
      if (savedProfile) {
        try {
          this._profile.set(JSON.parse(savedProfile));
        } catch {
          this._profile.set(null);
        }
      }
    }
    this._isInitialized.set(true);
  }

  private async loadProfile(userId: string): Promise<void> {
    const client = this.supabase.client;
    if (!client) return;

    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        this._profile.set(data as Profile);
      }
    } catch (e) {
      console.error('Error fetching profile from Supabase:', e);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        this._isLoading.set(false);
        if (error) return { success: false, error: error.message };
        if (data.user) {
          await this.loadProfile(data.user.id);
        }
        return { success: true };
      } catch (err: any) {
        this._isLoading.set(false);
        return { success: false, error: err.message || 'حدث خطأ أثناء تسجيل الدخول' };
      }
    } else {
      // Demo authentication simulation
      await new Promise(r => setTimeout(r, 400));
      this._isLoading.set(false);

      if (email.includes('admin')) {
        this._profile.set(MOCK_ADMIN_PROFILE);
        localStorage.setItem('beauty_demo_profile', JSON.stringify(MOCK_ADMIN_PROFILE));
      } else {
        const customProfile: Profile = {
          ...MOCK_CUSTOMER_PROFILE,
          full_name: email.split('@')[0] || 'عميل المتجر',
        };
        this._profile.set(customProfile);
        localStorage.setItem('beauty_demo_profile', JSON.stringify(customProfile));
      }
      return { success: true };
    }
  }

  async signUp(email: string, password: string, fullName: string, phone?: string): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, phone: phone || '' }
          }
        });
        this._isLoading.set(false);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        this._isLoading.set(false);
        return { success: false, error: err.message || 'فشل في إنشاء الحساب' };
      }
    } else {
      await new Promise(r => setTimeout(r, 400));
      const newProfile: Profile = {
        id: 'usr-' + Date.now(),
        full_name: fullName,
        phone: phone || '',
        role: 'customer',
        loyalty_points: 50, // Welcome points
        city: 'القاهرة'
      };
      this._profile.set(newProfile);
      localStorage.setItem('beauty_demo_profile', JSON.stringify(newProfile));
      this._isLoading.set(false);
      return { success: true };
    }
  }

  async signOut(): Promise<void> {
    const client = this.supabase.client;
    if (client) {
      await client.auth.signOut();
    }
    this._currentUser.set(null);
    this._profile.set(null);
    localStorage.removeItem('beauty_demo_profile');
  }

  // Quick switch for demo/testing between Customer and Admin
  switchDemoRole(role: 'admin' | 'customer'): void {
    const target = role === 'admin' ? MOCK_ADMIN_PROFILE : MOCK_CUSTOMER_PROFILE;
    this._profile.set(target);
    localStorage.setItem('beauty_demo_profile', JSON.stringify(target));
  }

  updateProfileData(updated: Partial<Profile>): void {
    const current = this._profile();
    if (current) {
      const merged = { ...current, ...updated };
      this._profile.set(merged);
      localStorage.setItem('beauty_demo_profile', JSON.stringify(merged));
    }
  }
}
