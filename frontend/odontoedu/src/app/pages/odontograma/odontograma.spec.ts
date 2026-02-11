import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Odontograma } from './odontograma.component';

describe('Odontograma', () => {
  let component: Odontograma;
  let fixture: ComponentFixture<Odontograma>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Odontograma]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Odontograma);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
