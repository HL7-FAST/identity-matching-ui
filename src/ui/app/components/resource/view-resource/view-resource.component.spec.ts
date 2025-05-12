import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ViewResourceComponent } from './view-resource.component';

describe('ViewResourceComponent', () => {
  let component: ViewResourceComponent;
  let fixture: ComponentFixture<ViewResourceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ViewResourceComponent, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(ViewResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
