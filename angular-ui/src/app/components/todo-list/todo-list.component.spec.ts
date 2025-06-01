import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from '../../services/todo/todo.service';
import { Todo } from '../../models/todo.model';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let mockTodoService: jasmine.SpyObj<TodoService>;
  const mockTodos: Todo[] = [
    { _id: '1', content: 'Todo 1' },
    { _id: '2', content: 'Todo 2' }
  ];

  beforeEach(async () => {
    mockTodoService = jasmine.createSpyObj('TodoService', ['getTodos', 'deleteTodo']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule, // For *ngIf, *ngFor in TodoListComponent's template
        HttpClientTestingModule,
        TodoListComponent, // Standalone component being tested
        TodoItemComponent  // Standalone component used by TodoListComponent
      ],
      providers: [
        { provide: TodoService, useValue: mockTodoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadTodos on init and display todos', () => {
    mockTodoService.getTodos.and.returnValue(of(mockTodos));
    fixture.detectChanges(); // Calls ngOnInit

    expect(mockTodoService.getTodos).toHaveBeenCalled();
    expect(component.todos.length).toBe(2);
    const todoItemElements = fixture.debugElement.queryAll(By.directive(TodoItemComponent));
    expect(todoItemElements.length).toBe(2);
  });

  it('should display "No todos yet!" message if todos array is empty', () => {
    mockTodoService.getTodos.and.returnValue(of([]));
    fixture.detectChanges();
    const noTodosEl = fixture.debugElement.query(By.css('.no-todos'));
    expect(noTodosEl).toBeTruthy();
    expect(noTodosEl.nativeElement.textContent).toContain('No todos yet!');
  });

  it('should log error if getTodos fails', () => {
    mockTodoService.getTodos.and.returnValue(throwError(() => new Error('Failed to load')));
    spyOn(console, 'error');
    fixture.detectChanges(); // ngOnInit
    expect(console.error).toHaveBeenCalledWith('Error loading todos:', jasmine.any(Error));
  });

  it('should reload todos when handleTodoAdded is called', () => {
    const newTodo: Todo = { _id: '3', content: 'New Todo' };
    mockTodoService.getTodos.and.returnValue(of(mockTodos)); // Initial load
    fixture.detectChanges();

    mockTodoService.getTodos.calls.reset(); // Reset spy for the next call
    mockTodoService.getTodos.and.returnValue(of([...mockTodos, newTodo])); // Simulate list refresh
    spyOn(console, 'log'); // to acknowledge the log in handleTodoAdded

    component.handleTodoAdded(newTodo);
    expect(console.log).toHaveBeenCalledWith('TodoListComponent: todoAdded event received, reloading todos.', newTodo);
    expect(mockTodoService.getTodos).toHaveBeenCalled();
    expect(component.todos.length).toBe(3);
  });

  it('should optimistically remove todo and log when handleDeleteTodo is called', () => {
    mockTodoService.getTodos.and.returnValue(of(mockTodos));
    fixture.detectChanges();
    expect(component.todos.length).toBe(2);
    spyOn(console, 'log');

    const todoIdToDelete = mockTodos[0]._id!;
    component.handleDeleteTodo(todoIdToDelete);

    expect(console.log).toHaveBeenCalledWith('TodoListComponent received delete request for ID (frontend only):', todoIdToDelete);
    expect(component.todos.length).toBe(1);
    expect(component.todos.find(t => t._id === todoIdToDelete)).toBeUndefined();
    // expect(mockTodoService.deleteTodo).toHaveBeenCalledWith(todoIdToDelete); // If backend delete was implemented
  });
});
