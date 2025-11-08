import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home';
import { LoginComponent } from './pages/login';
import { RegisterComponent } from './pages/register';
import { UserDashboardComponent } from './pages/user-dashboard';
import { AdminDashboardComponent } from './pages/admin-dashboard';
import { ListingsComponent } from './pages/listings';

import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

import { NotFound } from './pages/not-found';

export const routes: Routes = [
    { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [authGuard, roleGuard('user')] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard, roleGuard('admin')] },
  { path: 'listings', component: ListingsComponent, canActivate: [authGuard, roleGuard('user')] },
  { path: '**', component: NotFound } // ✅ Catch-all 404
];
