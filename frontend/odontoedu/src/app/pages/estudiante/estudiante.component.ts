import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

type EstadoSolicitud = 'PENDIENTE' | 'APROBADO' | 'DENEGADO';

interface Materia {
  id: number;
  nombre: string;
  procedimientos: Procedimiento[];
}

interface Procedimiento {
  id: number;
  nombre: string;
  requerido: number;
  aprobados: number;
}

@Component({
  selector: 'app-estudiante',
  standalone: false,
  templateUrl: './estudiante.component.html',
  styleUrls: ['./estudiante.component.css']
})
export class Estudiante implements OnInit {
  cargando = false;
  error = '';
  userRol: string = '';
  usuarioActual: any = null;
  miProfesor: any = null;

  materias: Materia[] = [
    {
      id: 1,
      nombre: 'Odontología 1',
      procedimientos: [{ id: 101, nombre: 'Operatoria básica', requerido: 5, aprobados: 0 }]
    },
  ];

  totalAprobados = 0;
  totalRequeridos = 5;

  solicitudesAprobadas: any[] = [];
  solicitudesPendientes: any[] = [];
  solicitudesDenegadas: any[] = [];

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.auth.getUsuarioActual();
    this.cargarProgreso();
    this.cargarMiProfesor();
  }

  cargarMiProfesor() {
    this.api.getMiProfesor().subscribe({
      next: (res: any) => {
        this.miProfesor = res;
        this.cdr.detectChanges();
      },
      error: () => {
        this.miProfesor = null;
      }
    });
  }

  cerrarSesion() {
    this.auth.logout();
  }

  cargarProgreso() {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    // Usar /solicitudes/me para obtener las solicitudes del estudiante
    this.api.getSolicitudesMe().subscribe({
      next: (solicitudes: any[]) => {
        const todas = solicitudes || [];

        this.solicitudesAprobadas = todas.filter((s: any) =>
          (s.estado || '').toUpperCase() === 'APROBADO'
        );
        this.solicitudesPendientes = todas.filter((s: any) =>
          (s.estado || '').toUpperCase() === 'PENDIENTE'
        );
        this.solicitudesDenegadas = todas.filter((s: any) =>
          (s.estado || '').toUpperCase() === 'DENEGADO'
        );

        // Cada solicitud aprobada cuenta como 1 procedimiento completado
        this.totalAprobados = Math.min(this.solicitudesAprobadas.length, this.totalRequeridos);

        // Actualizar materias con el conteo real
        this.materias = this.materias.map(m => ({
          ...m,
          procedimientos: m.procedimientos.map(p => ({
            ...p,
            aprobados: this.solicitudesAprobadas.length
          }))
        }));

        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar el progreso';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  irAGestionPacientes() {
    this.router.navigate(['/pacientes-estudiante']);
  }

  calcularPorcentajeMateria(materia: any): number {
    let totalAprobados = 0;
    let totalRequeridos = 0;

    materia.procedimientos.forEach((p: any) => {
      totalAprobados += p.aprobados || 0;
      totalRequeridos += p.requerido || 0;
    });

    if (totalRequeridos === 0) return 0;
    return Math.round((totalAprobados / totalRequeridos) * 100);
  }

  calcularPorcentajeGeneral(): number {
    if (this.totalRequeridos === 0) return 0;
    return Math.round((this.totalAprobados / this.totalRequeridos) * 100);
  }
}
