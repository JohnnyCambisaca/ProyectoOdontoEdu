import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class EstudianteGuard implements CanActivate {

  constructor(private auth: AuthService) {}

  canActivate(): boolean {
    const rol = this.auth.getRol();
    return rol !== null && ['ESTUDIANTE', 'ADMIN'].includes(rol.toUpperCase());
  }
}

