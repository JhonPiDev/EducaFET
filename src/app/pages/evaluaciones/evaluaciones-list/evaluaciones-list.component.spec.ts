import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionesListComponent } from './evaluaciones-list.component';

describe('EvaluacionesListComponent', () => {
  let component: EvaluacionesListComponent;
  let fixture: ComponentFixture<EvaluacionesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvaluacionesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EvaluacionesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
