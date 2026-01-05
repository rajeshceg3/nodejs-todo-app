import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

interface AuditLog {
  action: string;
  entityId: string;
  timestamp: string;
  hash: string;
  previousHash: string;
  payload: any;
}

interface IntegrityReport {
  status: string;
  count: number;
  brokenIndices: any[];
}

@Component({
  selector: 'app-audit-log',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="audit-container">
      <div class="header">
        <h2>Secure Operational Task Ledger</h2>
        <div class="integrity-status" [ngClass]="{'secure': integrityStatus === 'INTEGRITY_VERIFIED', 'compromised': integrityStatus !== 'INTEGRITY_VERIFIED'}">
          STATUS: {{ integrityStatus }}
          <button (click)="verifyIntegrity()">VERIFY CHAIN</button>
        </div>
      </div>

      <div class="log-table-container">
        <table class="log-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>Entity ID</th>
              <th>Hash (SHA-256)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let log of logs">
              <td class="mono">{{ log.timestamp | date:'medium' }}</td>
              <td class="action-cell" [ngClass]="log.action">{{ log.action }}</td>
              <td class="mono">{{ log.entityId }}</td>
              <td class="mono hash-cell" title="{{ log.hash }}">{{ log.hash | slice:0:16 }}...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .audit-container {
      padding: 20px;
      font-family: 'Courier New', Courier, monospace;
      color: #333;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }
    h2 {
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .integrity-status {
      font-weight: bold;
      padding: 10px;
      border: 1px solid #333;
    }
    .integrity-status.secure {
      background-color: #d4edda;
      color: #155724;
      border-color: #c3e6cb;
    }
    .integrity-status.compromised {
      background-color: #f8d7da;
      color: #721c24;
      border-color: #f5c6cb;
    }
    button {
      margin-left: 10px;
      padding: 5px 10px;
      font-family: inherit;
      cursor: pointer;
      text-transform: uppercase;
      font-weight: bold;
    }
    .log-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9em;
    }
    .log-table th, .log-table td {
      border: 1px solid #ddd;
      padding: 8px;
      text-align: left;
    }
    .log-table th {
      background-color: #f2f2f2;
      text-transform: uppercase;
    }
    .mono {
      font-family: 'Courier New', monospace;
    }
    .action-cell {
      font-weight: bold;
    }
    .CREATE_TASK { color: green; }
    .UPDATE_TASK { color: orange; }
    .DELETE_TASK { color: red; }
    .hash-cell {
      color: #666;
    }
  `]
})
export class AuditLogComponent implements OnInit {
  logs: AuditLog[] = [];
  integrityStatus: string = 'CHECKING...';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchLogs();
    this.verifyIntegrity();
  }

  fetchLogs() {
    this.http.get<{logs: AuditLog[]}>('/audit-logs').subscribe({
      next: (data) => {
        this.logs = data.logs;
      },
      error: (err) => console.error('Error fetching logs', err)
    });
  }

  verifyIntegrity() {
    this.http.get<IntegrityReport>('/audit-logs/verify').subscribe({
      next: (data) => {
        this.integrityStatus = data.status;
      },
      error: (err) => {
        console.error('Error verifying integrity', err);
        this.integrityStatus = 'ERROR';
      }
    });
  }
}
