import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todo-item.component.html',
  styleUrls: ['./todo-item.component.css']
  // changeDetection: ChangeDetectionStrategy.OnPush // Removed as it was not in the script for this update
})
export class TodoItemComponent {
  @Input({ required: true }) todo!: Todo;
  @Output() delete = new EventEmitter<string>();
  // @Output() toggleComplete = new EventEmitter<Todo>(); // For when update is ready

  onDelete(): void {
    console.log('Delete requested for (frontend only):', this.todo._id);
    if (this.todo._id) {
       this.delete.emit(this.todo._id); // Will be fully implemented later
    }
  }

  onToggleComplete(): void {
    console.log('Toggle complete requested for (frontend only):', this.todo);
    // const updatedTodo = { ...this.todo, completed: !this.todo.completed };
    // this.toggleComplete.emit(updatedTodo); // Will be fully implemented later
  }
}
