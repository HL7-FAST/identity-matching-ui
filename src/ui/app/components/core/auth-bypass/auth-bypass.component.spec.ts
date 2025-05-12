import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthBypassComponent } from './auth-bypass.component';

describe('AuthBypassComponent', () => {
  let component: AuthBypassComponent;
  let fixture: ComponentFixture<AuthBypassComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AuthBypassComponent, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(AuthBypassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
