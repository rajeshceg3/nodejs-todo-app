import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo/todo.service';
import { TodoItemComponent } from '../todo-item/todo-item.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush // Removed as it was not in the script for this update
  animations: [
    trigger('listAnimation', [
      transition('* => *', [ // Animate on any state change (items added/removed)
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-15px) scale(0.98)' }),
          stagger(40, [ // Snappier delay
            animate('0.25s cubic-bezier(0.2, 0.8, 0.2, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('0.2s ease-in', style({ opacity: 0, transform: 'scale(0.95)', height: 0, margin: 0 }))
        ], { optional: true })
      ])
    ])
  ]
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  private todoService = inject(TodoService);

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.todoService.getTodos().subscribe({
      next: (todos) => this.todos = todos,
      error: (err) => console.error('Error loading todos:', err)
    });
  }

  handleTodoAdded(newTodo: Todo): void {
    // Optimistically add to list, or reload
    console.log('TodoListComponent: todoAdded event received, reloading todos.', newTodo);
    this.loadTodos(); // Simplest way to refresh
  }

  handleDeleteTodo(todoId: string): void {
    this.todoService.deleteTodo(todoId).subscribe({
      next: () => this.loadTodos(),
      error: (err) => console.error('Error deleting todo:', err)
    });
  }

  handleToggleComplete(todoToToggle: Todo): void {
    const updatedStatus: 'completed' | 'pending' = todoToToggle.status === 'completed' ? 'pending' : 'completed';
    const updatedTodo: Todo = { ...todoToToggle, status: updatedStatus };

    this.todoService.updateTodo(updatedTodo).subscribe({
      next: () => this.loadTodos(),
      error: (err) => console.error('Error updating todo:', err)
    });
  }

  trackById(index: number, item: Todo): string {
    return item._id || '';
  }
}
