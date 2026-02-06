import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TemporalOperationsCenterComponent } from './temporal-operations-center.component';
import { AuditReplayService } from '../../services/audit-replay.service';
import { of } from 'rxjs';
import { AuditLog } from '../../models/audit-log.model';
import { Todo } from '../../models/todo.model';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

describe('TemporalOperationsCenterComponent', () => {
  let component: TemporalOperationsCenterComponent;
  let fixture: ComponentFixture<TemporalOperationsCenterComponent>;
  let mockAuditReplayService: jasmine.SpyObj<AuditReplayService>;

  const mockLogs: AuditLog[] = [
    {
      action: 'CREATE_TASK',
      entityId: '1',
      timestamp: new Date('2023-01-01T10:00:00Z').toISOString(),
      hash: 'h1',
      previousHash: 'h0',
      payload: { content: 'Task 1', status: 'pending' }
    }
  ];

  const mockReconstructedTodos: Todo[] = [
    { _id: '1', content: 'Task 1', status: 'pending' }
  ];

  beforeEach(async () => {
    mockAuditReplayService = jasmine.createSpyObj('AuditReplayService', ['fetchLogs', 'reconstructState']);
    mockAuditReplayService.fetchLogs.and.returnValue(of(mockLogs));
    mockAuditReplayService.reconstructState.and.returnValue(mockReconstructedTodos);

    await TestBed.configureTestingModule({
      imports: [TemporalOperationsCenterComponent, CommonModule, FormsModule, DatePipe],
      providers: [
        { provide: AuditReplayService, useValue: mockAuditReplayService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TemporalOperationsCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // ngOnInit
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch logs on init', () => {
    expect(mockAuditReplayService.fetchLogs).toHaveBeenCalled();
    expect(component.logs.length).toBe(1);
  });

  it('should update state when slider changes', () => {
    const event = { target: { value: '50' } };
    component.onSliderChange(event);

    expect(component.currentTick).toBe(50);
    expect(mockAuditReplayService.reconstructState).toHaveBeenCalled();
  });

  it('should toggle playback', fakeAsync(() => {
    component.currentTick = 0; // Reset to start to avoid auto-stop
    component.togglePlayback();
    expect(component.isPlaying).toBeTrue();

    tick(100); // 1 tick
    // We expect tick to increase. Note: currentTick is accessed inside closure,
    // ensure we are checking the component state
    expect(component.currentTick).toBeGreaterThan(0);

    component.togglePlayback(); // Stop
    expect(component.isPlaying).toBeFalse();
  }));

  it('should jump to now', () => {
    component.jumpToNow();
    expect(component.currentTick).toBe(component.totalTicks);
    expect(component.isPlaying).toBeFalse();
  });
});
