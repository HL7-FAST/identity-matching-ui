import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHeadersComponent } from './edit-headers.component';

describe('EditHeadersComponent', () => {
  let component: EditHeadersComponent;
  let fixture: ComponentFixture<EditHeadersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditHeadersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditHeadersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
