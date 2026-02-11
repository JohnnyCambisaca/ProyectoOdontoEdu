import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';

type Cara = 'O' | 'M' | 'D' | 'V' | 'L';
type Estado = 'SANO' | 'CARIES' | 'RESTAURACION' | 'AUSENTE' | 'EXTRAIDO';

type ToothType = 'INCISIVO' | 'CANINO' | 'PREMOLAR' | 'MOLAR';

interface ToothDef {
  fdi: string;       // "11"
  tipo: ToothType;   // INCISIVO/CANINO/PREMOLAR/MOLAR
  arcada: 'SUP' | 'INF';
}

@Component({
  selector: 'app-odontograma',
  standalone: false,
  templateUrl: './odontograma.component.html',
  styleUrls: ['./odontograma.component.css']
})
export class Odontograma implements OnInit {
  @Input() pacienteId!: number;

  // barra
  estadoSel: Estado = 'CARIES';
  msg = '';
  cargando = false;

  // mapa[diente][cara] = estado
  mapa: Record<string, Partial<Record<Cara, Estado>>> = {};

  // FDI + tipo por diente
  sup: ToothDef[] = [
    { fdi:'18', tipo:'MOLAR', arcada:'SUP' }, { fdi:'17', tipo:'MOLAR', arcada:'SUP' }, { fdi:'16', tipo:'MOLAR', arcada:'SUP' },
    { fdi:'15', tipo:'PREMOLAR', arcada:'SUP' }, { fdi:'14', tipo:'PREMOLAR', arcada:'SUP' },
    { fdi:'13', tipo:'CANINO', arcada:'SUP' },
    { fdi:'12', tipo:'INCISIVO', arcada:'SUP' }, { fdi:'11', tipo:'INCISIVO', arcada:'SUP' },
    { fdi:'21', tipo:'INCISIVO', arcada:'SUP' }, { fdi:'22', tipo:'INCISIVO', arcada:'SUP' },
    { fdi:'23', tipo:'CANINO', arcada:'SUP' },
    { fdi:'24', tipo:'PREMOLAR', arcada:'SUP' }, { fdi:'25', tipo:'PREMOLAR', arcada:'SUP' },
    { fdi:'26', tipo:'MOLAR', arcada:'SUP' }, { fdi:'27', tipo:'MOLAR', arcada:'SUP' }, { fdi:'28', tipo:'MOLAR', arcada:'SUP' },
  ];

  inf: ToothDef[] = [
    { fdi:'48', tipo:'MOLAR', arcada:'INF' }, { fdi:'47', tipo:'MOLAR', arcada:'INF' }, { fdi:'46', tipo:'MOLAR', arcada:'INF' },
    { fdi:'45', tipo:'PREMOLAR', arcada:'INF' }, { fdi:'44', tipo:'PREMOLAR', arcada:'INF' },
    { fdi:'43', tipo:'CANINO', arcada:'INF' },
    { fdi:'42', tipo:'INCISIVO', arcada:'INF' }, { fdi:'41', tipo:'INCISIVO', arcada:'INF' },
    { fdi:'31', tipo:'INCISIVO', arcada:'INF' }, { fdi:'32', tipo:'INCISIVO', arcada:'INF' },
    { fdi:'33', tipo:'CANINO', arcada:'INF' },
    { fdi:'34', tipo:'PREMOLAR', arcada:'INF' }, { fdi:'35', tipo:'PREMOLAR', arcada:'INF' },
    { fdi:'36', tipo:'MOLAR', arcada:'INF' }, { fdi:'37', tipo:'MOLAR', arcada:'INF' }, { fdi:'38', tipo:'MOLAR', arcada:'INF' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar() {
    this.cargando = true;
    this.api.getOdontogramaPaciente(this.pacienteId).subscribe({
      next: (rows: any[]) => {
        this.mapa = {};
        (rows || []).forEach(r => {
          if (!this.mapa[r.diente]) this.mapa[r.diente] = {};
          this.mapa[r.diente][r.cara as Cara] = r.estado as Estado;
        });
        this.cargando = false;
      },
      error: () => this.cargando = false
    });
  }

  getEstado(diente: string, cara: Cara): Estado {
    return (this.mapa[diente]?.[cara] as Estado) || 'SANO';
  }

  color(est: Estado) {
    switch (est) {
      case 'SANO': return '#ffffff';
      case 'CARIES': return '#ef4444';
      case 'RESTAURACION': return '#3b82f6';
      case 'AUSENTE': return '#e5e7eb';
      case 'EXTRAIDO': return '#111827';
      default: return '#ffffff';
    }
  }

  stroke(est: Estado) {
    return est === 'SANO' ? '#94a3b8' : '#111827';
  }

  clickCara(diente: string, cara: Cara) {
    if (!this.mapa[diente]) this.mapa[diente] = {};
    this.mapa[diente][cara] = this.estadoSel;

    const payload = {
      id_paciente: this.pacienteId,
      diente,
      cara,
      estado: this.estadoSel,
      nota: ''
    };

    this.msg = `Guardando ${diente}-${cara}...`;
    this.api.guardarOdontogramaDetalle(payload).subscribe({
      next: () => {
        this.msg = `Guardado ✅ (${diente}-${cara})`;
        setTimeout(() => (this.msg = ''), 1200);
      },
      error: () => {
        this.msg = 'Error al guardar ❌';
      }
    });
  }

  // Para usar <use href="#tooth-INCISIVO">, etc.
  symbolId(tipo: ToothType) {
    return `#tooth-${tipo}`;
  }
}
