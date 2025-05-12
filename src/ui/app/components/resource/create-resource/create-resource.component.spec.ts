import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CreateResourceComponent } from './create-resource.component';

describe('CreateResourceComponent', () => {
  let component: CreateResourceComponent;
  let fixture: ComponentFixture<CreateResourceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CreateResourceComponent, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(CreateResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
