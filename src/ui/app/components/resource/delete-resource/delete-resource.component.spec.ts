import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DeleteResourceComponent } from './delete-resource.component';

describe('DeleteResourceComponent', () => {
  let component: DeleteResourceComponent;
  let fixture: ComponentFixture<DeleteResourceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DeleteResourceComponent, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(DeleteResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
