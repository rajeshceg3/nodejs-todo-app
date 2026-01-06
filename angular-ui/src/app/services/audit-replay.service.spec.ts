import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuditReplayService } from './audit-replay.service';
import { AuditLog } from '../models/audit-log.model';
import { Todo } from '../models/todo.model';

describe('AuditReplayService', () => {
  let service: AuditReplayService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuditReplayService]
    });
    service = TestBed.inject(AuditReplayService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch logs', () => {
    const dummyLogs: AuditLog[] = [
      { action: 'CREATE_TASK', entityId: '1', payload: {}, timestamp: '2023-01-01', previousHash: '0', hash: '1' }
    ];

    service.fetchLogs().subscribe(logs => {
      expect(logs.length).toBe(1);
      expect(logs).toEqual(dummyLogs);
    });

    const req = httpMock.expectOne('/audit-logs');
    expect(req.request.method).toBe('GET');
    req.flush({ logs: dummyLogs });
  });

  describe('reconstructState', () => {
    const todo1: Todo = { _id: '1', content: 'Task 1', status: 'pending', createdAt: '2023-01-01T10:00:00Z' };
    const todo2: Todo = { _id: '2', content: 'Task 2', status: 'pending', createdAt: '2023-01-01T10:05:00Z' };

    const logs: AuditLog[] = [
      {
        action: 'CREATE_TASK',
        entityId: '1',
        payload: { content: 'Task 1', status: 'pending', createdAt: '2023-01-01T10:00:00Z' },
        timestamp: '2023-01-01T10:00:00Z',
        previousHash: 'a',
        hash: 'b'
      },
      {
        action: 'CREATE_TASK',
        entityId: '2',
        payload: { content: 'Task 2', status: 'pending', createdAt: '2023-01-01T10:05:00Z' },
        timestamp: '2023-01-01T10:05:00Z',
        previousHash: 'b',
        hash: 'c'
      },
      {
        action: 'UPDATE_TASK',
        entityId: '1',
        payload: { status: 'completed' },
        timestamp: '2023-01-01T10:10:00Z',
        previousHash: 'c',
        hash: 'd'
      },
      {
        action: 'DELETE_TASK',
        entityId: '2',
        payload: { deleted: true },
        timestamp: '2023-01-01T10:15:00Z',
        previousHash: 'd',
        hash: 'e'
      }
    ];

    it('should reconstruct state at T1 (after first create)', () => {
      const state = service.reconstructState(logs, new Date('2023-01-01T10:01:00Z'));
      expect(state.length).toBe(1);
      expect(state[0]._id).toBe('1');
    });

    it('should reconstruct state at T2 (after second create)', () => {
      const state = service.reconstructState(logs, new Date('2023-01-01T10:06:00Z'));
      expect(state.length).toBe(2);
      expect(state.find(t => t._id === '1')).toBeTruthy();
      expect(state.find(t => t._id === '2')).toBeTruthy();
    });

    it('should reconstruct state at T3 (after update)', () => {
      const state = service.reconstructState(logs, new Date('2023-01-01T10:11:00Z'));
      expect(state.length).toBe(2);
      const t1 = state.find(t => t._id === '1');
      expect(t1?.status).toBe('completed');
    });

    it('should reconstruct state at T4 (after delete)', () => {
      const state = service.reconstructState(logs, new Date('2023-01-01T10:16:00Z'));
      expect(state.length).toBe(1);
      expect(state[0]._id).toBe('1');
      expect(state.find(t => t._id === '2')).toBeUndefined();
    });
  });
});
