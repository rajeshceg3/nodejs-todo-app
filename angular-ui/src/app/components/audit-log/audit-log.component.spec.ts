import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuditLogComponent } from './audit-log.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

describe('AuditLogComponent', () => {
  let component: AuditLogComponent;
  let fixture: ComponentFixture<AuditLogComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditLogComponent, HttpClientTestingModule, CommonModule]
    })
    .overrideComponent(AuditLogComponent, {
      remove: { imports: [HttpClientModule] },
      add: { imports: [] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditLogComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    fixture.detectChanges(); // Trigger ngOnInit

    // Expect initial requests from ngOnInit
    const reqLogs = httpMock.expectOne('/audit-logs');
    expect(reqLogs.request.method).toBe('GET');
    reqLogs.flush({ logs: [] });

    const reqVerify = httpMock.expectOne('/audit-logs/verify');
    expect(reqVerify.request.method).toBe('GET');
    reqVerify.flush({ status: 'INTEGRITY_VERIFIED', count: 0, brokenIndices: [] });

    expect(component).toBeTruthy();
  });

  it('should fetch logs and display them', () => {
    fixture.detectChanges(); // ngOnInit

    const mockLogs = [
      { action: 'CREATE_TASK', entityId: '1', timestamp: new Date().toISOString(), hash: 'abc', previousHash: '000', payload: {} }
    ];

    const reqLogs = httpMock.expectOne('/audit-logs');
    reqLogs.flush({ logs: mockLogs });

    const reqVerify = httpMock.expectOne('/audit-logs/verify');
    reqVerify.flush({ status: 'INTEGRITY_VERIFIED', count: 1, brokenIndices: [] });

    expect(component.logs.length).toBe(1);
    expect(component.logs[0].action).toBe('CREATE_TASK');
  });

  it('should handle verification error', () => {
    fixture.detectChanges();

    const reqLogs = httpMock.expectOne('/audit-logs');
    reqLogs.flush({ logs: [] });

    const reqVerify = httpMock.expectOne('/audit-logs/verify');
    reqVerify.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(component.integrityStatus).toBe('ERROR');
  });
});
