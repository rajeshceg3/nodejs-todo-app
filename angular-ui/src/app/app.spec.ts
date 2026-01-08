import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterLinkActive, RouterLink, ActivatedRoute } from '@angular/router';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NoopAnimationsModule,
        AppComponent,
        RouterLink,
        RouterLinkActive
      ],
      // We might need to mock things if routerLinkActiveOptions is still complaining,
      // but usually RouterTestingModule handles it.
      // The error "Can't bind to 'routerLinkActiveOptions' since it isn't a known property of 'a'"
      // suggests that RouterLinkActive directive is not matching the 'a' tag in the test environment,
      // or the module configuration in the test is missing something.
      // However, AppComponent imports RouterLinkActive in the real app.
      // In the test, we import AppComponent which is standalone, so it should carry its imports.
      // But we also add RouterTestingModule.
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
