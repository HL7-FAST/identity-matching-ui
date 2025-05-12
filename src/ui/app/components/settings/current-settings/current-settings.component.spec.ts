import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { CurrentSettingsComponent } from './current-settings.component';
import { provideRouter } from '@angular/router';

describe('CurrentSettingsComponent', () => {
  let component: CurrentSettingsComponent;
  let fixture: ComponentFixture<CurrentSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ CurrentSettingsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
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
