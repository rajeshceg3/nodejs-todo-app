import { Component, ViewChild } from '@angular/core';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { TodoAddComponent } from './components/todo-add/todo-add.component';
import { Todo } from './models/todo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoListComponent, TodoAddComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'Todo App';

  @ViewChild(TodoListComponent) todoListComponent!: TodoListComponent;

  onTodoAdded(newTodo: Todo): void {
    if (this.todoListComponent) {
      this.todoListComponent.handleTodoAdded(newTodo);
    }
  }
}
