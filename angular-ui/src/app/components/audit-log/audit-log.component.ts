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
          <svg *ngIf="integrityStatus === 'INTEGRITY_VERIFIED'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
        <button (click)="verifyIntegrity()" class="verify-btn" [class.loading]="isVerifying" title="Verify Chain Integrity">
          <svg class="refresh-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M23 4v6h-6"></path>
             <path d="M1 20v-6h6"></path>
             <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="log-feed">
      <div class="log-card" *ngFor="let log of logs; let i = index">
        <div class="log-connector">
           <div class="log-icon-circle" [ngClass]="log.action">
              <svg *ngIf="log.action === 'CREATE_TASK'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              <svg *ngIf="log.action === 'UPDATE_TASK'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              <svg *ngIf="log.action === 'DELETE_TASK'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
           </div>
           <!-- Line connecting to next item -->
           <div class="connector-line" *ngIf="i < logs.length - 1"></div>
        </div>

        <div class="log-content-wrapper">
          <div class="log-content-card">
            <div class="log-header">
              <span class="action-badge" [ngClass]="log.action">{{ formatAction(log.action) }}</span>
              <span class="timestamp">{{ log.timestamp | date:'MMM d, y, h:mm:ss a' }}</span>
            </div>

            <div class="log-body">
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Entity ID</span>
                  <span class="value mono-code">{{ log.entityId }}</span>
                </div>
                <div class="info-item full-width">
                  <span class="label">Hash Chain</span>
                  <div class="hash-display">
                    <span class="hash-prefix">SHA-256</span>
                    <span class="value mono-code hash-val">{{ log.hash }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      gap: 24px;
      flex-wrap: wrap;
    }

    h2 {
      font-size: 2rem;
      margin-bottom: 8px;
      letter-spacing: -0.03em;
    }

    .subtitle {
      color: var(--color-text-secondary);
      font-size: 1.05rem;
      margin: 0;
    }

    /* Status Card - High Tech feel */
    .status-card {
      display: flex;
      align-items: center;
      padding: 16px 24px;
      background: var(--color-surface);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--color-border);
      min-width: 300px;
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .status-card.secure { border-color: rgba(34, 197, 94, 0.3); background: linear-gradient(to right, white, #f0fdf4); }
    .status-card.compromised { border-color: rgba(239, 68, 68, 0.3); background: linear-gradient(to right, white, #fef2f2); }

    .status-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 18px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }

    .secure .status-icon { background: #dcfce7; color: var(--color-success); }
    .compromised .status-icon { background: #fee2e2; color: var(--color-danger); }

    .status-info {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }

    .status-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--color-text-tertiary);
      font-weight: 700;
      letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    .status-value {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .verify-btn {
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 8px;
    }

    .verify-btn:hover {
      background: white;
      color: var(--color-primary);
      border-color: var(--color-primary);
      box-shadow: 0 4px 8px rgba(0,0,0,0.05);
      transform: translateY(-1px);
    }

    .loading .refresh-icon {
      animation: spin 1s linear infinite;
    }

    @keyframes spin { 100% { transform: rotate(360deg); } }

    /* Log Feed - Timeline Style */
    .log-feed {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .log-card {
      display: flex;
      margin-bottom: 28px;
      position: relative;
    }

    .log-connector {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-right: 28px;
      position: relative;
      min-width: 44px;
    }

    .log-icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      background: var(--color-surface);
      border: 4px solid var(--color-bg); /* Match bg color for gap effect */
      box-shadow: var(--shadow-sm);
    }

    .CREATE_TASK.log-icon-circle { background: #dcfce7; color: #166534; }
    .UPDATE_TASK.log-icon-circle { background: #fef3c7; color: #92400e; }
    .DELETE_TASK.log-icon-circle { background: #fee2e2; color: #991b1b; }

    .connector-line {
      position: absolute;
      top: 44px;
      bottom: -32px;
      width: 2px;
      background: linear-gradient(to bottom, #e2e8f0 50%, rgba(226, 232, 240, 0.2));
      z-index: 1;
    }

    .log-content-wrapper {
      flex-grow: 1;
      min-width: 0;
    }

    .log-content-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 24px;
      box-shadow: var(--shadow-sm);
      transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s;
    }

    .log-content-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: rgba(99, 91, 255, 0.2);
    }

    .log-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .action-badge {
      font-size: 0.8rem;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 99px;
      letter-spacing: 0.03em;
    }

    .CREATE_TASK.action-badge { background: #dcfce7; color: #166534; }
    .UPDATE_TASK.action-badge { background: #fef3c7; color: #92400e; }
    .DELETE_TASK.action-badge { background: #fee2e2; color: #991b1b; }

    .timestamp {
      font-size: 0.9rem;
      color: var(--color-text-tertiary);
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .label {
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .mono-code {
      font-family: 'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 0.85rem;
      color: var(--color-text-primary);
      background: #f8fafc;
      padding: 8px 12px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      word-break: break-all;
      line-height: 1.5;
    }

    .hash-display {
      display: flex;
      align-items: stretch;
      box-shadow: var(--shadow-xs);
      border-radius: 8px;
    }

    .hash-prefix {
      background: #f1f5f9;
      color: var(--color-text-secondary);
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0 12px;
      display: flex;
      align-items: center;
      border-radius: 8px 0 0 8px;
      border: 1px solid #e2e8f0;
      border-right: none;
    }

    .hash-val {
      border-radius: 0 8px 8px 0;
      flex-grow: 1;
      border-left: 1px solid #e2e8f0;
    }

    @media (max-width: 600px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .status-card {
        width: 100%;
        min-width: 0;
      }
      .log-connector {
        margin-right: 16px;
        min-width: 32px;
      }
      .log-icon-circle {
        width: 36px;
        height: 36px;
      }
      .log-content-card {
        padding: 20px;
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
        this.logs = data.logs.reverse();
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
