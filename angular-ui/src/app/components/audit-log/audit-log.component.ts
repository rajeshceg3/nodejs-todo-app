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
    <div class="page-header">
      <div class="header-content">
        <h2>Secure Operational Task Ledger</h2>
        <p class="subtitle">Immutable hash-chained record of all system operations.</p>
      </div>

      <div class="status-card" [ngClass]="{'secure': integrityStatus === 'INTEGRITY_VERIFIED', 'compromised': integrityStatus !== 'INTEGRITY_VERIFIED'}">
        <div class="status-icon">
          <svg *ngIf="integrityStatus === 'INTEGRITY_VERIFIED'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <svg *ngIf="integrityStatus !== 'INTEGRITY_VERIFIED'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
             <line x1="12" y1="9" x2="12" y2="13"></line>
             <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
        <div class="status-info">
          <span class="status-label">Chain Status</span>
          <span class="status-value">{{ integrityStatus === 'INTEGRITY_VERIFIED' ? 'Verified & Secure' : 'Compromised' }}</span>
        </div>
        <button (click)="verifyIntegrity()" class="verify-btn" [class.loading]="isVerifying">
          <svg class="refresh-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M23 4v6h-6"></path>
             <path d="M1 20v-6h6"></path>
             <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="log-feed">
      <div class="log-card" *ngFor="let log of logs">
        <div class="log-icon-area" [ngClass]="log.action">
          <div class="log-line"></div>
          <div class="icon-circle">
            <svg *ngIf="log.action === 'CREATE_TASK'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <svg *ngIf="log.action === 'UPDATE_TASK'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            <svg *ngIf="log.action === 'DELETE_TASK'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </div>
        </div>

        <div class="log-content">
          <div class="log-header">
            <span class="action-badge" [ngClass]="log.action">{{ formatAction(log.action) }}</span>
            <span class="timestamp">{{ log.timestamp | date:'MMM d, y, h:mm:ss a' }}</span>
          </div>

          <div class="log-details">
            <div class="detail-row">
              <span class="label">Entity ID:</span>
              <span class="value mono">{{ log.entityId }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Chain Hash:</span>
              <span class="value mono hash" title="{{ log.hash }}">{{ log.hash | slice:0:20 }}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      gap: 20px;
    }

    h2 {
      font-size: 1.5rem;
      margin-bottom: 4px;
    }

    .subtitle {
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      margin: 0;
    }

    /* Status Card */
    .status-card {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border);
      min-width: 240px;
    }

    .status-card.secure { border-left: 4px solid var(--color-success); }
    .status-card.compromised { border-left: 4px solid var(--color-danger); }

    .status-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
    }

    .secure .status-icon { background: rgba(62, 207, 142, 0.1); color: var(--color-success); }
    .compromised .status-icon { background: rgba(226, 37, 37, 0.1); color: var(--color-danger); }

    .status-info {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .status-label {
      font-size: 0.7rem;
      text-transform: uppercase;
      color: var(--color-text-tertiary);
      font-weight: 600;
    }

    .status-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .verify-btn {
      background: transparent;
      border: none;
      color: var(--color-text-tertiary);
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all 0.2s;
    }

    .verify-btn:hover {
      background: rgba(0,0,0,0.05);
      color: var(--color-primary);
    }

    .loading .refresh-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Log Feed */
    .log-feed {
      display: flex;
      flex-direction: column;
    }

    .log-card {
      display: flex;
      padding-bottom: 24px;
      position: relative;
    }

    .log-card:last-child {
      padding-bottom: 0;
    }

    .log-card:last-child .log-line {
      display: none;
    }

    .log-icon-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 16px;
      position: relative;
      min-width: 32px;
    }

    .icon-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      background: white;
      border: 2px solid;
    }

    .log-line {
      position: absolute;
      top: 32px;
      bottom: -4px; /* Connects to next card */
      width: 2px;
      background-color: var(--color-border);
      z-index: 1;
    }

    /* Action Colors */
    .CREATE_TASK .icon-circle { border-color: var(--color-success); color: var(--color-success); }
    .UPDATE_TASK .icon-circle { border-color: var(--color-warning); color: #d97706; }
    .DELETE_TASK .icon-circle { border-color: var(--color-danger); color: var(--color-danger); }

    .log-content {
      background: white;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 16px;
      flex-grow: 1;
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s;
    }

    .log-content:hover {
      transform: translateX(4px);
      box-shadow: var(--shadow-md);
    }

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .action-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      letter-spacing: 0.5px;
    }

    .CREATE_TASK.action-badge { background: #d1fae5; color: #065f46; }
    .UPDATE_TASK.action-badge { background: #fef3c7; color: #92400e; }
    .DELETE_TASK.action-badge { background: #fee2e2; color: #991b1b; }

    .timestamp {
      font-size: 0.8rem;
      color: var(--color-text-tertiary);
    }

    .detail-row {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
      font-size: 0.85rem;
    }

    .label {
      color: var(--color-text-secondary);
      width: 80px;
      flex-shrink: 0;
    }

    .value {
      color: var(--color-text-primary);
      word-break: break-all;
    }

    .mono {
      font-family: 'SF Mono', 'Roboto Mono', Menlo, monospace;
      font-size: 0.8rem;
    }

    .hash {
      color: var(--color-text-tertiary);
    }

    @media (max-width: 600px) {
      .page-header {
        flex-direction: column;
        gap: 16px;
      }

      .status-card {
        width: 100%;
      }

      .log-content {
        padding: 12px;
      }
    }
  `]
})
export class AuditLogComponent implements OnInit {
  logs: AuditLog[] = [];
  integrityStatus: string = 'CHECKING...';
  isVerifying = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchLogs();
    this.verifyIntegrity();
  }

  fetchLogs() {
    this.http.get<{logs: AuditLog[]}>('/audit-logs').subscribe({
      next: (data) => {
        this.logs = data.logs.reverse(); // Show newest first
      },
      error: (err) => console.error('Error fetching logs', err)
    });
  }

  verifyIntegrity() {
    this.isVerifying = true;
    this.http.get<IntegrityReport>('/audit-logs/verify').subscribe({
      next: (data) => {
        this.integrityStatus = data.status;
        this.isVerifying = false;
      },
      error: (err) => {
        console.error('Error verifying integrity', err);
        this.integrityStatus = 'ERROR';
        this.isVerifying = false;
      }
    });
  }

  formatAction(action: string): string {
    return action.replace('_', ' ');
  }
}
