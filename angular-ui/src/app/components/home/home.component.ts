import { Component, ViewChild } from '@angular/core';
import { TodoListComponent } from '../todo-list/todo-list.component';
import { TodoAddComponent } from '../todo-add/todo-add.component';
import { Todo } from '../../models/todo.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [TodoListComponent, TodoAddComponent],
  template: `
    <app-todo-add (todoAdded)="onTodoAdded($event)"></app-todo-add>
    <app-todo-list #todoListComponent></app-todo-list>
  `
})
export class HomeComponent {
  @ViewChild(TodoListComponent) todoListComponent!: TodoListComponent;

  onTodoAdded(newTodo: Todo): void {
    if (this.todoListComponent) {
      this.todoListComponent.handleTodoAdded(newTodo);
    }
  }
}
