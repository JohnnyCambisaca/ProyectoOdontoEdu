import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class Login {

  correo = '';
  password = '';
  error = '';
  loading = false;
  mostrarPass = false;

  logoUrl = 'assets/logo.png';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.error = '';
    this.loading = true;

    this.auth.login(this.correo, this.password)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res: any) => {
          const token = res?.access_token;
          if (!token) {
            this.error = 'El servidor no devolvió token.';
            return;
          }

          this.auth.saveToken(token);

          // Guardar datos del usuario para mostrar nombre en paneles
          if (res?.usuario) {
            localStorage.setItem('usuarioActual', JSON.stringify(res.usuario));
          }

          const rol = this.auth.getRol();
          if (rol === 'ADMIN') this.router.navigate(['/admin']);
          else if (rol === 'PROFESOR') this.router.navigate(['/profesor']);
          else this.router.navigate(['/estudiante']);
        },
        error: (err) => {
          const detail = err?.error?.detail;
          if (typeof detail === 'string') {
            this.error = detail;
          } else if (Array.isArray(detail)) {
            this.error = detail.map((e: any) => e.msg).join(' | ');
          } else {
            this.error = 'Credenciales inválidas';
          }
          console.error(err);
        }
      });
  }

  year = new Date().getFullYear();
}
