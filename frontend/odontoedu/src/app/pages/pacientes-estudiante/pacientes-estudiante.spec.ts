import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacientesEstudiante } from './pacientes-estudiante.component';

describe('PacienteDetalle', () => {
  let component: PacientesEstudiante;
  let fixture: ComponentFixture<PacientesEstudiante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PacientesEstudiante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacientesEstudiante);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
