import { Component, Input, Output, EventEmitter, HostBinding, HostListener, ElementRef } from '@angular/core';
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

  @HostBinding('class.completed-item') get isCompleted() {
    return this.todo.status === 'completed';
  }

  // Swipe logic properties
  private touchStartX = 0;
  private touchEndX = 0;
  swipeOffset = 0;
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
    this.isSwiping = true;
    this.el.nativeElement.style.transition = 'none'; // Disable transition for direct follow
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (!this.isSwiping) return;
    const currentX = event.changedTouches[0].screenX;
    const diff = currentX - this.touchStartX;

    // Only allow left swipe
    if (diff < 0) {
      this.swipeOffset = Math.max(diff, -100); // Limit swipe distance
      // We can apply transform here directly or use a bound variable in template?
      // Since we are in the component, let's use style binding via HostBinding or template.
      // But for performance, updating style directly is better.
      // Actually, we should probably transform the card content, not the host, to reveal a background.
      // But the current CSS structure has the background on the card.
      // Let's transform the host for now.
      this.el.nativeElement.style.transform = `translateX(${this.swipeOffset}px)`;
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.isSwiping = false;
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipeGesture();
  }

  private handleSwipeGesture() {
    this.el.nativeElement.style.transition = 'transform 0.3s ease-out';
    if (this.touchStartX - this.touchEndX > 100) { // Threshold for delete
      // Swiped left enough
      this.el.nativeElement.style.transform = `translateX(-100%)`;
      // Wait for animation then delete
      setTimeout(() => this.onDelete(), 300);
    } else {
      // Snap back
      this.swipeOffset = 0;
      this.el.nativeElement.style.transform = `translateX(0)`;
    }
  }
}
