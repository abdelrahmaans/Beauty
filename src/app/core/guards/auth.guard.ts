import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserDashboardContext } from '../models';

export const roleGuard = (allowedViews: string[]): CanActivateFn => {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    // Fast synchronous check from cached context first to prevent any routing delays
    let context: UserDashboardContext | null = auth.dashboardContext();

    if (!context) {
      try {
        // Strict 3.5s timeout guard so the router NEVER hangs on a blank screen
        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3500));
        context = await Promise.race([auth.getDashboardContext(), timeoutPromise]);
      } catch (err) {
        console.warn('roleGuard context fetch timeout or error, falling back:', err);
        context = null;
      }
    }

    // If still null, fallback to customer if authenticated
    if (!context) {
      context = { view: 'customer', status: 'verified' };
    }

    // If application is pending review, redirect to pending review screen
    if (context.status === 'pending' && (context.view === 'provider' || context.view === 'center')) {
      router.navigate(['/pending-review']);
      return false;
    }

    if (!allowedViews.includes(context.view)) {
      // Redirect to appropriate portal based on role
      switch (context.view) {
        case 'admin': router.navigate(['/admin']); break;
        case 'provider': router.navigate(['/provider']); break;
        case 'center': router.navigate(['/center']); break;
        default: router.navigate(['/account']); break;
      }
      return false;
    }

    return true;
  };
};

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};

export const adminGuard: CanActivateFn = roleGuard(['admin']);
