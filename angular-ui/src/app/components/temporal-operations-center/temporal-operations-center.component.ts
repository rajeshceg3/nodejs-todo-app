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
        <!-- Main Time Display -->
        <div class="time-display-wrapper">
          <div class="time-display-large">
            {{ currentReplayTime | date:'mediumTime' }}
          </div>
          <div class="date-small">{{ currentReplayTime | date:'fullDate' }}</div>
        </div>

        <!-- Custom Slider -->
        <div class="slider-container">
          <div class="slider-track-bg"></div>
          <div class="slider-track-fill" [style.width.%]="(currentTick/totalTicks)*100"></div>
          <input
            type="range"
            [min]="0"
            [max]="totalTicks"
            [value]="currentTick"
            (input)="onSliderChange($event)"
            class="time-slider"
            aria-label="Time travel slider"
          >
          <!-- Tick Marks -->
          <div class="tick-marks">
            <span class="tick start">START</span>
            <span class="tick end">NOW</span>
          </div>
        </div>

        <!-- Playback Actions -->
        <div class="playback-actions">
          <button (click)="togglePlayback()" class="play-btn" [class.playing]="isPlaying">
            <div class="icon-wrapper">
              <svg *ngIf="!isPlaying" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <svg *ngIf="isPlaying" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            </div>
            <span class="btn-text">{{ isPlaying ? 'Pause Simulation' : 'Replay History' }}</span>
          </button>

          <button (click)="jumpToNow()" class="secondary-btn" title="Jump to present">
            Live State
          </button>
        </div>
      </div>

      <!-- Live Metrics Dashboard -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon t-blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"></path></svg>
          </div>
          <div class="metric-content">
            <div class="metric-label">Active Tasks</div>
            <div class="metric-value">{{ reconstructedTodos.length }}</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon t-purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div class="metric-content">
             <div class="metric-label">Events Processed</div>
             <div class="metric-value">{{ currentLogIndex }} <span class="metric-total">/ {{ logs.length }}</span></div>
          </div>
        </div>
      </div>

      <!-- State Visualizer -->
      <div class="reconstructed-view">
        <div class="view-header">
           <h3 class="view-title">System State Snapshot</h3>
           <div class="live-indicator" [class.active]="currentTick === totalTicks">
             <div class="live-dot"></div>
             {{ currentTick === totalTicks ? 'LIVE' : 'REPLAY' }}
           </div>
        </div>

        <div class="todo-grid-visual" *ngIf="reconstructedTodos.length > 0; else noTasks">
          <div *ngFor="let todo of reconstructedTodos" class="visual-card" [ngClass]="todo.priority || 'medium'">
            <div class="card-status-line"></div>
            <div class="visual-content">
              <div class="visual-header">
                 <span class="visual-prio">{{ todo.priority || 'Medium' }}</span>
                 <span class="visual-date">{{ todo.createdAt | date:'MMM d' }}</span>
              </div>
              <div class="visual-text">{{ todo.content }}</div>
            </div>
          </div>
        </div>

        <ng-template #noTasks>
          <div class="empty-state">
            <div class="radar-scan"></div>
            <p>No active entities in this timeframe.</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .toc-container {
      max-width: 900px;
      margin: 0 auto;
      animation: fadeIn 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }

    h1 { font-size: 2.2rem; margin-bottom: 8px; letter-spacing: -0.03em; }
    .subtitle { color: var(--color-text-secondary); margin: 0; font-size: 1.1rem; }

    .status-badge {
      display: flex;
      align-items: center;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 8px 16px;
      border-radius: 99px;
      background: rgba(62, 207, 142, 0.1);
      color: var(--color-success);
      border: 1px solid rgba(62, 207, 142, 0.2);
    }

    .indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      margin-right: 8px;
      box-shadow: 0 0 10px currentColor;
      animation: pulse 2s infinite;
    }

    @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }

    /* Controls Card */
    .controls-card {
      background: var(--color-surface);
      padding: 40px;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      border: 1px solid rgba(0,0,0,0.03);
      margin-bottom: 32px;
      position: relative;
      overflow: hidden;
    }

    /* Subtle background grid */
    .controls-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: radial-gradient(#e2e8f0 1.5px, transparent 1.5px);
      background-size: 24px 24px;
      opacity: 0.4;
      pointer-events: none;
    }

    .time-display-wrapper {
      text-align: center;
      margin-bottom: 40px;
      position: relative;
      z-index: 2;
    }

    .time-display-large {
      font-size: 4rem;
      font-weight: 800;
      font-variant-numeric: tabular-nums;
      color: var(--color-text-primary);
      line-height: 1;
      letter-spacing: -0.05em;
      text-shadow: 0 4px 8px rgba(0,0,0,0.05);
    }

    .date-small {
      font-size: 1.1rem;
      font-weight: 500;
      color: var(--color-text-secondary);
      margin-top: 12px;
    }

    /* Slider */
    .slider-container {
      position: relative;
      height: 48px;
      margin-bottom: 40px;
      display: flex;
      align-items: center;
      z-index: 2;
      padding: 0 10px;
    }

    .slider-track-bg {
      position: absolute;
      left: 0; right: 0; top: 50%;
      height: 8px;
      background: #e2e8f0;
      border-radius: 4px;
      transform: translateY(-50%);
      box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
    }

    .slider-track-fill {
      position: absolute;
      left: 0; top: 50%;
      height: 8px;
      background: linear-gradient(90deg, var(--color-primary-light), var(--color-primary));
      border-radius: 4px;
      transform: translateY(-50%);
      pointer-events: none;
      box-shadow: 0 2px 10px rgba(99, 91, 255, 0.4);
    }

    .time-slider {
      position: absolute;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
      z-index: 3;
      margin: 0;
    }

    /* Custom Thumb Visual (Fake) */
    .slider-track-fill::after {
      content: '';
      position: absolute;
      right: -12px;
      top: 50%;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: white;
      border: 5px solid var(--color-primary);
      transform: translateY(-50%);
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      transition: transform 0.1s;
    }

    .slider-container:hover .slider-track-fill::after {
      transform: translateY(-50%) scale(1.1);
    }

    .tick-marks {
      position: absolute;
      bottom: -16px;
      left: 0; right: 0;
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-text-tertiary);
      letter-spacing: 0.05em;
    }

    .playback-actions {
      display: flex;
      justify-content: center;
      gap: 20px;
      position: relative;
      z-index: 2;
    }

    .play-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--color-text-primary);
      color: white;
      border: none;
      padding: 14px 36px;
      border-radius: 99px;
      font-weight: 600;
      font-size: 1.05rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
      box-shadow: 0 10px 25px -5px rgba(26, 31, 54, 0.4);
    }

    .play-btn:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 15px 35px -5px rgba(26, 31, 54, 0.5);
    }

    .play-btn.playing {
      background: white;
      color: var(--color-text-primary);
      border: 2px solid var(--color-text-primary);
    }

    .secondary-btn {
      background: white;
      border: 1px solid var(--color-border);
      color: var(--color-text-secondary);
      padding: 14px 28px;
      border-radius: 99px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .secondary-btn:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }

    .metric-card {
      background: white;
      padding: 24px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: transform 0.2s;
    }

    .metric-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

    .metric-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .metric-icon.t-blue { background: #eff6ff; color: #3b82f6; }
    .metric-icon.t-purple { background: #f5f3ff; color: #8b5cf6; }

    .metric-label { font-size: 0.85rem; color: var(--color-text-secondary); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.03em; }
    .metric-value { font-size: 1.75rem; font-weight: 800; color: var(--color-text-primary); }
    .metric-total { font-size: 1rem; color: var(--color-text-tertiary); font-weight: 500; }

    /* Visualizer */
    .reconstructed-view {
      background: white;
      border-radius: var(--radius-lg);
      padding: 32px;
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-sm);
    }

    .view-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .view-title { font-size: 1.25rem; font-weight: 700; margin: 0; }

    .live-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-text-tertiary);
    }
    .live-indicator.active { color: var(--color-danger); }

    .live-dot {
      width: 8px; height: 8px; border-radius: 50%; background: currentColor;
    }
    .live-indicator.active .live-dot {
      box-shadow: 0 0 8px var(--color-danger);
      animation: pulse 1s infinite;
    }

    .todo-grid-visual {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 20px;
    }

    .visual-card {
      background: white;
      border-radius: 12px;
      border: 1px solid var(--color-border);
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
      position: relative;
      overflow: hidden;
      transition: transform 0.2s;
    }
    .visual-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }

    .card-status-line { height: 4px; width: 100%; background: #e2e8f0; }
    .critical .card-status-line { background: var(--color-danger); }
    .high .card-status-line { background: #d97706; }
    .medium .card-status-line { background: var(--color-primary); }
    .low .card-status-line { background: var(--color-success); }

    .visual-content { padding: 16px 20px; }

    .visual-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.75rem; color: var(--color-text-tertiary); font-weight: 700; text-transform: uppercase; }

    .visual-text { font-size: 1rem; font-weight: 500; color: var(--color-text-primary); line-height: 1.5; }

    .empty-state {
      padding: 80px;
      text-align: center;
      color: var(--color-text-tertiary);
      background: #f8fafc;
      border-radius: 16px;
      border: 2px dashed #e2e8f0;
    }

    @media (max-width: 600px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .time-display-large { font-size: 2.5rem; }
      .metrics-grid { grid-template-columns: 1fr; }
      .playback-actions { flex-direction: column; width: 100%; }
      .play-btn { width: 100%; justify-content: center; }
      .secondary-btn { width: 100%; }
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

  integrityStatus = 'VERIFIED';

  currentLogIndex = 0;

  constructor(private auditReplayService: AuditReplayService) {}

  ngOnInit(): void {
    this.auditReplayService.fetchLogs().subscribe(logs => {
      this.logs = logs;
      // Re-sort to ensure time order for playback
      this.logs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      if (this.logs.length > 0) {
        this.startTime = new Date(this.logs[0].timestamp).getTime();
        this.endTime = new Date().getTime();

        // Padding before first event
        this.startTime -= 1000 * 60;
      } else {
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
      this.currentTick = this.totalTicks;
      return;
    }
    const elapsed = this.currentReplayTime.getTime() - this.startTime;
    this.currentTick = Math.floor((elapsed / range) * this.totalTicks);
  }

  updateState(): void {
    this.reconstructedTodos = this.auditReplayService.reconstructState(this.logs, this.currentReplayTime);
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

        this.currentTick += 1;
        this.updateTimeFromTick();
        this.updateState();
      }, 100);
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
