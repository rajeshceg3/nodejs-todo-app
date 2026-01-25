import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
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
  private apiUrl = '/list';
  private todosSubject = new BehaviorSubject<Todo[]>([]);
  public todos$ = this.todosSubject.asObservable();

  constructor(private http: HttpClient) { }

  loadTodos(): void {
    this.http.get<GetTodosResponse>(this.apiUrl)
      .pipe(map(response => response.todos))
      .subscribe({
        next: (todos) => this.todosSubject.next(todos),
        error: (err) => console.error('Failed to load todos', err)
      });
  }

  getTodos(): Observable<Todo[]> {
    return this.todos$;
  }

  addTodo(content: string): Observable<Todo> {
    const tempId = 'temp-' + Date.now();
    const tempTodo: Todo = {
      _id: tempId,
      content,
      status: 'pending',
      priority: 'medium',
      createdAt: new Date(),
      isTemp: true
    };

    const currentTodos = this.todosSubject.value;
    this.todosSubject.next([tempTodo, ...currentTodos]);

    return this.http.post<AddTodoResponse>(this.apiUrl, { text: content })
      .pipe(
        map(response => response.todo),
        tap(savedTodo => {
          const updated = this.todosSubject.value.map(t => t._id === tempId ? savedTodo : t);
          this.todosSubject.next(updated);
        }),
        catchError(err => {
          const reverted = this.todosSubject.value.filter(t => t._id !== tempId);
          this.todosSubject.next(reverted);
          return throwError(() => err);
        })
      );
  }

  deleteTodo(id: string): Observable<any> {
    const previousTodos = this.todosSubject.value;
    const updated = previousTodos.filter(t => t._id !== id);
    this.todosSubject.next(updated);

    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(err => {
        this.todosSubject.next(previousTodos);
        return throwError(() => err);
      })
    );
  }

  updateTodo(todo: Todo): Observable<Todo> {
    const previousTodos = this.todosSubject.value;
    const updated = previousTodos.map(t => t._id === todo._id ? todo : t);
    this.todosSubject.next(updated);

    const { _id, ...updates } = todo;
    return this.http.patch<{todo: Todo}>(`${this.apiUrl}/${_id}`, updates)
       .pipe(
         map(response => response.todo),
         tap(saved => {
            const confirmed = this.todosSubject.value.map(t => t._id === saved._id ? saved : t);
            this.todosSubject.next(confirmed);
         }),
         catchError(err => {
           this.todosSubject.next(previousTodos);
           return throwError(() => err);
         })
       );
  }
}
