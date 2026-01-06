import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditReplayService } from '../../services/audit-replay.service';
import { AuditLog } from '../../models/audit-log.model';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-temporal-operations-center',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  template: `
    <div class="toc-container">
      <header class="toc-header">
        <h1>Temporal Operations Center (TOC)</h1>
        <div class="status-badge" [class.secure]="integrityStatus === 'VERIFIED'">
          System Integrity: {{ integrityStatus }}
        </div>
      </header>

      <div class="controls-panel">
        <div class="time-display">
          <span class="label">Replay Time:</span>
          <span class="value">{{ currentReplayTime | date:'medium' }}</span>
        </div>

        <div class="slider-container">
          <input
            type="range"
            [min]="0"
            [max]="totalTicks"
            [value]="currentTick"
            (input)="onSliderChange($event)"
            class="time-slider"
          >
          <div class="slider-labels">
            <span>Genesis</span>
            <span>Now</span>
          </div>
        </div>

        <div class="playback-controls">
          <button (click)="togglePlayback()" class="btn-primary">
            {{ isPlaying ? 'Pause Replay' : 'Start Replay' }}
          </button>
          <button (click)="jumpToNow()" class="btn-secondary">
            Jump to Present
          </button>
        </div>
      </div>

      <div class="visualization-grid">
        <div class="metric-card">
          <h3>Active Tasks</h3>
          <div class="metric-value">{{ reconstructedTodos.length }}</div>
        </div>
        <div class="metric-card">
          <h3>Audit Events Processed</h3>
          <div class="metric-value">{{ currentLogIndex + 1 }} / {{ logs.length }}</div>
        </div>
      </div>

      <div class="reconstructed-view">
        <h2>State Reconstruction</h2>
        <div class="todo-list" *ngIf="reconstructedTodos.length > 0; else noTasks">
          <div *ngFor="let todo of reconstructedTodos" class="todo-item" [class.priority-critical]="todo.priority === 'critical'">
            <div class="todo-header">
              <span class="priority-badge" [class]="todo.priority">{{ todo.priority }}</span>
              <span class="created-at">{{ todo.createdAt | date:'short' }}</span>
            </div>
            <div class="todo-content">{{ todo.content }}</div>
            <div class="todo-tags" *ngIf="todo.tags?.length">
              <span *ngFor="let tag of todo.tags">#{{ tag }}</span>
            </div>
          </div>
        </div>
        <ng-template #noTasks>
          <div class="empty-state">No active tasks at this point in time.</div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .toc-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      font-family: 'Inter', sans-serif; /* Fallback to global var if needed */
    }

    .toc-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 2px solid var(--color-text-tertiary);
      padding-bottom: 1rem;
    }

    .status-badge {
      background-color: var(--color-bg);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-sm);
      font-weight: bold;
      border: 1px solid var(--color-text-tertiary);
    }
    .status-badge.secure {
      color: var(--color-success);
      border-color: var(--color-success);
    }

    .controls-panel {
      background: var(--color-surface);
      padding: 1.5rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      margin-bottom: 2rem;
    }

    .time-display {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      text-align: center;
    }
    .time-display .value {
      font-weight: bold;
      color: var(--color-primary);
      margin-left: 0.5rem;
    }

    .slider-container {
      margin-bottom: 1.5rem;
    }

    .time-slider {
      width: 100%;
      cursor: pointer;
    }

    .slider-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      margin-top: 0.5rem;
    }

    .playback-controls {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-primary {
      background-color: var(--color-primary);
      color: white;
      border: none;
      padding: 0.5rem 1.5rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-weight: 600;
    }

    .btn-secondary {
      background-color: transparent;
      border: 1px solid var(--color-text-secondary);
      color: var(--color-text-secondary);
      padding: 0.5rem 1.5rem;
      border-radius: var(--radius-sm);
      cursor: pointer;
    }

    .visualization-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: var(--color-surface);
      padding: 1rem;
      border-radius: var(--radius-sm);
      text-align: center;
      box-shadow: var(--shadow-sm);
    }

    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      color: var(--color-text-primary);
    }

    .reconstructed-view {
      background: var(--color-surface);
      padding: 1.5rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
    }

    .todo-item {
      border: 1px solid #e0e6ed;
      border-radius: var(--radius-sm);
      padding: 1rem;
      margin-bottom: 0.75rem;
      background: #fff;
    }

    .priority-critical {
      border-left: 4px solid var(--color-danger);
    }

    .todo-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .priority-badge {
      text-transform: uppercase;
      font-weight: bold;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .priority-badge.critical { color: var(--color-danger); background: #ffebeb; }
    .priority-badge.high { color: var(--color-warning); background: #fff8e6; }
    .priority-badge.medium { color: var(--color-primary); background: #ebe9ff; }
    .priority-badge.low { color: var(--color-success); background: #e6fffa; }

    .created-at {
      color: var(--color-text-tertiary);
    }

    .todo-tags {
      margin-top: 0.5rem;
      color: var(--color-primary);
      font-size: 0.875rem;
    }

    .todo-tags span {
      margin-right: 0.5rem;
    }

    .empty-state {
      text-align: center;
      color: var(--color-text-tertiary);
      padding: 2rem;
    }
  `]
})
export class TemporalOperationsCenterComponent implements OnInit, OnDestroy {
  logs: AuditLog[] = [];
  reconstructedTodos: Todo[] = [];

  // Slider state
  totalTicks = 100;
  currentTick = 100;

  // Time state
  startTime = new Date().getTime();
  endTime = new Date().getTime();
  currentReplayTime = new Date();

  // Playback state
  isPlaying = false;
  playbackInterval: any;

  integrityStatus = 'VERIFIED'; // Mock for now, or fetch from verify endpoint

  currentLogIndex = 0;

  constructor(private auditReplayService: AuditReplayService) {}

  ngOnInit(): void {
    this.auditReplayService.fetchLogs().subscribe(logs => {
      this.logs = logs; // API returns desc? Service sorts them?
      // Service fetchLogs returns raw. Reconstruct sorts them.
      // But we need them sorted here for time calculations.
      this.logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      if (this.logs.length > 0) {
        this.startTime = new Date(this.logs[0].timestamp).getTime();
        this.endTime = new Date().getTime(); // Now

        // Add some padding to start time so we can see "before genesis"
        this.startTime -= 1000 * 60; // 1 minute buffer
      } else {
        // Fallback if empty
        this.startTime = new Date().getTime() - 1000 * 60 * 60;
      }

      this.updateState();
    });
  }

  ngOnDestroy(): void {
    if (this.playbackInterval) {
      clearInterval(this.playbackInterval);
    }
  }

  onSliderChange(event: any): void {
    this.currentTick = parseInt(event.target.value, 10);
    this.updateTimeFromTick();
    this.updateState();
  }

  updateTimeFromTick(): void {
    const range = this.endTime - this.startTime;
    const offset = range * (this.currentTick / this.totalTicks);
    this.currentReplayTime = new Date(this.startTime + offset);
  }

  updateTickFromTime(): void {
    const range = this.endTime - this.startTime;
    if (range === 0) {
      this.currentTick = 100;
      return;
    }
    const elapsed = this.currentReplayTime.getTime() - this.startTime;
    this.currentTick = Math.floor((elapsed / range) * this.totalTicks);
  }

  updateState(): void {
    this.reconstructedTodos = this.auditReplayService.reconstructState(this.logs, this.currentReplayTime);

    // Calculate how many logs we've passed
    this.currentLogIndex = this.logs.filter(l => new Date(l.timestamp) <= this.currentReplayTime).length;
  }

  togglePlayback(): void {
    this.isPlaying = !this.isPlaying;

    if (this.isPlaying) {
      this.playbackInterval = setInterval(() => {
        if (this.currentTick >= this.totalTicks) {
          this.isPlaying = false;
          clearInterval(this.playbackInterval);
          return;
        }

        this.currentTick += 1; // Increment tick
        this.updateTimeFromTick();
        this.updateState();
      }, 100); // 100ms per step
    } else {
      clearInterval(this.playbackInterval);
    }
  }

  jumpToNow(): void {
    this.currentTick = this.totalTicks;
    this.updateTimeFromTick();
    this.updateState();
    this.isPlaying = false;
    clearInterval(this.playbackInterval);
  }
}
