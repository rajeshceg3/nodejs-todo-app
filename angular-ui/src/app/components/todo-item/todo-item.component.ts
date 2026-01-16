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
  @ViewChild('actionIcon') actionIcon!: ElementRef; // Reference to the trash icon if we add it

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
      // Rubber band resistance
      // After -100px, applying heavy resistance
      let translateX = diff;
      const threshold = -100;

      if (diff < threshold) {
         const extra = diff - threshold;
         translateX = threshold + (extra * 0.2); // 0.2 friction factor
      }

      // Cap the max swipe visually to prevent breaking layout
      translateX = Math.max(translateX, -150);

      this.slideLayer.nativeElement.style.transform = `translateX(${translateX}px)`;

      // Optional: Scale the background icon based on pull depth
      // We would need to reference the .action-icon
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    if (!this.isSwiping || !this.slideLayer) return;
    this.isSwiping = false;

    const diff = this.touchCurrentX - this.touchStartX;

    // Restore transition with a nice spring-like curve
    this.slideLayer.nativeElement.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    const deleteThreshold = -80;

    if (diff < deleteThreshold) {
      // Slide all the way out
      this.slideLayer.nativeElement.style.transform = `translateX(-100%)`;

      // Trigger delete after animation
      setTimeout(() => this.onDelete(), 400);
    } else {
      // Snap back
      this.slideLayer.nativeElement.style.transform = `translateX(0)`;
    }
  }
}
