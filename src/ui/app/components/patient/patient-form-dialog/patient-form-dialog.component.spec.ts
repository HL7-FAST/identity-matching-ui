import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientFormDialogComponent } from './patient-form-dialog.component';

describe('PatientFormDialogComponent', () => {
  let component: PatientFormDialogComponent;
  let fixture: ComponentFixture<PatientFormDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PatientFormDialogComponent]
    });
    fixture = TestBed.createComponent(PatientFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
