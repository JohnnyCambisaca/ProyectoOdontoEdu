import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profesor',
  standalone: false,
  templateUrl: './profesor.component.html',
  styleUrls: ['./profesor.component.css']
})
export class Profesor implements OnInit {

  usuarioActual: any = null;

  // SOLICITUDES PENDIENTES
  cargandoSolicitudes = false;
  errorSolicitudes = '';
  solicitudes: any[] = [];
  aprobando = false;
  denegando = false;

  // HISTORIAL
  solicitudesHistorial: any[] = [];
  cargandoHistorial = false;

  // ESTUDIANTES ASIGNADOS + SUS PACIENTES
  cargandoEstudiantes = false;
  errorEstudiantes = '';
  estudiantes: any[] = [];
  cargandoPacientes = false;
  errorPacientes = '';
  pacientes: any[] = [];
  pacientesPorEstudiante: { [key: string]: any[] } = {};
  estudianteExpandidoId: number | null = null;

  // MODAL
  modalDetalleAbierto = false;
  pacienteSeleccionadoId: number | null = null;
  historiaForm: any = null;
  odontograma: any[] = [];
  tratamientos: any[] = [];
  mapaEstudiantes: { [key: string]: any } = {};
  estudianteSolicitud: any = null;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.auth.getUsuarioActual();
    this.recargarTodo();
  }

  cerrarSesion() {
    this.auth.logout();
  }

  recargarTodo() {
    this.cargarSolicitudesPendientes();
    this.cargarHistorialSolicitudes();
    this.cargarEstudiantesYPacientes();
  }

  // =====================
  // SOLICITUDES PENDIENTES (solo de mis estudiantes - filtrado en backend)
  // =====================
  cargarSolicitudesPendientes() {
    this.cargandoSolicitudes = true;
    this.errorSolicitudes = '';
    this.cdr.detectChanges();

    this.api.getSolicitudesPendientesProfesor().subscribe({
      next: (res: any) => {
        this.solicitudes = Array.isArray(res) ? res : (res?.data ?? []);
        this.cargandoSolicitudes = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorSolicitudes = 'No se pudieron cargar las solicitudes.';
        this.solicitudes = [];
        this.cargandoSolicitudes = false;
        this.cdr.detectChanges();
      }
    });
  }

  aprobarSolicitud(s: any) {
    if (!s?.id_solicitud) return;
    this.aprobando = true;

    this.api.aprobarSolicitud(s.id_solicitud).subscribe({
      next: () => {
        this.aprobando = false;
        this.cargarSolicitudesPendientes();
        this.cargarHistorialSolicitudes();
      },
      error: () => {
        alert('Error al aprobar solicitud');
        this.aprobando = false;
        this.cdr.detectChanges();
      }
    });
  }

  denegarSolicitud(s: any) {
    if (!s?.id_solicitud) return;
    this.denegando = true;

    this.api.denegarSolicitud(s.id_solicitud).subscribe({
      next: () => {
        this.denegando = false;
        this.cargarSolicitudesPendientes();
        this.cargarHistorialSolicitudes();
      },
      error: () => {
        alert('Error al denegar solicitud');
        this.denegando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // =====================
  // HISTORIAL (solo de mis estudiantes - filtrado en backend)
  // =====================
  cargarHistorialSolicitudes() {
    this.cargandoHistorial = true;
    this.cdr.detectChanges();

    this.api.getSolicitudesTodas().subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : (res?.data ?? []);
        this.solicitudesHistorial = data.filter((s: any) => {
          const estado = (s?.estado || '').toUpperCase();
          return estado.includes('APROBADO') || estado.includes('DENEGADO');
        });
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.solicitudesHistorial = [];
        this.cargandoHistorial = false;
        this.cdr.detectChanges();
      }
    });
  }

  // =====================
  // ESTUDIANTES ASIGNADOS + SUS PACIENTES
  // Usa /asignaciones/mis-estudiantes y /asignaciones/mis-pacientes
  // =====================
  cargarEstudiantesYPacientes() {
    this.cargandoEstudiantes = true;
    this.cargandoPacientes = true;
    this.errorEstudiantes = '';
    this.errorPacientes = '';
    this.cdr.detectChanges();

    // Solo mis estudiantes asignados
    this.api.getMisEstudiantes().subscribe({
      next: (est: any) => {
        this.estudiantes = Array.isArray(est) ? est : [];
        this.cargandoEstudiantes = false;

        this.estudiantes.forEach((e: any) => {
          this.mapaEstudiantes[e.id_usuario] = e;
        });

        // Solo pacientes de mis estudiantes
        this.api.getMisPacientes().subscribe({
          next: (pac: any) => {
            this.pacientes = Array.isArray(pac) ? pac : [];
            this.cargandoPacientes = false;
            this.calcularPacientesPorEstudiante();
            this.cdr.detectChanges();
          },
          error: () => {
            this.errorPacientes = 'No se pudieron cargar pacientes.';
            this.cargandoPacientes = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: () => {
        this.errorEstudiantes = 'No se pudieron cargar estudiantes.';
        this.cargandoEstudiantes = false;
        this.cargandoPacientes = false;
        this.cdr.detectChanges();
      }
    });
  }

  calcularPacientesPorEstudiante() {
    const mapa: { [key: string]: any[] } = {};

    for (const e of this.estudiantes) {
      if (e?.id_usuario) mapa[String(e.id_usuario)] = [];
    }

    for (const p of this.pacientes) {
      const eid = p?.estudiante_id ?? p?.creado_por;
      if (!eid) continue;
      const key = String(eid);
      if (!mapa[key]) mapa[key] = [];
      mapa[key].push(p);
    }

    this.pacientesPorEstudiante = mapa;
  }

  toggleEstudiante(e: any): void {
    this.estudianteExpandidoId =
      this.estudianteExpandidoId === e.id_usuario ? null : e.id_usuario;
  }

  contarPacientesEstudiante(id: number): number {
    return this.pacientesPorEstudiante?.[String(id)]?.length ?? 0;
  }

  nombreCompleto(u: any): string {
    return ((u?.nombre ?? '') + ' ' + (u?.apellido ?? '')).trim();
  }

  // =====================
  // MODAL DETALLE
  // =====================
  verDetalleSolicitud(s: any) {
    if (!s?.paciente_id) return;

    this.pacienteSeleccionadoId = s.paciente_id;
    this.estudianteSolicitud = this.mapaEstudiantes[String(s.estudiante_id)] || null;

    this.api.getHistoriaPaciente(s.paciente_id).subscribe({
      next: (res: any) => {
        this.historiaForm = Array.isArray(res) && res.length > 0 ? res[0] : null;
        this.modalDetalleAbierto = true;
        this.cdr.detectChanges();
      },
      error: () => { this.historiaForm = null; this.cdr.detectChanges(); }
    });

    this.api.getOdontogramaPaciente(s.paciente_id).subscribe({
      next: (res: any) => { this.odontograma = Array.isArray(res) ? res : []; this.cdr.detectChanges(); },
      error: () => { this.odontograma = []; this.cdr.detectChanges(); }
    });

    this.api.getTratamientosPaciente(s.paciente_id).subscribe({
      next: (res: any) => { this.tratamientos = Array.isArray(res) ? res : []; this.cdr.detectChanges(); },
      error: () => { this.tratamientos = []; this.cdr.detectChanges(); }
    });
  }

  cerrarModalDetalle() {
    this.modalDetalleAbierto = false;
    this.pacienteSeleccionadoId = null;
    this.historiaForm = null;
    this.odontograma = [];
    this.tratamientos = [];
  }
}
