import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class ProfesorGuard implements CanActivate {

  constructor(private auth: AuthService) {}

  canActivate(): boolean {
    const rol = this.auth.getRol();
    return rol !== null && ['PROFESOR', 'ADMIN'].includes(rol);
  }
}