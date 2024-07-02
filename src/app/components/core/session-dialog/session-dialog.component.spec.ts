import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionDialogComponent } from './session-dialog.component';

describe('SessionDialogComponent', () => {
  let component: SessionDialogComponent;
  let fixture: ComponentFixture<SessionDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SessionDialogComponent]
    });
    fixture = TestBed.createComponent(SessionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
