import { Component, ViewChild } from '@angular/core'; // Added ViewChild
import { RouterOutlet } from '@angular/router';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { TodoAddComponent } from './components/todo-add/todo-add.component';
import { Todo } from './models/todo.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TodoListComponent, TodoAddComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent { // Class name kept as AppComponent
  title = 'Todo App'; // Changed title as per script

  @ViewChild(TodoListComponent) todoListComponent!: TodoListComponent;

  onTodoAdded(newTodo: Todo): void {
    // Call a method on TodoListComponent to refresh or add the todo
    if (this.todoListComponent) {
      this.todoListComponent.handleTodoAdded(newTodo);
    }
  }
}
