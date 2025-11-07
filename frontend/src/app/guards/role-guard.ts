import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const roleGuard = (expectedRole: string): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn() && auth.getRole() === expectedRole) {
    return true;
  } else {
    router.navigate(['/login']);
    return false;
  }
};
