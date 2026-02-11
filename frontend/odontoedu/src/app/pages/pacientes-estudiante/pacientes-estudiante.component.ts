import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-pacientes-estudiante',
  standalone: false,
  templateUrl: './pacientes-estudiante.component.html',
  styleUrls: ['./pacientes-estudiante.component.css']
})
export class PacientesEstudiante implements OnInit {

  cargando = false;
  error = '';
  usuarioActual: any = null;

  pacientes: any[] = [];

  form = {
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    direccion: ''
  };

  // Modal editar
  modalEditarAbierto = false;
  guardandoEditar = false;
  errorEditar = '';
  pacienteEditando: any = null;
  editForm: any = {
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    direccion: ''
  };

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.usuarioActual = this.auth.getUsuarioActual();
    this.cargarPacientes();
  }

  cerrarSesion() {
    this.auth.logout();
  }

  cargarPacientes() {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.api.getPacientes().subscribe({
      next: (res: any) => {
        this.pacientes = res || [];
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error(err);
        this.error = 'No se pudieron cargar los pacientes';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  crearPaciente() {
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    const payload = {
      nombre: this.form.nombre,
      apellido: this.form.apellido,
      cedula: this.form.cedula,
      telefono: this.form.telefono,
      direccion: this.form.direccion
    };

    this.api.crearPaciente(payload).subscribe({
      next: () => {
        this.form = { nombre: '', apellido: '', cedula: '', telefono: '', direccion: '' };
        this.cargarPacientes();
      },
      error: (err: any) => {
        console.error(err);
        const detail = err?.error?.detail;
        this.error = typeof detail === 'string' ? detail : 'No se pudo crear el paciente. Verifica tu sesión.';
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  verPaciente(p: any) {
    const id = p?.id_paciente || p?.id;
    if (!id) return;
    this.router.navigate(['/paciente-detalle', id]);
  }

  abrirEditar(p: any) {
    this.errorEditar = '';
    this.pacienteEditando = p;
    this.editForm = {
      nombre: p?.nombre ?? '',
      apellido: p?.apellido ?? '',
      cedula: p?.cedula ?? '',
      telefono: p?.telefono ?? '',
      direccion: p?.direccion ?? ''
    };
    this.modalEditarAbierto = true;
  }

  cerrarEditar() {
    this.modalEditarAbierto = false;
    this.pacienteEditando = null;
  }

  guardarEdicion() {
    if (!this.pacienteEditando) return;
    const id = this.pacienteEditando.id_paciente || this.pacienteEditando.id;
    this.guardandoEditar = true;
    this.errorEditar = '';

    this.api.editarPaciente(id, this.editForm).subscribe({
      next: () => {
        this.guardandoEditar = false;
        this.cerrarEditar();
        this.cargarPacientes();
      },
      error: (err: any) => {
        this.guardandoEditar = false;
        this.errorEditar = err?.error?.detail || err?.message || 'No se pudo actualizar';
        this.cdr.detectChanges();
      }
    });
  }

  eliminarPaciente(p: any) {
    const id = p?.id_paciente || p?.id;
    if (!id) return;
    if (!confirm(`¿Eliminar paciente #${id}?`)) return;

    this.api.eliminarPaciente(id).subscribe({
      next: () => this.cargarPacientes(),
      error: (err: any) => alert(err?.error?.detail || 'No se pudo eliminar')
    });
  }
}
