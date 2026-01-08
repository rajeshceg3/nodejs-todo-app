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
      <header class="page-header">
        <div class="header-content">
          <h1>Temporal Operations Center</h1>
          <p class="subtitle">Replay system state from immutable audit logs.</p>
        </div>

        <div class="status-badge secure">
           <span class="indicator"></span>
           System Integrity: {{ integrityStatus }}
        </div>
      </header>

      <div class="controls-card">
        <div class="time-display-large">
          {{ currentReplayTime | date:'mediumTime' }}
          <span class="date-small">{{ currentReplayTime | date:'mediumDate' }}</span>
        </div>

        <div class="slider-wrapper">
          <input
            type="range"
            [min]="0"
            [max]="totalTicks"
            [value]="currentTick"
            (input)="onSliderChange($event)"
            class="time-slider"
          >
          <div class="slider-track-fill" [style.width.%]="(currentTick/totalTicks)*100"></div>
        </div>

        <div class="slider-labels">
          <span>Start of Log</span>
          <span>Now</span>
        </div>

        <div class="playback-actions">
          <button (click)="togglePlayback()" class="play-btn" [class.playing]="isPlaying">
            <svg *ngIf="!isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            <svg *ngIf="isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            {{ isPlaying ? 'Pause Replay' : 'Start Replay' }}
          </button>

          <button (click)="jumpToNow()" class="secondary-btn">
            Live
          </button>
        </div>
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Active Tasks</div>
          <div class="metric-value">{{ reconstructedTodos.length }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Events Processed</div>
          <div class="metric-value">{{ currentLogIndex }} <span class="metric-total">/ {{ logs.length }}</span></div>
        </div>
      </div>

      <div class="reconstructed-view">
        <h3 class="view-title">System State at {{ currentReplayTime | date:'shortTime' }}</h3>

        <div class="todo-grid" *ngIf="reconstructedTodos.length > 0; else noTasks">
          <div *ngFor="let todo of reconstructedTodos" class="mini-card" [class]="todo.priority || 'medium'">
            <div class="mini-card-header">
               <span class="mini-priority-dot" [class]="todo.priority || 'medium'"></span>
               <span class="mini-date">{{ todo.createdAt | date:'MMM d' }}</span>
            </div>
            <div class="mini-content">{{ todo.content }}</div>
          </div>
        </div>

        <ng-template #noTasks>
          <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="empty-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>No active tasks at this point in time.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .toc-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    h1 { font-size: 1.5rem; margin-bottom: 4px; }
    .subtitle { color: var(--color-text-secondary); margin: 0; font-size: 0.9rem; }

    .status-badge {
      display: flex;
      align-items: center;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 20px;
      background: rgba(62, 207, 142, 0.1);
      color: var(--color-success);
      border: 1px solid rgba(62, 207, 142, 0.2);
    }

    .indicator {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      margin-right: 8px;
      box-shadow: 0 0 8px currentColor;
    }

    /* Controls */
    .controls-card {
      background: linear-gradient(135deg, var(--color-surface), #f8fafc);
      padding: 24px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--color-border);
      margin-bottom: 24px;
      text-align: center;
    }

    .time-display-large {
      font-size: 2.5rem;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--color-text-primary);
      margin-bottom: 8px;
      line-height: 1;
    }

    .date-small {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--color-text-tertiary);
      margin-top: 4px;
    }

    /* Custom Slider */
    .slider-wrapper {
      position: relative;
      height: 6px;
      background: #e2e8f0;
      border-radius: 3px;
      margin: 32px 0 12px;
    }

    .slider-track-fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      background: var(--color-primary);
      border-radius: 3px;
      pointer-events: none;
    }

    .time-slider {
      position: absolute;
      top: -7px;
      left: 0;
      width: 100%;
      height: 20px;
      opacity: 0; /* Hide default, but keep functional */
      cursor: pointer;
      z-index: 2;
    }

    /* Thumb (needs explicit styling if not hiding default) -
       For "ultrathink" visual, we can make a custom thumb using a pseudo-element on wrapper
       that moves with left%, but simple native slider with good track is robust.
       Let's stick to native slider but styled for now for robustness across browsers without complex JS.
    */
    .time-slider {
      -webkit-appearance: none;
      opacity: 1;
      background: transparent;
    }
    .time-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: var(--color-surface);
      border: 2px solid var(--color-primary);
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      margin-top: -7px; /* Align with track */
    }
    .time-slider::-webkit-slider-runnable-track {
      height: 6px;
      background: transparent; /* Handled by wrapper */
    }

    .slider-labels {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    .playback-actions {
      display: flex;
      justify-content: center;
      gap: 12px;
    }

    .play-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-primary);
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 30px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(99, 91, 255, 0.3);
    }

    .play-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(99, 91, 255, 0.4);
    }

    .play-btn.playing {
      background: var(--color-text-primary);
      box-shadow: 0 4px 12px rgba(10, 37, 64, 0.3);
    }

    .secondary-btn {
      background: transparent;
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      padding: 10px 20px;
      border-radius: 30px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .secondary-btn:hover {
      background: var(--color-bg);
      color: var(--color-text-primary);
    }

    /* Metrics */
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }

    .metric-card {
      background: white;
      padding: 16px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .metric-label {
      font-size: 0.8rem;
      text-transform: uppercase;
      color: var(--color-text-tertiary);
      font-weight: 600;
      margin-bottom: 4px;
    }

    .metric-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .metric-total {
      font-size: 1rem;
      color: var(--color-text-tertiary);
      font-weight: 500;
    }

    /* Reconstructed View */
    .reconstructed-view {
      margin-bottom: 40px;
    }

    .view-title {
      font-size: 1rem;
      color: var(--color-text-secondary);
      margin-bottom: 12px;
      font-weight: 600;
    }

    .todo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    .mini-card {
      background: white;
      padding: 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
      transition: transform 0.2s;
    }

    .mini-card:hover {
      transform: translateY(-2px);
    }

    .mini-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .mini-priority-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .mini-priority-dot.critical { background: var(--color-danger); }
    .mini-priority-dot.high { background: #d97706; }
    .mini-priority-dot.medium { background: var(--color-primary); }
    .mini-priority-dot.low { background: var(--color-success); }

    .mini-date {
      font-size: 0.7rem;
      color: var(--color-text-tertiary);
    }

    .mini-content {
      font-size: 0.9rem;
      color: var(--color-text-primary);
      font-weight: 500;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      background: #f8fafc;
      border-radius: var(--radius-md);
      border: 2px dashed var(--color-border);
      color: var(--color-text-tertiary);
    }

    .empty-icon {
      margin-bottom: 12px;
      opacity: 0.5;
    }

    @media (max-width: 600px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .time-display-large {
        font-size: 2rem;
      }

      .playback-actions {
        flex-direction: column;
      }

      .todo-grid {
        grid-template-columns: 1fr;
      }
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
