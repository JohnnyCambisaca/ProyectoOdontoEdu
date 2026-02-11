import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
type Tab = 'historia' | 'odontograma' | 'tratamientos' | 'metas';

@Component({
  selector: 'app-paciente-detalle',
  standalone: false,
  templateUrl: './paciente-detalle.component.html',
  styleUrls: ['./paciente-detalle.component.css']
})
export class PacienteDetalle implements OnInit {
  pacienteId!: number;

  cargando = false;
  error = '';

  tab: Tab = 'historia';

  paciente: any = null;
  historia: any[] = [];
  odontograma: any = null;
  tratamientos: any[] = [];

  modoEstudiante = false;
  materiaId?: number;
  procedimientoId?: number;
  userRol: string = '';

  // ✅ Formulario Historia Clínica (según tu schema)
  historiaForm = {
    motivo: '',
    diagnostico: '',
    observaciones: ''
  };
  creandoHistoria = false;
  msgHistoria = '';

  tratForm = {
    descripcion: '',
    costo: ''
  };
  creandoTrat = false;
  msgTrat = '';

  miProfesor: any = null;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.pacienteId = Number(this.route.snapshot.paramMap.get('id'));
    this.userRol = localStorage.getItem('rol') || '';
    this.route.queryParams.subscribe(params => {
      this.modoEstudiante = params['modo'] === 'estudiante';
      this.materiaId = params['materiaId'];
      this.procedimientoId = params['procedimientoId'];
    });
    this.cargarTodo();
    this.cargarMiProfesor();
  }

  cargarMiProfesor() {
    this.api.getMiProfesor().subscribe({
      next: (res: any) => { this.miProfesor = res; },
      error: () => { this.miProfesor = null; }
    });
  }

  setTab(t: Tab) {
    this.tab = t;
  }

  private hoyYYYYMMDD(): string {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  cargarTodo() {
    this.cargando = true;
    this.error = '';

    forkJoin({
      // Paciente (desde lista)
      lista: this.api.getPacientes().pipe(
        catchError((err) => {
          console.error('Pacientes error', err);
          return of([]); // fallback para que no se rompa forkJoin
        })
      ),

      // Historia
      historia: this.api.getHistoriaPaciente(this.pacienteId).pipe(
        catchError((err) => {
          console.error('Historia error', err);
          return of([]); // fallback
        })
      ),

      // Odontograma
      odontograma: this.api.getOdontogramaPaciente(this.pacienteId).pipe(
        catchError((err) => {
          console.error('Odontograma error', err);
          return of(null); // fallback
        })
      ),

      // Tratamientos
      tratamientos: this.api.getTratamientosPaciente(this.pacienteId).pipe(
        catchError((err) => {
          console.error('Tratamientos error', err);
          // si quieres mostrar mensaje:
          this.error = 'No se pudieron cargar los tratamientos.';
          return of([]); // fallback
        })
      ),
    })
    .pipe(
      tap((res) => {
        const arr: any[] = res.lista || [];
        this.paciente =
          arr.find((p: any) => p.id_paciente === this.pacienteId) ||
          arr.find((p: any) => p.id === this.pacienteId) ||
          null;

        this.historia = res.historia || [];
        this.odontograma = res.odontograma;
        this.tratamientos = res.tratamientos || [];
      }),
      finalize(() => {
        this.cargando = false; // ✅ SIEMPRE se ejecuta (éxito o error)
      })
    )
    .subscribe();
  }

  recargarTabActual() {
    this.error = '';

    if (this.tab === 'historia') {
      this.api.getHistoriaPaciente(this.pacienteId).subscribe({
        next: (data) => (this.historia = data || []),
        error: () => {
          this.error = 'No se pudo recargar historia clínica.';
        }
      });
    }

    if (this.tab === 'odontograma') {
      this.api.getOdontogramaPaciente(this.pacienteId).subscribe({
        next: (data) => (this.odontograma = data),
        error: () => {
          this.error = 'No se pudo recargar odontograma.';
        }
      });
    }

    if (this.tab === 'tratamientos') {
      this.api.getTratamientosPaciente(this.pacienteId).subscribe({
        next: (data) => (this.tratamientos = data || []),
        error: () => {
          this.error = 'No se pudieron recargar tratamientos.';
        }
      });
    }

    if (this.tab === 'metas') {
      // ✅ más adelante implementamos metas aquí
    }
  }

  // ✅ Crear Historia Clínica (opción B: mandamos fecha_registro desde Angular)
  crearHistoriaClinica() {
    this.msgHistoria = '';
    this.error = '';

    if (!this.historiaForm.motivo.trim()) {
      this.msgHistoria = 'Motivo es obligatorio.';
      return;
    }
    if (!this.historiaForm.diagnostico.trim()) {
      this.msgHistoria = 'Diagnóstico es obligatorio.';
      return;
    }

    this.creandoHistoria = true;

    const payload = {
      id_paciente: this.pacienteId,
      motivo: this.historiaForm.motivo,
      diagnostico: this.historiaForm.diagnostico,
      observaciones: this.historiaForm.observaciones
    };

    this.api.crearHistoria(payload).subscribe({
      next: () => {
        this.msgHistoria = 'Historia clínica creada correctamente.';
        this.historiaForm = { motivo: '', diagnostico: '', observaciones: '' };

        // recargar lista
        this.api.getHistoriaPaciente(this.pacienteId).subscribe({
          next: (data) => (this.historia = data || []),
          error: () => {}
        });

        this.creandoHistoria = false;
      },
      error: (err) => {
        console.error(err);
        // Si el backend devuelve JSON con detail, lo intentamos mostrar
        this.msgHistoria =
          err?.error?.detail
            ? (typeof err.error.detail === 'string' ? err.error.detail : 'No se pudo crear historia clínica.')
            : 'No se pudo crear historia clínica.';
        this.creandoHistoria = false;
      }
    });
  }
  crearTratamientoSimple() {
    this.msgTrat = '';

    if (!this.tratForm.descripcion.trim()) {
      this.msgTrat = 'Descripción es obligatoria.';
      return;
    }

    this.creandoTrat = true;

    const payload = {
      id_paciente: this.pacienteId,
      descripcion: this.tratForm.descripcion
    };

    this.api.crearTratamiento(payload).subscribe({
      next: () => {
        this.msgTrat = 'Tratamiento creado.';
        this.tratForm = { descripcion: '', costo: '' };

        this.api.getTratamientosPaciente(this.pacienteId).subscribe({
          next: (data) => (this.tratamientos = data || []),
          error: () => {}
        });

        this.creandoTrat = false;
      },
      error: (err) => {
        console.error(err);
        this.msgTrat = 'No se pudo crear tratamiento.';
        this.creandoTrat = false;
      }
    });
  }

  enviando = false;
  enviadoOk = false;
  envioError = '';

  enviarCasoProfesor() {
    const materiaId = Number(localStorage.getItem('materia_id') || 0);
    const procedimientoId = Number(localStorage.getItem('procedimiento_id') || 0);

    if (!materiaId || !procedimientoId) {
      this.error = 'No se encontró materia/procedimiento seleccionado. Entra desde "Gestionar pacientes".';
      return;
    }

    // ✅ Esto será lo que se guarde en inbox del profesor (backend)
    const payload = {
      paciente_id: this.pacienteId,
      materia_id: materiaId,
      procedimiento_id: procedimientoId
    };

    this.api.enviarSolicitudProfesor(payload).subscribe({
      next: () => {
        alert('✅ Enviado al profesor. Queda pendiente de aprobación.');
      },
      error: (err) => {
        console.error(err);
        this.error = 'No se pudo enviar al profesor.';
      }
    });
  }

  enviandoSolicitud: boolean = false;

  enviarAlProfesor() {
    if (!this.miProfesor) {
      alert('No tienes un profesor asignado. Contacta al administrador.');
      return;
    }

    this.enviandoSolicitud = true;

    const payload = {
      paciente_id: this.pacienteId,
      motivo: 'Aprobación de procedimiento',
      nota: 'Paciente listo con historia, odontograma y tratamiento'
    };

    this.api.enviarSolicitudProfesor(payload).subscribe({
      next: () => {
        alert(`Solicitud enviada a ${this.miProfesor.nombre} ${this.miProfesor.apellido} ✅`);
        this.enviandoSolicitud = false;
      },
      error: (err) => {
        console.error(err);
        alert('Error al enviar solicitud ❌');
        this.enviandoSolicitud = false;
      }
    });
  }







}
