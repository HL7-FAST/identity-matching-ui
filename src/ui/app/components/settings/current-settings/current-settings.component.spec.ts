import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentSettingsComponent } from './current-settings.component';

describe('CurrentSettingsComponent', () => {
  let component: CurrentSettingsComponent;
  let fixture: ComponentFixture<CurrentSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
