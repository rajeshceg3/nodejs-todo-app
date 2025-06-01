import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Todo } from '../models/todo.model';

interface GetTodosResponse {
  todos: Todo[];
}

interface AddTodoResponse {
  todo: Todo;
}

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private apiUrl = '/list'; // Using relative URL, assumes proxy or same-origin

  constructor(private http: HttpClient) { }

  getTodos(): Observable<Todo[]> {
    return this.http.get<GetTodosResponse>(this.apiUrl)
      .pipe(map(response => response.todos));
  }

  addTodo(content: string): Observable<Todo> {
    return this.http.post<AddTodoResponse>(this.apiUrl, { text: content })
      .pipe(map(response => response.todo));
  }

  // Placeholder for deleteTodo - will require backend endpoint
  // deleteTodo(id: string): Observable<any> {
  //   return this.http.delete(\`\${this.apiUrl}/\${id}\`);
  // }

  // Placeholder for updateTodo (e.g., mark as complete) - will require backend endpoint
  // updateTodo(todo: Todo): Observable<any> {
  //   return this.http.put(\`\${this.apiUrl}/\${todo._id}\`, todo);
  // }
}
