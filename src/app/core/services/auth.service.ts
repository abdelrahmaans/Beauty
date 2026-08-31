import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Profile, UserRole, UserDashboardContext } from '../models';
import { MOCK_CUSTOMER_PROFILE, MOCK_ADMIN_PROFILE, MOCK_PROVIDER_PROFILE, MOCK_CENTER_PROFILE } from '../mock/mock-data';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser = signal<User | null>(null);
  private _profile = signal<Profile | null>(null);
  private _dashboardContext = signal<UserDashboardContext | null>(null);
  private _isLoading = signal<boolean>(false);
  private _isInitialized = signal<boolean>(false);

  readonly currentUser = this._currentUser.asReadonly();
  readonly profile = this._profile.asReadonly();
  readonly dashboardContext = this._dashboardContext.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isInitialized = this._isInitialized.asReadonly();

  readonly isAuthenticated = computed(() => !!this._currentUser() || !!this._profile());
  readonly isAdmin = computed(() => this._dashboardContext()?.view === 'admin' || this._profile()?.role === 'admin');
  readonly isProvider = computed(() => this._dashboardContext()?.view === 'provider' && this._dashboardContext()?.status !== 'pending');
  readonly isCenter = computed(() => this._dashboardContext()?.view === 'center' && this._dashboardContext()?.status !== 'pending');
  readonly isPendingReview = computed(() => this._dashboardContext()?.status === 'pending');
  readonly userRole = computed<UserRole>(() => {
    const view = this._dashboardContext()?.view;
    if (view === 'admin') return 'admin';
    if (view === 'provider') return 'provider';
    if (view === 'center') return 'center';
    return this._profile()?.role ?? 'customer';
  });
  readonly loyaltyPoints = computed(() => this._profile()?.loyalty_points ?? 0);

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    this.initAuth();
  }

  private async initAuth(): Promise<void> {
    const client = this.supabase.client;
    if (client) {
      const { data } = await client.auth.getSession();
      if (data?.session?.user) {
        this._currentUser.set(data.session.user);
        await this.loadProfile(data.session.user.id);
        await this.getDashboardContext();
      }

      client.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          this._currentUser.set(session.user);
          await this.loadProfile(session.user.id);
          await this.getDashboardContext();
        } else {
          this._currentUser.set(null);
          this._profile.set(null);
          this._dashboardContext.set(null);
        }
      });
    } else {
      const savedUser = localStorage.getItem('beauty_active_user');
      const savedCtx = localStorage.getItem('beauty_active_context');
      if (savedUser && savedCtx) {
        try {
          this._profile.set(JSON.parse(savedUser));
          this._dashboardContext.set(JSON.parse(savedCtx));
        } catch {
          this._profile.set(null);
          this._dashboardContext.set(null);
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

  // 1. Get real context and role routing from Supabase RPC get_my_dashboard_context()
  async getDashboardContext(): Promise<UserDashboardContext | null> {
    const client = this.supabase.client;

    if (client && (this._currentUser() || this._profile())) {
      try {
        const { data, error } = await client.rpc('get_my_dashboard_context');
        if (data && !error) {
          const ctx = data as UserDashboardContext;
          this._dashboardContext.set(ctx);
          localStorage.setItem('beauty_active_context', JSON.stringify(ctx));
          return ctx;
        }
      } catch (err) {
        console.warn('RPC get_my_dashboard_context fallback to direct query:', err);
      }

      // Fallback direct check if RPC isn't deployed yet
      const userId = this._currentUser()?.id || this._profile()?.id;
      if (userId) {
        if (this._profile()?.role === 'admin') {
          const ctx: UserDashboardContext = { view: 'admin', status: 'verified' };
          this._dashboardContext.set(ctx);
          return ctx;
        }

        const { data: prov } = await client
          .from('providers')
          .select('id, type, status')
          .eq('user_id', userId)
          .maybeSingle();

        if (prov) {
          const ctx: UserDashboardContext = {
            view: prov.type === 'freelancer' ? 'provider' : 'center',
            provider_id: prov.id,
            status: prov.status
          };
          this._dashboardContext.set(ctx);
          return ctx;
        }
      }
    }

    if (this._profile()) {
      const role = this._profile()!.role;
      const ctx: UserDashboardContext = {
        view: role === 'admin' ? 'admin' : (role === 'provider' ? 'provider' : (role === 'center' ? 'center' : 'customer')),
        status: 'verified'
      };
      this._dashboardContext.set(ctx);
      return ctx;
    }

    return null;
  }

  // 2. Real Sign In
  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; context?: UserDashboardContext; error?: string }> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) {
          this._isLoading.set(false);
          return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
        }

        if (data.user) {
          this._currentUser.set(data.user);
          await this.loadProfile(data.user.id);
          const ctx = await this.getDashboardContext();
          this._isLoading.set(false);
          return { success: true, context: ctx || { view: 'customer', status: 'verified' } };
        }
      } catch (err: any) {
        this._isLoading.set(false);
        return { success: false, error: err.message || 'حدث خطأ أثناء تسجيل الدخول' };
      }
    }

    // Demo/Development fallback simulation for accounts
    await new Promise(r => setTimeout(r, 300));
    this._isLoading.set(false);

    let profile: Profile;
    let context: UserDashboardContext;

    if (email.includes('admin')) {
      profile = MOCK_ADMIN_PROFILE;
      context = { view: 'admin', status: 'verified' };
    } else if (email.includes('center') || email.includes('letoile')) {
      profile = MOCK_CENTER_PROFILE;
      context = { view: 'center', status: 'verified' };
    } else if (email.includes('pending')) {
      profile = { ...MOCK_PROVIDER_PROFILE, full_name: 'أخصائية قيد المراجعة' };
      context = { view: 'provider', status: 'pending' };
    } else if (email.includes('provider') || email.includes('omneya')) {
      profile = MOCK_PROVIDER_PROFILE;
      context = { view: 'provider', status: 'verified' };
    } else {
      profile = { ...MOCK_CUSTOMER_PROFILE, full_name: email.split('@')[0] || 'عميلة المتجر' };
      context = { view: 'customer', status: 'verified' };
    }

    this._profile.set(profile);
    this._dashboardContext.set(context);
    localStorage.setItem('beauty_active_user', JSON.stringify(profile));
    localStorage.setItem('beauty_active_context', JSON.stringify(context));

    return { success: true, context };
  }

  // 3. Customer Sign Up (Strictly Customers Only)
  async signUpCustomer(payload: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    city: string;
  }): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data, error } = await client.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              full_name: payload.fullName,
              phone: payload.phone,
              city: payload.city,
              role: 'customer'
            }
          }
        });

        this._isLoading.set(false);
        if (error) return { success: false, error: error.message };

        if (data.user) {
          this._currentUser.set(data.user);
          await this.loadProfile(data.user.id);
          this._dashboardContext.set({ view: 'customer', status: 'verified' });
        }
        return { success: true };
      } catch (err: any) {
        this._isLoading.set(false);
        return { success: false, error: err.message || 'فشل في إنشاء الحساب' };
      }
    }

    // Local fallback
    await new Promise(r => setTimeout(r, 300));
    const newProfile: Profile = {
      id: 'usr-' + Date.now(),
      full_name: payload.fullName,
      phone: payload.phone,
      city: payload.city,
      role: 'customer',
      loyalty_points: 50
    };
    this._profile.set(newProfile);
    this._dashboardContext.set({ view: 'customer', status: 'verified' });
    localStorage.setItem('beauty_active_user', JSON.stringify(newProfile));
    localStorage.setItem('beauty_active_context', JSON.stringify(this._dashboardContext()));
    this._isLoading.set(false);
    return { success: true };
  }

  // 4. Apply as Freelancer Provider (/apply/provider)
  async applyAsProvider(payload: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    city: string;
    specialties: string[];
    bio: string;
  }): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data: authData, error: authError } = await client.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              full_name: payload.fullName,
              phone: payload.phone,
              city: payload.city,
              role: 'customer' // Base profile is customer; provider table record designates role
            }
          }
        });

        if (authError || !authData.user) {
          this._isLoading.set(false);
          return { success: false, error: authError?.message || 'فشل في إنشاء الحساب' };
        }

        // Insert into providers table as 'freelancer' with 'pending' status
        const { data: provData, error: provError } = await client.from('providers').insert([{
          user_id: authData.user.id,
          type: 'freelancer',
          status: 'pending',
          display_name: payload.fullName,
          phone: payload.phone,
          city: payload.city,
          specialties: payload.specialties,
          bio: payload.bio,
          is_available: false
        }]).select().single();

        this._currentUser.set(authData.user);
        await this.loadProfile(authData.user.id);
        const ctx: UserDashboardContext = {
          view: 'provider',
          provider_id: provData?.id,
          status: 'pending'
        };
        this._dashboardContext.set(ctx);
        this._isLoading.set(false);
        return { success: true };
      } catch (err: any) {
        this._isLoading.set(false);
        return { success: false, error: err.message || 'فشل في تقديم الطلب' };
      }
    }

    // Local fallback
    await new Promise(r => setTimeout(r, 400));
    const newProfile: Profile = {
      id: 'usr-prov-' + Date.now(),
      full_name: payload.fullName,
      phone: payload.phone,
      city: payload.city,
      role: 'provider',
      loyalty_points: 0
    };
    const ctx: UserDashboardContext = { view: 'provider', status: 'pending' };
    this._profile.set(newProfile);
    this._dashboardContext.set(ctx);
    localStorage.setItem('beauty_active_user', JSON.stringify(newProfile));
    localStorage.setItem('beauty_active_context', JSON.stringify(ctx));
    this._isLoading.set(false);
    return { success: true };
  }

  // 5. Apply as Partner Center (/apply/center)
  async applyAsCenter(payload: {
    email: string;
    password: string;
    centerName: string;
    phone: string;
    city: string;
    addressLine: string;
    specialties: string[];
    bio: string;
    openingHours?: string;
    proposedDiscount?: number;
  }): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { data: authData, error: authError } = await client.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              full_name: payload.centerName,
              phone: payload.phone,
              city: payload.city,
              role: 'customer'
            }
          }
        });

        if (authError || !authData.user) {
          this._isLoading.set(false);
          return { success: false, error: authError?.message || 'فشل في إنشاء الحساب' };
        }

        // Insert into providers table as 'center' with 'pending' status
        const { data: centerData, error: centerError } = await client.from('providers').insert([{
          user_id: authData.user.id,
          type: 'center',
          status: 'pending',
          display_name: payload.centerName,
          phone: payload.phone,
          city: payload.city,
          address_line: payload.addressLine,
          specialties: payload.specialties,
          bio: payload.bio,
          opening_hours: payload.openingHours || 'يومياً من 10 ص حتى 10 م',
          is_available: false
        }]).select().single();

        this._currentUser.set(authData.user);
        await this.loadProfile(authData.user.id);
        const ctx: UserDashboardContext = {
          view: 'center',
          provider_id: centerData?.id,
          status: 'pending'
        };
        this._dashboardContext.set(ctx);
        this._isLoading.set(false);
        return { success: true };
      } catch (err: any) {
        this._isLoading.set(false);
        return { success: false, error: err.message || 'فشل في تقديم طلب المركز' };
      }
    }

    // Local fallback
    await new Promise(r => setTimeout(r, 400));
    const newProfile: Profile = {
      id: 'usr-center-' + Date.now(),
      full_name: payload.centerName,
      phone: payload.phone,
      city: payload.city,
      role: 'center',
      loyalty_points: 0
    };
    const ctx: UserDashboardContext = { view: 'center', status: 'pending' };
    this._profile.set(newProfile);
    this._dashboardContext.set(ctx);
    localStorage.setItem('beauty_active_user', JSON.stringify(newProfile));
    localStorage.setItem('beauty_active_context', JSON.stringify(ctx));
    this._isLoading.set(false);
    return { success: true };
  }

  // 6. Forgot / Reset Password
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    if (client) {
      try {
        const { error } = await client.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/login'
        });
        this._isLoading.set(false);
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        this._isLoading.set(false);
        return { success: false, error: err.message || 'فشل في إرسال رابط الاستعادة' };
      }
    }

    await new Promise(r => setTimeout(r, 400));
    this._isLoading.set(false);
    return { success: true };
  }

  // 7. Sign Out
  async signOut(): Promise<void> {
    const client = this.supabase.client;
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    this._currentUser.set(null);
    this._profile.set(null);
    this._dashboardContext.set(null);
    localStorage.removeItem('beauty_active_user');
    localStorage.removeItem('beauty_active_context');
    this.router.navigate(['/login']);
  }

  updateProfileData(updated: Partial<Profile>): void {
    const current = this._profile();
    if (current) {
      const merged = { ...current, ...updated };
      this._profile.set(merged);
      localStorage.setItem('beauty_active_user', JSON.stringify(merged));
    }
  }
}
