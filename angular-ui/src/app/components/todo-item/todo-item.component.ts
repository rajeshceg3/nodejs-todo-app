import { Component, Input, Output, EventEmitter, HostBinding, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.css']
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo;
  @Output() delete = new EventEmitter<string>();
  @Output() toggleComplete = new EventEmitter<Todo>();

  @ViewChild('slideLayer') slideLayer!: ElementRef;

  @HostBinding('class.completed-item') get isCompleted() {
    return this.todo.status === 'completed';
  }

  // Swipe logic properties
  private touchStartX = 0;
  private touchCurrentX = 0;
  isSwiping = false;

  constructor(private el: ElementRef) {}

  onDelete(): void {
    if (this.todo._id) {
       this.delete.emit(this.todo._id);
    }
  }

  onToggleComplete(): void {
    this.toggleComplete.emit(this.todo);
  }

  // Touch Events for Swipe-to-Delete
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartX = event.changedTouches[0].screenX;
    this.touchCurrentX = this.touchStartX;
    this.isSwiping = true;

    // Remove transition for instant follow
    if (this.slideLayer) {
      this.slideLayer.nativeElement.style.transition = 'none';
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.isSwiping || !this.slideLayer) return;

    this.touchCurrentX = event.changedTouches[0].screenX;
    const diff = this.touchCurrentX - this.touchStartX;

    // Only handle left swipe
    if (diff < 0) {
      // Add resistance
      const resistance = 1.0;
      const translateX = Math.max(diff * resistance, -120); // Limit swipe

      this.slideLayer.nativeElement.style.transform = `translateX(${translateX}px)`;

      // Scale trash icon if swipe is deep (optional, would need ViewChild for icon)
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    if (!this.isSwiping || !this.slideLayer) return;
    this.isSwiping = false;

    const diff = this.touchCurrentX - this.touchStartX;

    // Restore transition
    this.slideLayer.nativeElement.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';

    if (diff < -80) { // Threshold to trigger delete
      // Slide all the way out
      this.slideLayer.nativeElement.style.transform = `translateX(-100%)`;
      // Trigger delete after animation
      setTimeout(() => this.onDelete(), 300);
    } else {
      // Snap back
      this.slideLayer.nativeElement.style.transform = `translateX(0)`;
    }
  }
}
