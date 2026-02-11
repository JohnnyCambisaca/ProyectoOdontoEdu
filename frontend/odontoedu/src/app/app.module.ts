import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
// COMPONENTES
import { PacienteDetalle } from './pages/paciente-detalle/paciente-detalle.component';
import { Login } from './pages/login/login.component';
import { Admin } from './pages/admin/admin.component';
import { Profesor } from './pages/profesor/profesor.component';
import { Estudiante } from './pages/estudiante/estudiante.component';
import { Pacientes } from './pages/pacientes/pacientes.component';
import { Odontograma } from './pages/odontograma/odontograma.component';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { PacientesEstudiante } from './pages/pacientes-estudiante/pacientes-estudiante.component';

@NgModule({
  declarations: [
    AppComponent,
    Login,
    Admin,
    Profesor,
    Estudiante,
    Pacientes,
    Odontograma,
    PacientesEstudiante,
    PacienteDetalle
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    CommonModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
