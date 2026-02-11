import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../../services/api.service';

type SeccionAdmin = 'dashboard' | 'pacientes' | 'estudiantes' | 'profesores' | 'asignacion' | 'docente-estudiante';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class Admin implements OnInit {
  seccion: SeccionAdmin = 'dashboard';

  cargando = false;
  error = '';
  ok = '';

  pacientes: any[] = [];
  estudiantes: any[] = [];
  profesores: any[] = [];

  cargandoEstudiantes = false;
  cargandoProfesores = false;

  errorEstudiantes = '';
  errorProfesores = '';

  cargandoPacientes: boolean = false;
  errorPacientes: string = '';

  modalEditarPaciente: boolean = false;
  modalEliminarPaciente: boolean = false;

  pacienteEditando: any = null;
  pacienteEliminar: any = null;

  modalProfesorAbierto = false;

  profEdit: any = {
    id_usuario: null,
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
    activo: true
  };

  // ✅ MODAL EDITAR ESTUDIANTE
  modalEditarEstudiante = false;
  editEstudiante: any = null;

  editEstudianteForm: any = {
    nombre: '',
    apellido: '',
    correo: '',
    password: '',   // opcional
    activo: true
  };

  nuevoPaciente = {
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    direccion: '',
  };

  nuevoEstudiante = {
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
  };

  // ✅ NUEVO – PROFESOR (igual que estudiante)
  nuevoProfesor = {
    nombre: '',
    apellido: '',
    correo: '',
    password: '',
  };

  estudianteExpandidoId: number | null = null;
  pacientesPorEstudiante: { [key: string]: any[] } = {};


  // ======= ASIGNACIÓN DOCENTE-ESTUDIANTE =======
  asignaciones: any[] = [];
  cargandoAsignaciones = false;
  errorAsignaciones = '';
  okAsignaciones = '';

  // Para el formulario de asignar
  profesorSeleccionadoId: number | null = null;
  estudianteParaAsignarId: number | null = null;

  // Estudiantes de un profesor seleccionado
  profesorExpandidoId: number | null = null;
  estudiantesDelProfesor: any[] = [];
  estudiantesPorProfesor: { [key: number]: any[] } = {};

  constructor(
    private api: ApiService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // carga inicial
    this.cargarPacientes();
    this.cargarEstudiantes();
    this.cargarProfesores(); // ✅ agregado
    this.cargarEstudiantesYPaciente();
  }

  ir(sec: SeccionAdmin) {
    this.seccion = sec;
    this.error = '';
    this.ok = '';

    if (sec === 'pacientes') this.cargarPacientes();
    if (sec === 'estudiantes') this.cargarEstudiantes();
    if (sec === 'profesores') this.cargarProfesores(); // ✅ 
    if (sec === 'asignacion') this.cargarEstudiantesYPaciente();
    if (sec === 'docente-estudiante') {
      this.cargarProfesores();
      this.cargarEstudiantes();
      this.cargarAsignaciones();
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  // ---------------- PACIENTES ----------------
  cargarPacientes() {
    this.cargando = true;
    this.error = '';
    this.ok = '';

    this.api.getPacientes()
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: (data: any) => {
          this.pacientes = Array.isArray(data) ? data : (data?.items ?? []);
        },
        error: (err: any) => {
          console.error(err);
          this.error = 'No se pudieron cargar los pacientes.';
        }
      });
  }

  crearPaciente() {
    this.cargando = true;
    this.error = '';
    this.ok = '';

    const payload = { ...this.nuevoPaciente };

    this.api.crearPaciente(payload)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: () => {
          this.ok = 'Paciente creado correctamente.';
          this.nuevoPaciente = { nombre: '', apellido: '', cedula: '', telefono: '', direccion: '' };
          this.cargarPacientes();
        },
        error: (err: any) => {
          console.error(err);
          this.error = 'No se pudo crear paciente.';
        }
      });
  }

    // ----- MODAL EDITAR -----
  abrirModalEditarPaciente(p: any) {
    this.pacienteEditando = { ...p }; // copia segura
    this.modalEditarPaciente = true;
  }

  cerrarModalEditarPaciente() {
    this.modalEditarPaciente = false;
    this.pacienteEditando = null;
  }

  guardarEdicionPaciente() {
    if (!this.pacienteEditando) return;

    const id = this.pacienteEditando.id_paciente || this.pacienteEditando.id;
    if (!id) return;

    this.api.editarPaciente(id, this.pacienteEditando).subscribe({
      next: () => {
        this.cerrarModalEditarPaciente();
        this.cargarPacientes();
      },
      error: (err: any) => {
        console.error(err);
        alert(err?.error?.detail || 'No se pudo editar el paciente');
      }
    });
  }

  // ----- MODAL ELIMINAR -----
  abrirModalEliminarPaciente(p: any) {
    this.pacienteEliminar = p;
    this.modalEliminarPaciente = true;
  }

  cerrarModalEliminarPaciente() {
    this.modalEliminarPaciente = false;
    this.pacienteEliminar = null;
  }

  confirmarEliminarPaciente() {
    if (!this.pacienteEliminar) return;

    const id = this.pacienteEliminar.id_paciente || this.pacienteEliminar.id;
    if (!id) return;

    this.api.eliminarPaciente(id).subscribe({
      next: () => {
        this.cerrarModalEliminarPaciente();
        this.cargarPacientes();
      },
      error: (err: any) => {
        console.error(err);
        alert(err?.error?.detail || 'No se pudo eliminar el paciente');
      }
    });
  }

  // ---------------- ESTUDIANTES ----------------
  crearEstudiante() {
    this.cargando = true;
    this.error = '';
    this.ok = '';

    const payload = {
      nombre: this.nuevoEstudiante.nombre,
      apellido: this.nuevoEstudiante.apellido,
      correo: this.nuevoEstudiante.correo,
      password: this.nuevoEstudiante.password,
      rol: 'ESTUDIANTE',
      activo: 1,
    };

    this.api.crearUsuario(payload)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: () => {
          this.ok = 'Estudiante creado correctamente.';
          this.nuevoEstudiante = { nombre: '', apellido: '', correo: '', password: '' };
          this.cargarEstudiantes();
        },
        error: (err: any) => {
          console.error(err);
          this.error = 'No se pudo crear el estudiante.';
        }
      });
  }

  cargarEstudiantes() {
    this.cargandoEstudiantes = true;
    this.errorEstudiantes = '';

    this.api.getEstudiantes().subscribe({
      next: (data: any) => {
        this.estudiantes = Array.isArray(data) ? data : (data?.items ?? []);
        this.cargandoEstudiantes = false;
      },
      error: (err) => {
        console.error(err);
        this.errorEstudiantes = 'No se pudieron cargar los estudiantes.';
        this.cargandoEstudiantes = false;
      }
    });
  }


  abrirEditarEstudiante(e: any, ev?: Event) {
    if (ev) ev.stopPropagation();
    this.modalEditarEstudiante = true;
    this.editEstudiante = e;

    this.editEstudianteForm = {
      nombre: e?.nombre ?? '',
      apellido: e?.apellido ?? '',
      correo: e?.correo ?? '',
      password: '',
      activo: (e?.activo ?? 1) ? true : false
    };
  }

  cerrarEditarEstudiante() {
    this.modalEditarEstudiante = false;
    this.editEstudiante = null;
  }

  guardarEdicionEstudiante() {
    if (!this.editEstudiante?.id_usuario) return;

    // payload sin password si viene vacío
    const payload: any = {
      nombre: this.editEstudianteForm.nombre,
      apellido: this.editEstudianteForm.apellido,
      correo: this.editEstudianteForm.correo,
      activo: this.editEstudianteForm.activo
    };
    if (this.editEstudianteForm.password && this.editEstudianteForm.password.trim()) {
      payload.password = this.editEstudianteForm.password.trim();
    }

    this.cargando = true;
    this.api.actualizarUsuario(this.editEstudiante.id_usuario, payload).subscribe({
      next: () => {
        this.cerrarEditarEstudiante();
        this.cargarEstudiantes?.(); // si ya existe tu función
        // si tu función se llama distinto, usa la tuya (ej: this.cargarUsuariosEstudiantes())
      },
      error: (err: any) => {
        console.error(err);
        alert('No se pudo actualizar el estudiante');
        this.cargando = false;
      }
    });
  }

  eliminarEstudiante(e: any, ev?: Event) {
    if (ev) ev.stopPropagation();
    const ok = confirm(`¿Eliminar estudiante #${e.id_usuario} (${e.nombre} ${e.apellido})?`);
    if (!ok) return;

    this.cargando = true;
    this.api.eliminarUsuario(e.id_usuario).subscribe({
      next: () => {
        this.cargarEstudiantes?.(); // refresca lista
      },
      error: (err: any) => {
        console.error(err);
        alert('No se pudo eliminar el estudiante');
        this.cargando = false;
      }
    });
  }

  // ================== PROFESORES (AGREGADO) ==================
  crearProfesor() {
    this.cargando = true;
    this.error = '';
    this.ok = '';

    const payload = {
      nombre: this.nuevoProfesor.nombre,
      apellido: this.nuevoProfesor.apellido,
      correo: this.nuevoProfesor.correo,
      password: this.nuevoProfesor.password,
      rol: 'PROFESOR',
      activo: 1,
    };

    this.api.crearUsuario(payload)
      .pipe(finalize(() => (this.cargando = false)))
      .subscribe({
        next: () => {
          this.ok = 'Profesor creado correctamente.';
          this.nuevoProfesor = { nombre: '', apellido: '', correo: '', password: '' };
          this.cargarProfesores();
        },
        error: (err: any) => {
          console.error(err);
          this.error = 'No se pudo crear el profesor.';
        }
      });
  }

  cargarProfesores() {
    this.cargandoProfesores = true;
    this.errorProfesores = '';

    this.api.getProfesores().subscribe({
      next: (data: any) => {
        this.profesores = Array.isArray(data) ? data : (data?.items ?? []);
        this.cargandoProfesores = false;
      },
      error: (err) => {
        console.error(err);
        this.errorProfesores = 'No se pudieron cargar los profesores.';
        this.cargandoProfesores = false;
      }
    });
  }

  abrirModalProfesor(p: any) {
    this.profEdit = {
      id_usuario: p.id_usuario,
      nombre: p.nombre ?? '',
      apellido: p.apellido ?? '',
      correo: p.correo ?? '',
      password: '',
      activo: (p.activo == 1)
    };
    this.modalProfesorAbierto = true;
  }

  cerrarModalProfesor() {
    this.modalProfesorAbierto = false;
  }

  guardarProfesor() {
    const id = Number(this.profEdit.id_usuario);

    const payload: any = {
      nombre: this.profEdit.nombre,
      apellido: this.profEdit.apellido,
      correo: this.profEdit.correo,
      activo: this.profEdit.activo ? 1 : 0
    };

    if (this.profEdit.password && String(this.profEdit.password).trim().length > 0) {
      payload.password = this.profEdit.password;
    }

    // 🔥 USAMOS TU ENDPOINT GENERAL
    this.api.actualizarUsuario(id, payload).subscribe({
      next: () => {
        this.cerrarModalProfesor();
        this.cargarProfesores();
      },
      error: (err: any) => {
        console.error(err);
        alert('No se pudo actualizar el profesor');
      }
    });
  }

  eliminarProfesor(p: any) {
    const ok = confirm(`¿Eliminar profesor ${p?.nombre ?? ''} ${p?.apellido ?? ''}?`);
    if (!ok) return;

    // 
    this.api.eliminarUsuario(Number(p.id_usuario)).subscribe({
      next: () => this.cargarProfesores(),
      error: (err: any) => {
        console.error(err);
        alert('No se pudo eliminar el profesor');
      }
    });
  }

  calcularPacientesPorEstudiante() {
    // Si todavía no están ambos cargados, no hace nada
    if (!Array.isArray(this.estudiantes) || !Array.isArray(this.pacientes)) return;

    const mapa: { [key: string]: any[] } = {};

    for (const e of this.estudiantes) {
      const id = e?.id_usuario;
      if (!id) continue;
      mapa[String(id)] = [];
    }

    // ✅ Necesitas que el paciente tenga estudiante_id o creado_por
    for (const p of this.pacientes) {
      const estudianteId = String(p?.estudiante_id ?? p?.creado_por);
      if (!estudianteId) continue;

      const key = String(estudianteId);
      if (!mapa[key]) mapa[key] = [];
      mapa[key].push(p);
    }

    this.pacientesPorEstudiante = mapa;
  }

  cargarEstudiantesYPaciente(): void {
    this.cargandoEstudiantes = true;
    this.cargandoPacientes = true;

    this.api.getEstudiantes().subscribe({
      next: (est) => {
        this.estudiantes = est || [];
        this.cargandoEstudiantes = false;

        this.api.getPacientes().subscribe({
          next: (pac) => {
            this.pacientes = pac || [];
            this.cargandoPacientes = false;

            // 🔑 CLAVE
            this.calcularPacientesPorEstudiante();
          },
          error: (err) => {
            console.error('Error cargando pacientes', err);
            this.cargandoPacientes = false; // 🔴 OBLIGATORIO
          }
        });
      },
      error: (err) => {
        console.error('Error cargando estudiantes', err);
        this.cargandoEstudiantes = false;
        this.cargandoPacientes = false; // 🔴 OBLIGATORIO
      }
    });
  }


  toggleEstudiante(e: any): void {
    if (this.estudianteExpandidoId === e.id_usuario) {
      this.estudianteExpandidoId = null;
    } else {
      this.estudianteExpandidoId = e.id_usuario;
      this.calcularPacientesPorEstudiante();
    }
  }

  contarPacientesEstudiante(id: number): number {
    return this.pacientesPorEstudiante?.[String(id)]?.length ?? 0;
  }

  // ================== ASIGNACIÓN DOCENTE ↔ ESTUDIANTE ==================

  cargarAsignaciones() {
    this.cargandoAsignaciones = true;
    this.errorAsignaciones = '';
    this.okAsignaciones = '';

    this.api.getAsignacionesTodas().subscribe({
      next: (data: any) => {
        this.asignaciones = Array.isArray(data) ? data : [];
        this.cargandoAsignaciones = false;

        // Cargar estudiantes por cada profesor
        this.cargarEstudiantesDeTodosProfesores();
        this.cdr.detectChanges();
      },
      error: () => {
        this.asignaciones = [];
        this.cargandoAsignaciones = false;

        // Fallback: cargar estudiantes por profesor individualmente
        this.cargarEstudiantesDeTodosProfesores();
        this.cdr.detectChanges();
      }
    });
  }

  cargarEstudiantesDeTodosProfesores() {
    for (const p of this.profesores) {
      this.api.getEstudiantesDeProfesor(p.id_usuario).subscribe({
        next: (data: any) => {
          this.estudiantesPorProfesor[p.id_usuario] = Array.isArray(data) ? data : [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.estudiantesPorProfesor[p.id_usuario] = [];
          this.cdr.detectChanges();
        }
      });
    }
  }

  asignarEstudianteAProfesor() {
    if (!this.profesorSeleccionadoId || !this.estudianteParaAsignarId) return;

    // Verificar si el estudiante ya está asignado a otro profesor
    const profActual = this.profesorAsignadoA(this.estudianteParaAsignarId);
    if (profActual) {
      const prof = this.profesores.find((p: any) => p.id_usuario === this.profesorSeleccionadoId);
      const nombreProf = prof ? this.nombreCompleto(prof) : 'el profesor seleccionado';
      const confirmar = confirm(
        `Este estudiante ya está asignado a ${profActual}.\n\n¿Deseas reasignarlo a ${nombreProf}?`
      );
      if (!confirmar) return;
    }

    this.cargandoAsignaciones = true;
    this.errorAsignaciones = '';
    this.okAsignaciones = '';
    this.cdr.detectChanges();

    this.api.asignarEstudiante(this.profesorSeleccionadoId, this.estudianteParaAsignarId).subscribe({
      next: () => {
        this.okAsignaciones = profActual
          ? 'Estudiante reasignado correctamente (removido de ' + profActual + ').'
          : 'Estudiante asignado correctamente.';
        this.estudianteParaAsignarId = null;
        this.cargarAsignaciones();
      },
      error: (err: any) => {
        this.errorAsignaciones = err?.error?.detail || 'No se pudo asignar el estudiante.';
        this.cargandoAsignaciones = false;
        this.cdr.detectChanges();
      }
    });
  }

  desasignar(profesorId: number, estudianteId: number) {
    if (!confirm('¿Desasignar este estudiante del profesor?')) return;

    this.api.desasignarEstudiante(profesorId, estudianteId).subscribe({
      next: () => {
        this.cargarAsignaciones();
      },
      error: (err: any) => {
        alert(err?.error?.detail || 'No se pudo desasignar');
      }
    });
  }

  toggleProfesor(p: any) {
    if (this.profesorExpandidoId === p.id_usuario) {
      this.profesorExpandidoId = null;
    } else {
      this.profesorExpandidoId = p.id_usuario;
      this.profesorSeleccionadoId = p.id_usuario;

      // Recargar los estudiantes de ESTE profesor
      this.api.getEstudiantesDeProfesor(p.id_usuario).subscribe({
        next: (data: any) => {
          this.estudiantesPorProfesor[p.id_usuario] = Array.isArray(data) ? data : [];
          this.cdr.detectChanges();
        },
        error: () => {
          this.estudiantesPorProfesor[p.id_usuario] = [];
          this.cdr.detectChanges();
        }
      });
    }
  }

  getEstudiantesDelProfesorExpandido(): any[] {
    if (this.profesorExpandidoId === null) return [];
    return this.estudiantesPorProfesor[this.profesorExpandidoId] || [];
  }

  contarEstudiantesProfesor(profesorId: number): number {
    // Primero intentar desde el mapa (más confiable)
    if (this.estudiantesPorProfesor[profesorId]) {
      return this.estudiantesPorProfesor[profesorId].length;
    }
    // Fallback a asignaciones
    return this.asignaciones.filter(a => a.profesor_id === profesorId).length;
  }

  estudianteYaAsignado(profesorId: number, estudianteId: number): boolean {
    // Primero intentar desde el mapa
    const lista = this.estudiantesPorProfesor[profesorId];
    if (lista) {
      return lista.some((e: any) => e.id_usuario === estudianteId);
    }
    // Fallback
    return this.asignaciones.some(
      a => a.profesor_id === profesorId && a.estudiante_id === estudianteId
    );
  }

  nombreCompleto(u: any): string {
    const n = u?.nombre ?? '';
    const a = u?.apellido ?? '';
    return (n + ' ' + a).trim();
  }

  /**
   * Devuelve el nombre del profesor al que ya está asignado un estudiante,
   * o null si no está asignado a nadie.
   */
  profesorAsignadoA(estudianteId: number): string | null {
    // Buscar en el mapa de estudiantesPorProfesor
    for (const profId of Object.keys(this.estudiantesPorProfesor)) {
      const lista = this.estudiantesPorProfesor[Number(profId)] || [];
      if (lista.some((e: any) => e.id_usuario === estudianteId)) {
        const prof = this.profesores.find((p: any) => p.id_usuario === Number(profId));
        return prof ? this.nombreCompleto(prof) : `Profesor #${profId}`;
      }
    }
    // Fallback: buscar en asignaciones
    const asig = this.asignaciones.find(a => a.estudiante_id === estudianteId);
    return asig ? asig.profesor_nombre : null;
  }

}
