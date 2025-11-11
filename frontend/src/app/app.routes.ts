import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home';
import { LoginComponent } from './pages/login';
import { RegisterComponent } from './pages/register';
import { UserDashboardComponent } from './pages/user-dashboard';
import { AdminDashboardComponent } from './pages/admin-dashboard';
import { ListingsComponent } from './pages/listings';
import { AddListingComponent } from './pages/add-listing';
import { ProfileComponent } from './pages/profile';

import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';

import { NotFoundComponent } from './pages/not-found';


export const routes: Routes = [
    { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: UserDashboardComponent, canActivate: [authGuard, roleGuard('user')] },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [authGuard, roleGuard('admin')] },
  { path: 'listings', component: ListingsComponent, canActivate: [authGuard, roleGuard('user')] },
  { path: 'add-listing', component: AddListingComponent, canActivate: [authGuard, roleGuard('user')] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard, roleGuard('user')] },
  { path: '**', component: NotFoundComponent } // ✅ Catch-all 404
];
