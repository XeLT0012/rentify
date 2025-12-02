import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home';
import { LoginComponent } from './pages/login';
import { RegisterComponent } from './pages/register';
import { UserDashboardComponent } from './pages/user-dashboard';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard';
import { ListingsComponent } from './pages/listings';
import { AddListingComponent } from './pages/add-listing';
import { ProfileComponent } from './pages/profile';
import { BookingPageComponent  } from './pages/booking-page';
import { MyBookingsComponent } from './pages/my-bookings';
import { CheckoutComponent } from './pages/checkout';

import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

import { NotFoundComponent } from './pages/not-found';
import { ResetPasswordComponent } from './auth/reset-password/reset-password';


export const routes: Routes = [
    { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard, roleGuard('admin')] },
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [authGuard, roleGuard('user')] },
  { path: 'listings', component: ListingsComponent, canActivate: [authGuard, roleGuard('user')] },
  { path: 'add-listing', component: AddListingComponent, canActivate: [authGuard, roleGuard('user')] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard, roleGuard('user')] },
  { path: 'booking/:id', component: BookingPageComponent , canActivate: [authGuard, roleGuard('user')] },
  { path: 'bookings', component: MyBookingsComponent , canActivate: [authGuard, roleGuard('user')] },
  { path: 'checkout', component: CheckoutComponent , canActivate: [authGuard, roleGuard('user')] },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: '**', component: NotFoundComponent } // ✅ Catch-all 404
];
