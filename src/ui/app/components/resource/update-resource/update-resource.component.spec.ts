import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UpdateResourceComponent } from './update-resource.component';

describe('UpdateResourceComponent', () => {
  let component: UpdateResourceComponent;
  let fixture: ComponentFixture<UpdateResourceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [UpdateResourceComponent, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(UpdateResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
