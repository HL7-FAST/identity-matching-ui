import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewResourceComponent } from './view-resource.component';

describe('ViewResourceComponent', () => {
  let component: ViewResourceComponent;
  let fixture: ComponentFixture<ViewResourceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ViewResourceComponent]
    });
    fixture = TestBed.createComponent(ViewResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
