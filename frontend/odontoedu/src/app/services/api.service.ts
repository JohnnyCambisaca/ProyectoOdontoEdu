import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class ApiService {

  private API = "http://localhost:8000";

  constructor(private http: HttpClient, private auth: AuthService) {}

  // ✅ Header con JWT
  private getHeaders() {
    const token = this.auth.getToken();

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // ==========================
  // ✅ PACIENTES
  // ==========================
  getPacientes() {
    return this.http.get<any[]>(`${this.API}/pacientes/`, this.getHeaders());
  }

  crearPaciente(data: any) {
    return this.http.post(`${this.API}/pacientes/`, data, this.getHeaders());
  }

  editarPaciente(id: number, data: any) {
    return this.http.put(`${this.API}/pacientes/${id}`, data, this.getHeaders());
  }

  eliminarPaciente(id: number) {
    return this.http.delete(`${this.API}/pacientes/${id}`, this.getHeaders());
  }
  // ==========================
  // ✅ HISTORIA CLÍNICA
  // ==========================
  crearHistoria(data: any) {
    return this.http.post(`${this.API}/historia/`, data, this.getHeaders());
  }

  verHistoriaPaciente(paciente_id: number) {
    return this.http.get(`${this.API}/historia/paciente/${paciente_id}`, this.getHeaders());
  }

  // ==========================
  // ✅ ODONTOGRAMA
  // ==========================
  getOdontogramaPaciente(pacienteId: number) {
    return this.http.get<any[]>(`${this.API}/odontograma/paciente/${pacienteId}`, this.getHeaders());
  }

  guardarOdontogramaDetalle(data: any) {
    return this.http.post<any>(`${this.API}/odontograma/detalle`, data, this.getHeaders());
  }


  // ==========================
  // ✅ TRATAMIENTOS
  // ==========================
  // TRATAMIENTOS
  getTratamientosPaciente(pacienteId: number) {
  return this.http.get<any[]>(`${this.API}/tratamientos/paciente/${pacienteId}`, this.getHeaders());
  }

  crearTratamiento(data: any) {
    return this.http.post<any>(`${this.API}/tratamientos/`, data, this.getHeaders());
  }


  // ==========================
  // ✅ 
  // ==========================
  crearMeta(data: any) {
    return this.http.post(`${this.API}/metas/`, data, this.getHeaders());
  }

  asignarMeta(meta_id: number, estudiante_id: number) {
    return this.http.post(`${this.API}/metas/asignar/${meta_id}/${estudiante_id}`, {}, this.getHeaders());
  }

  actualizarMetas(estudiante_id: number, payload: any) {
    return this.http.put(`${this.API}/metas/actualizar/${estudiante_id}`, payload, this.getHeaders());
  }

  verMetasEstudiante(estudiante_id: number) {
    return this.http.get(`${this.API}/metas/estudiante/${estudiante_id}`, this.getHeaders());
  }
  getHistoriaPaciente(pacienteId: number) {
  return this.http.get<any[]>(`${this.API}/historia/paciente/${pacienteId}`, this.getHeaders());
  }
  // USUARIOS
  getUsuarios() {
    return this.http.get<any[]>(`${this.API}/usuarios/`, this.getHeaders());
  }
  crearUsuario(data: any) {
    return this.http.post(`${this.API}/usuarios/`, data, this.getHeaders());
  }

  actualizarUsuario(id: number, data: any) {
    return this.http.put(`${this.API}/usuarios/${id}`, data, this.getHeaders());
  }

  eliminarUsuario(id: number) {
    return this.http.delete(`${this.API}/usuarios/${id}`, this.getHeaders());
  }



  getEstudiantes() {
    return this.http.get<any[]>(`${this.API}/usuarios/estudiantes`, this.getHeaders());
  }
  // ✅ PROFESORES
  getProfesores() {
    return this.http.get<any[]>(`${this.API}/usuarios/profesores`, this.getHeaders());
  }

  crearProfesor(data: any) {
    // Si ya tienes crearUsuario(data) puedes usarlo en vez de este
    return this.http.post(`${this.API}/usuarios/`, data, this.getHeaders());
  }

  // ==========================
  // ✅ PROGRESO (ESTUDIANTE / PROFESOR)
  // ==========================
  // Para la vista del estudiante (me) — evita el error:
  // Property 'getProgresoEstudianteMe' does not exist on type 'ApiService'
  getProgresoEstudianteMe(): Observable<any> {
    return this.http.get<any>(`${this.API}/progreso/estudiante/me`, this.getHeaders());
  }

  // (Opcional) Progreso por estudiante (para profesor/admin)
  getProgresoEstudiante(estudianteId: number): Observable<any> {
    return this.http.get<any>(`${this.API}/progreso/estudiante/${estudianteId}`, this.getHeaders());
  }

  // ==========================
  // ✅ SOLICITUDES / INBOX (PROFESOR)
  // ==========================
  // Estudiante envía solicitud de aprobación de un procedimiento realizado
  // ✅ SOLICITUDES / INBOX (PROFESOR)
  // ✅ SOLICITUDES
  enviarSolicitudProfesor(data: any) {
    return this.http.post(`${this.API}/solicitudes/`, data, this.getHeaders());
  }

  getInboxProfesor() {
    return this.http.get<any>(`${this.API}/solicitudes/inbox`, this.getHeaders());
  }

  // Aprobar solicitud
  aprobarSolicitud(id_solicitud: number) {
    return this.http.post<any>(
      `${this.API}/solicitudes/${id_solicitud}/aprobar`,
      {},
      this.getHeaders()
    );
  }

  // Denegar solicitud
  denegarSolicitud(id_solicitud: number) {
    return this.http.post<any>(
      `${this.API}/solicitudes/${id_solicitud}/denegar`,
      {},
      this.getHeaders()
    );
  }

  // =======================
// PROFESOR - SOLICITUDES
// =======================
  getSolicitudesPendientesProfesor() {
    return this.http.get(`${this.API}/solicitudes/inbox`, this.getHeaders());
  }

  // =======================
  // PROFESOR - ESTUDIANTES
  // =======================
  getUsuariosEstudiantes() {
    return this.http.get(`${this.API}/usuarios/estudiantes`, this.getHeaders());
  }

  // ==========================
  // ✅ MATERIAS / PROCEDIMIENTOS (si los usas en la UI)
  // ==========================
  getMateriasEstudianteMe(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/materias/estudiante/me`, this.getHeaders());
  }

  getMateriasProfesorMe(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/materias/profesor/me`, this.getHeaders());
  }

  // Profesor: listar estudiantes por materia
  getEstudiantesPorMateria(materiaId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API}/materias/${materiaId}/estudiantes`, this.getHeaders());
  }
  getSolicitudesTodas() {
    return this.http.get<any>(`${this.API}/solicitudes/todas`, this.getHeaders());
  }

  getSolicitudesMe() {
    return this.http.get<any[]>(`${this.API}/solicitudes/me`, this.getHeaders());
  }

  // ==========================
  // ✅ ASIGNACIONES PROFESOR ↔ ESTUDIANTE
  // ==========================
  getAsignacionesTodas() {
    return this.http.get<any[]>(`${this.API}/asignaciones/todas`, this.getHeaders());
  }

  getEstudiantesDeProfesor(profesorId: number) {
    return this.http.get<any[]>(`${this.API}/asignaciones/profesor/${profesorId}/estudiantes`, this.getHeaders());
  }

  getMisEstudiantes() {
    return this.http.get<any[]>(`${this.API}/asignaciones/mis-estudiantes`, this.getHeaders());
  }

  getMisPacientes() {
    return this.http.get<any[]>(`${this.API}/asignaciones/mis-pacientes`, this.getHeaders());
  }

  getMiProfesor() {
    return this.http.get<any>(`${this.API}/asignaciones/mi-profesor`, this.getHeaders());
  }

  asignarEstudiante(profesorId: number, estudianteId: number) {
    return this.http.post(`${this.API}/asignaciones/`, {
      profesor_id: profesorId,
      estudiante_id: estudianteId
    }, this.getHeaders());
  }

  desasignarEstudiante(profesorId: number, estudianteId: number) {
    return this.http.request('DELETE', `${this.API}/asignaciones/`, {
      body: { profesor_id: profesorId, estudiante_id: estudianteId },
      ...this.getHeaders()
    });
  }
}
