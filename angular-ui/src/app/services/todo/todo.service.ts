import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Todo } from '../../models/todo.model';

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

  deleteTodo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateTodo(todo: Todo): Observable<Todo> {
    // We send only the updates, but for now sending the whole object is fine as patch handles it
    const { _id, ...updates } = todo;
    return this.http.patch<{todo: Todo}>(`${this.apiUrl}/${_id}`, updates)
       .pipe(map(response => response.todo));
  }
}
