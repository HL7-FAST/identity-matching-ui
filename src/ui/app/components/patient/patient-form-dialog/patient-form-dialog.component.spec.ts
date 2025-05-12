import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PatientFormDialogComponent } from './patient-form-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('PatientFormDialogComponent', () => {
  let component: PatientFormDialogComponent;
  let fixture: ComponentFixture<PatientFormDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PatientFormDialogComponent, HttpClientTestingModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef, useValue: {} }
      ]
    });
    fixture = TestBed.createComponent(PatientFormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
