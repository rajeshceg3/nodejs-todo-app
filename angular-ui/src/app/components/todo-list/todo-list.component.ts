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
          style({ opacity: 0, transform: 'translateY(-20px)' }),
          stagger(100, [ // Apply a delay between entering items
            animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true }),
        query(':leave', [
          animate('0.3s ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))
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
    console.log('TodoListComponent received delete request for ID (frontend only):', todoId);
    // Implement actual deletion when service method is ready
    // this.todoService.deleteTodo(todoId).subscribe(() => this.loadTodos());
    // For now, filter out optimistically if needed, or just log
    this.todos = this.todos.filter(todo => todo.id !== todoId); // Optimistic UI update
  }

  handleToggleComplete(todoToToggle: Todo): void {
    console.log('TodoListComponent received toggle complete request (frontend only):', todoToToggle);
    // this.todoService.updateTodo(todo).subscribe(() => this.loadTodos());
    const todo = this.todos.find(t => t.id === todoToToggle.id);
    if (todo) {
      todo.completed = !todo.completed;
    }
  }

  trackById(index: number, item: Todo): string {
    return item.id || ''; // Assuming 'id' is unique, fallback for items without id
  }
}
