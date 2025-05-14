import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CapabilityStatementComponent } from './capability-statement.component';

describe('CapabilityStatementComponent', () => {
  let component: CapabilityStatementComponent;
  let fixture: ComponentFixture<CapabilityStatementComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CapabilityStatementComponent, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(CapabilityStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
