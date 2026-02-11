import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private API = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient, private router: Router) {}

  login(correo: string, password: string) {
    return this.http.post<any>(`${this.API}/auth/login`, { correo, password });
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getRol(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const decoded: any = jwtDecode(token);
    return (decoded.role ?? decoded.rol ?? '').toUpperCase() || null;
  }

  getUsuarioActual(): any {
    const data = localStorage.getItem('usuarioActual');
    return data ? JSON.parse(data) : null;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioActual');
    this.router.navigate(['/login']);
  }

  isLogged(): boolean {
    return !!this.getToken();
  }
}
