import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PatientMatchComponent } from './patient-match.component';

describe('PatientMatchComponent', () => {
  let component: PatientMatchComponent;
  let fixture: ComponentFixture<PatientMatchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PatientMatchComponent, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(PatientMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
