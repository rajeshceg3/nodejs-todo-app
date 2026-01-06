import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AuditLog } from '../models/audit-log.model';
import { Todo } from '../models/todo.model';

interface AuditLogResponse {
  logs: AuditLog[];
}

@Injectable({
  providedIn: 'root'
})
export class AuditReplayService {
  private apiUrl = '/audit-logs';

  constructor(private http: HttpClient) { }

  fetchLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLogResponse>(this.apiUrl).pipe(
      map(response => response.logs)
    );
  }

  /**
   * Reconstructs the state of the Todo list at a specific point in time.
   * @param logs The full history of audit logs.
   * @param targetTime The timestamp to reconstruct the state for.
   * @returns An array of Todo items as they existed at targetTime.
   */
  reconstructState(logs: AuditLog[], targetTime: Date): Todo[] {
    // 1. Sort logs by timestamp ascending (Genesis first)
    // The API returns them descending, so we must reverse or sort.
    const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const todoMap = new Map<string, Todo>();

    for (const log of sortedLogs) {
      const logTime = new Date(log.timestamp);

      // Stop if we've passed the target time
      if (logTime > targetTime) {
        break;
      }

      switch (log.action) {
        case 'CREATE_TASK':
          // Payload is the full newTodo object
          // We need to ensure _id is present. The API returns it in the response,
          // but the Audit Log payload might not have it if it was created before insertion?
          // Let's check index.js:
          // await createAuditLog(req.db, 'CREATE_TASK', result.insertedId.toString(), newTodo);
          // The 'newTodo' object passed to createAuditLog does NOT have _id.
          // BUT, createAuditLog receives 'entityId'. So we reconstruct the object.
          const newTodo: Todo = {
            ...log.payload,
            _id: log.entityId
          };
          todoMap.set(log.entityId, newTodo);
          break;

        case 'UPDATE_TASK':
          // Payload is the updates object
          if (todoMap.has(log.entityId)) {
            const existingTodo = todoMap.get(log.entityId)!;
            const updatedTodo = { ...existingTodo, ...log.payload };
            todoMap.set(log.entityId, updatedTodo);
          }
          break;

        case 'DELETE_TASK':
          // Payload is { deleted: true }
          todoMap.delete(log.entityId);
          break;
      }
    }

    return Array.from(todoMap.values());
  }
}
