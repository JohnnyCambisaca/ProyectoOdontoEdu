import { Routes } from '@angular/router';
import { Login } from './pages/login/login.component';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirige al login por defecto
];