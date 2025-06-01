import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Todo } from '../../models/todo.model';
import { TodoService } from '../../services/todo/todo.service';
import { TodoItemComponent } from '../todo-item/todo-item.component';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, TodoItemComponent],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.css']
  // changeDetection: ChangeDetectionStrategy.OnPush // Removed as it was not in the script for this update
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
    this.todos = this.todos.filter(todo => todo._id !== todoId); // Optimistic UI update
  }

  // handleToggleComplete(todo: Todo): void {
  //   console.log('TodoListComponent received toggle complete request (frontend only):', todo);
  //   // this.todoService.updateTodo(todo).subscribe(() => this.loadTodos());
  // }
}
