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
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(-15px) scale(0.98)' }),
          stagger(40, [
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
    // Subscribe to the stream of todos
    this.todoService.getTodos().subscribe({
      next: (todos) => this.todos = todos,
      error: (err) => console.error('Error loading todos:', err)
    });
    // Trigger initial load
    this.todoService.loadTodos();
  }

  handleTodoAdded(newTodo: Todo): void {
    // No-op: Service handles state now.
  }

  handleDeleteTodo(todoId: string): void {
    this.todoService.deleteTodo(todoId).subscribe({
      error: (err) => console.error('Error deleting todo:', err)
    });
  }

  handleToggleComplete(todoToToggle: Todo): void {
    const updatedStatus: 'completed' | 'pending' = todoToToggle.status === 'completed' ? 'pending' : 'completed';
    const updatedTodo: Todo = { ...todoToToggle, status: updatedStatus };

    this.todoService.updateTodo(updatedTodo).subscribe({
      error: (err) => console.error('Error updating todo:', err)
    });
  }

  trackById(index: number, item: Todo): string {
    return item._id || '';
  }
}
