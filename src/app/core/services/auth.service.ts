import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { Profile, UserRole, UserDashboardContext } from '../models';

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

  // isAuthenticated requires a real Supabase user — profile alone (from localStorage) is NOT sufficient
  readonly isAuthenticated = computed(() => !!this._currentUser());
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
    if (!client) {
      // No Supabase connection — clear any stale state and initialize cleanly
      console.warn('[AuthService] Supabase client unavailable. Auth is disabled.');
      this.clearLocalStorage();
      this._isInitialized.set(true);
      return;
    }

    try {
      // [C3 Fix] Always verify real session from Supabase first
      const { data: sessionData, error: sessionError } = await client.auth.getSession();

      if (sessionError || !sessionData?.session?.user) {
        // No real session → clear localStorage so stale context is never used
        this.clearLocalStorage();
      } else {
        const user = sessionData.session.user;
        this._currentUser.set(user);
        // Load profile and context non-blocking
        this.loadProfile(user.id);
        this.getDashboardContext();
      }

      // Subscribe to auth state changes for the session lifetime
      client.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          this._currentUser.set(session.user);
          this.loadProfile(session.user.id);
          // Invalidate cached context on every auth change so it's always fresh
          this._dashboardContext.set(null);
          localStorage.removeItem('beauty_active_context');
          this.getDashboardContext();
        } else {
          // Sign out or session expiry → wipe everything
          this._currentUser.set(null);
          this._profile.set(null);
          this._dashboardContext.set(null);
          this.clearLocalStorage();
        }
      });
    } catch (err) {
      console.warn('[AuthService] initAuth error:', err);
      this.clearLocalStorage();
    }

    this._isInitialized.set(true);
  }

  private clearLocalStorage(): void {
    localStorage.removeItem('beauty_active_user');
    localStorage.removeItem('beauty_active_context');
  }

  // Load profile with automatic fallback/repair if profiles row was not created yet
  private async loadProfile(userId: string): Promise<void> {
    const client = this.supabase.client;
    if (!client) return;

    try {
      // 3.5s timeout guard so this never hangs
      const timeout = new Promise<any>((resolve) => setTimeout(() => resolve({ data: null, error: 'timeout' }), 3500));
      const { data, error } = await Promise.race([
        client.from('profiles').select('*').eq('id', userId).maybeSingle(),
        timeout
      ]);

      if (data && !error) {
        this._profile.set(data as Profile);
        localStorage.setItem('beauty_active_user', JSON.stringify(data));
      } else {
        // Automatically repair profile from user metadata if trigger hasn't run
        const userMeta = this._currentUser()?.user_metadata || {};
        const repairedProfile: Profile = {
          id: userId,
          full_name: userMeta['full_name'] || this._currentUser()?.email?.split('@')[0] || 'عميلة المتجر',
          phone: userMeta['phone'] || '',
          role: (userMeta['role'] as UserRole) || 'customer',
          city: userMeta['city'] || 'القاهرة',
          loyalty_points: 50
        };

        try {
          const { error: upErr } = await client.from('profiles').upsert([repairedProfile]);
          if (upErr && upErr.message?.includes('city')) {
            const { city, ...withoutCity } = repairedProfile;
            await client.from('profiles').upsert([withoutCity]);
          }
        } catch (upErr) {
          console.warn('Could not upsert profile directly:', upErr);
        }

        this._profile.set(repairedProfile);
        localStorage.setItem('beauty_active_user', JSON.stringify(repairedProfile));
      }
    } catch (e) {
      console.error('Error fetching profile from Supabase:', e);
    }
  }

  // 1. Get real context and role routing
  // [C3 Fix] localStorage is ONLY used as a fast-path cache when a real Supabase user is already confirmed.
  //          The cache is invalidated on every auth state change and on initAuth if no real session exists.
  async getDashboardContext(): Promise<UserDashboardContext | null> {
    // Fast path: signal already set in this session
    const existing = this._dashboardContext();
    if (existing) return existing;

    // Must have a real authenticated Supabase user to use any cached context
    if (!this._currentUser()) {
      this.clearLocalStorage();
      return null;
    }

    // Fast path: use localStorage cache only if we have a confirmed real user
    const saved = localStorage.getItem('beauty_active_context');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as UserDashboardContext;
        this._dashboardContext.set(parsed);
        return parsed;
      } catch {
        localStorage.removeItem('beauty_active_context');
      }
    }

    const client = this.supabase.client;
    if (!client) return null;

    const userId = this._currentUser()!.id;

    // Try the RPC function first (preferred — single DB round-trip)
    try {
      const rpcTimeout = new Promise<any>((resolve) =>
        setTimeout(() => resolve({ data: null, error: 'timeout' }), 3000)
      );
      const { data, error } = await Promise.race([
        client.rpc('get_my_dashboard_context'),
        rpcTimeout
      ]);

      if (data && !error) {
        const ctx = data as UserDashboardContext;
        this._dashboardContext.set(ctx);
        localStorage.setItem('beauty_active_context', JSON.stringify(ctx));
        return ctx;
      }
    } catch (err) {
      console.warn('[AuthService] RPC get_my_dashboard_context failed, using direct fallback:', err);
    }

    // Direct fallback: check profile role then providers table
    const currentProfile = this._profile();
    if (currentProfile?.role === 'admin') {
      const ctx: UserDashboardContext = { view: 'admin', status: 'verified' };
      this._dashboardContext.set(ctx);
      localStorage.setItem('beauty_active_context', JSON.stringify(ctx));
      return ctx;
    }

    try {
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
        localStorage.setItem('beauty_active_context', JSON.stringify(ctx));
        return ctx;
      }
    } catch (err) {
      console.warn('[AuthService] providers lookup failed:', err);
    }

    // Final fallback: customer context
    const ctx: UserDashboardContext = { view: 'customer', status: 'verified' };
    this._dashboardContext.set(ctx);
    localStorage.setItem('beauty_active_context', JSON.stringify(ctx));
    return ctx;
  }

  // 2. [C1 Fix] Real Sign In — NO demo fallback. Supabase is required.
  async signInWithEmail(email: string, password: string): Promise<{ success: boolean; context?: UserDashboardContext; error?: string }> {
    this._isLoading.set(true);
    const client = this.supabase.client;
    const cleanEmail = email.trim().toLowerCase();

    try {
      if (!client) {
        return { success: false, error: 'لا يوجد اتصال بقاعدة البيانات. يرجى التحقق من إعدادات التطبيق.' };
      }

      // 8-second timeout safety to avoid perpetual loading
      const timeoutPromise = new Promise<{ data: any; error: any }>((resolve) =>
        setTimeout(() => resolve({
          data: null,
          error: { message: 'انتهت مهلة الاتصال بقاعدة البيانات، يرجى المحاولة مرة أخرى أو التأكد من سرعة الاتصال بالإنترنت.' }
        }), 8000)
      );

      const { data, error } = await Promise.race([
        client.auth.signInWithPassword({ email: cleanEmail, password }),
        timeoutPromise
      ]);

      if (error) {
        console.warn('[AuthService] signIn error:', error);
        let friendlyMsg = error.message;
        if (error.message.includes('Email logins are disabled')) {
          friendlyMsg = 'تسجيل الدخول بالبريد الإلكتروني معطل. يرجى تفعيل (Enable Email provider) من Supabase > Authentication > Providers > Email.';
        } else if (error.message.includes('Email not confirmed')) {
          friendlyMsg = 'البريد الإلكتروني لم يتم تأكيده بعد. يرجى فتح الرسالة المرسلة لبريدك وتفعيل الحساب، أو تعطيل (Confirm email) من Supabase > Authentication > Providers > Email.';
        } else if (error.message.includes('Invalid login credentials')) {
          friendlyMsg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
        } else if (error.message.includes('rate limit')) {
          friendlyMsg = 'تم تجاوز عدد محاولات الدخول المسموح بها مؤقتاً، يرجى الانتظار دقيقة والمحاولة مجدداً.';
        }
        return { success: false, error: friendlyMsg };
      }

      if (data?.user) {
        const userMeta = data.user.user_metadata || {};
        const role = (userMeta['role'] as UserRole) || 'customer';
        const immediateProfile: Profile = {
          id: data.user.id,
          full_name: userMeta['full_name'] || cleanEmail.split('@')[0] || 'عميلة المتجر',
          phone: userMeta['phone'] || '',
          role: role,
          city: userMeta['city'] || '',
          loyalty_points: 0
        };

        this._currentUser.set(data.user);
        this._profile.set(immediateProfile);
        // Clear stale context so getDashboardContext fetches fresh data from Supabase
        this._dashboardContext.set(null);
        localStorage.removeItem('beauty_active_context');
        localStorage.setItem('beauty_active_user', JSON.stringify(immediateProfile));

        // Fetch real dashboard context (profile + providers table)
        const ctx = await this.getDashboardContext();

        return { success: true, context: ctx ?? { view: 'customer', status: 'verified' } };
      }

      return { success: false, error: 'لم يتم التعرف على الحساب. يرجى المحاولة مرة أخرى.' };
    } catch (err: any) {
      console.error('[AuthService] signInWithEmail exception:', err);
      return { success: false, error: err.message || 'حدث خطأ أثناء تسجيل الدخول' };
    } finally {
      this._isLoading.set(false);
    }
  }

  // 3. Customer Sign Up (Strictly Customers Only) with try-finally
  async signUpCustomer(payload: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    city: string;
  }): Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }> {
    this._isLoading.set(true);
    const client = this.supabase.client;
    const cleanEmail = payload.email.trim().toLowerCase();

    try {
      if (client) {
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
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

        if (error) {
          console.warn('Supabase SignUp error:', error);
          let friendly = error.message;
          if (error.message.includes('User already registered')) {
            friendly = 'هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول مباشرة.';
          } else if (error.message.includes('Password should be at least')) {
            friendly = 'يجب ألا تقل كلمة المرور عن 6 أحرف.';
          } else if (error.message.includes('rate limit')) {
            friendly = 'تم تجاوز عدد محاولات التسجيل مؤقتاً، يرجى الانتظار قليلاً أو تعطيل تأكيد البريد من Supabase.';
          }
          return { success: false, error: friendly };
        }

        if (data.user) {
          this._currentUser.set(data.user);

          // If session is present, user is immediately logged in (Confirm Email is OFF)
          if (data.session) {
            await this.loadProfile(data.user.id);
            this._dashboardContext.set({ view: 'customer', status: 'verified' });
            return { success: true };
          } else {
            // Confirm Email is ON in Supabase! Stop loading and inform the user immediately
            return {
              success: true,
              requiresEmailConfirmation: true
            };
          }
        }

        return { success: true };
      }

      // Local fallback
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
      return { success: true };
    } catch (err: any) {
      console.error('signUpCustomer exception:', err);
      return { success: false, error: err.message || 'فشل في إنشاء الحساب' };
    } finally {
      this._isLoading.set(false);
    }
  }

  // 4. Apply as Freelancer Provider (/apply/provider) with try-finally
  async applyAsProvider(payload: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    city: string;
    specialties: string[];
    bio: string;
  }): Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }> {
    this._isLoading.set(true);
    const client = this.supabase.client;
    const cleanEmail = payload.email.trim().toLowerCase();

    try {
      if (client) {
        const { data: authData, error: authError } = await client.auth.signUp({
          email: cleanEmail,
          password: payload.password,
          options: {
            data: {
              full_name: payload.fullName,
              phone: payload.phone,
              city: payload.city,
              role: 'provider'
            }
          }
        });

        if (authError || !authData.user) {
          return { success: false, error: authError?.message || 'فشل في إنشاء الحساب' };
        }

        if (!authData.session) {
          // Email confirmation is on
          return { success: true, requiresEmailConfirmation: true };
        }

        let provId = 'prov-' + Date.now();
        try {
          const { data: provData } = await client.from('providers').insert([{
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
          if (provData?.id) provId = provData.id;
        } catch (provErr) {
          console.warn('Providers insert note:', provErr);
        }

        this._currentUser.set(authData.user);
        this.loadProfile(authData.user.id);
        const ctx: UserDashboardContext = {
          view: 'provider',
          provider_id: provId,
          status: 'pending'
        };
        this._dashboardContext.set(ctx);
        localStorage.setItem('beauty_active_context', JSON.stringify(ctx));
        return { success: true };
      }

      // Local fallback
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
      return { success: true };
    } catch (err: any) {
      console.error('applyAsProvider exception:', err);
      return { success: false, error: err.message || 'فشل في تقديم الطلب' };
    } finally {
      this._isLoading.set(false);
    }
  }

  // 5. Apply as Partner Center (/apply/center) with try-finally
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
  }): Promise<{ success: boolean; requiresEmailConfirmation?: boolean; error?: string }> {
    this._isLoading.set(true);
    const client = this.supabase.client;
    const cleanEmail = payload.email.trim().toLowerCase();

    try {
      if (client) {
        const { data: authData, error: authError } = await client.auth.signUp({
          email: cleanEmail,
          password: payload.password,
          options: {
            data: {
              full_name: payload.centerName,
              phone: payload.phone,
              city: payload.city,
              role: 'center'
            }
          }
        });

        if (authError || !authData.user) {
          return { success: false, error: authError?.message || 'فشل في إنشاء الحساب' };
        }

        if (!authData.session) {
          return { success: true, requiresEmailConfirmation: true };
        }

        let centerId = 'center-' + Date.now();
        try {
          const { data: centerData } = await client.from('providers').insert([{
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
          if (centerData?.id) centerId = centerData.id;
        } catch (centerErr) {
          console.warn('Center insert note:', centerErr);
        }

        this._currentUser.set(authData.user);
        this.loadProfile(authData.user.id);
        const ctx: UserDashboardContext = {
          view: 'center',
          provider_id: centerId,
          status: 'pending'
        };
        this._dashboardContext.set(ctx);
        localStorage.setItem('beauty_active_context', JSON.stringify(ctx));
        return { success: true };
      }

      // Local fallback
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
      return { success: true };
    } catch (err: any) {
      console.error('applyAsCenter exception:', err);
      return { success: false, error: err.message || 'فشل في تقديم طلب المركز' };
    } finally {
      this._isLoading.set(false);
    }
  }

  // 6. Forgot / Reset Password with try-finally
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    this._isLoading.set(true);
    const client = this.supabase.client;

    try {
      if (client) {
        const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: window.location.origin + '/login'
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'فشل في إرسال رابط الاستعادة' };
    } finally {
      this._isLoading.set(false);
    }
  }

  // 7. Sign Out
  async signOut(): Promise<void> {
    const client = this.supabase.client;
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('[AuthService] Sign out error:', e);
      }
    }
    this._currentUser.set(null);
    this._profile.set(null);
    this._dashboardContext.set(null);
    this.clearLocalStorage();
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
