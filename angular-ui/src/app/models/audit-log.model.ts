export interface AuditLog {
  action: 'CREATE_TASK' | 'UPDATE_TASK' | 'DELETE_TASK';
  entityId: string;
  payload: any;
  timestamp: string;
  previousHash: string;
  hash: string;
}
