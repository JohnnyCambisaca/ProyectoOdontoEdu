import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Login } from './pages/login/login.component';
import { Admin } from './pages/admin/admin.component';
import { Profesor } from './pages/profesor/profesor.component';
import { Estudiante } from './pages/estudiante/estudiante.component';
import { Pacientes } from './pages/pacientes/pacientes.component';
import { Odontograma } from './pages/odontograma/odontograma.component';
import { PacienteDetalle } from './pages/paciente-detalle/paciente-detalle.component';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { ProfesorGuard } from './guards/profesor.guard';
import { EstudianteGuard } from './guards/estudiante.guard';
import { PacientesEstudiante } from './pages/pacientes-estudiante/pacientes-estudiante.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch:'full' },
  { path: 'login', component: Login },
  // ✅ Detalle paciente para TODOS los roles autenticados
  { path: 'paciente/:id', component: PacienteDetalle /*, canActivate: [AuthGuard]*/ },
  { path: 'pacientes-estudiante', component: PacientesEstudiante },
  { path: 'admin', component: Admin, canActivate:[AuthGuard, AdminGuard] },
  { path: 'profesor', component: Profesor, canActivate:[AuthGuard, ProfesorGuard] },
  { path: 'estudiante', component: Estudiante, canActivate:[AuthGuard, EstudianteGuard] },
  { path: 'admin/paciente/:id', component: PacienteDetalle },
  { path: 'paciente-detalle', component: PacienteDetalle },
  { path: 'pacientes', component: Pacientes },//canActivate:[AuthGuard]
  { path: 'odontograma', component: Odontograma },//canActivate:[AuthGuard]
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
