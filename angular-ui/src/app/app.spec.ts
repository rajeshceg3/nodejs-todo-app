import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterLinkActive, RouterLink } from '@angular/router';

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

  it('warns before task entry that this is a shared disposable demo', () => {
    const note = fixture.nativeElement.querySelector('[role=note]');
    expect(note.textContent).toContain('Everyone can see and change');
    expect(note.textContent).toContain('disappear when the service restarts');
    expect(note.textContent).toContain('never personal data');
    expect(note.compareDocumentPosition(fixture.nativeElement.querySelector('main')) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });
});
