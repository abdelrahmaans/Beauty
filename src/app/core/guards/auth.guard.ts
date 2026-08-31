import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedViews: string[]): CanActivateFn => {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (!auth.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const context = await auth.getDashboardContext();

    if (!context) {
      router.navigate(['/login']);
      return false;
    }

    // If application is pending review, redirect to pending page
    if (context.status === 'pending' && (context.view === 'provider' || context.view === 'center')) {
      router.navigate(['/pending-review']);
      return false;
    }

    if (!allowedViews.includes(context.view)) {
      // Redirect to appropriate screen
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
