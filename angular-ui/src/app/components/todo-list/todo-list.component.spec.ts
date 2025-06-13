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
    { id: '1', content: 'Todo 1', completed: false },
    { id: '2', content: 'Todo 2', completed: true }
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
    const noTodosEl = fixture.debugElement.query(By.css('.no-todos-message')); // Updated selector
    expect(noTodosEl).toBeTruthy();
    // The text content check can be made more robust if needed, e.g. by trimming whitespace
    expect(noTodosEl.nativeElement.textContent).toContain('No todos yet! Add one above.');
  });

  it('should log error if getTodos fails', () => {
    mockTodoService.getTodos.and.returnValue(throwError(() => new Error('Failed to load')));
    spyOn(console, 'error');
    fixture.detectChanges(); // ngOnInit
    expect(console.error).toHaveBeenCalledWith('Error loading todos:', jasmine.any(Error));
  });

  it('should reload todos when handleTodoAdded is called', () => {
    const newTodo: Todo = { id: '3', content: 'New Todo', completed: false }; // Use id and completed
    const initialMockTodos: Todo[] = [
      { id: '1', content: 'Todo 1', completed: false },
      { id: '2', content: 'Todo 2', completed: true }
    ];
    mockTodoService.getTodos.and.returnValue(of(initialMockTodos)); // Initial load
    fixture.detectChanges();

    mockTodoService.getTodos.calls.reset(); // Reset spy for the next call
    mockTodoService.getTodos.and.returnValue(of([...initialMockTodos, newTodo])); // Simulate list refresh
    spyOn(console, 'log'); // to acknowledge the log in handleTodoAdded

    component.handleTodoAdded(newTodo);
    expect(console.log).toHaveBeenCalledWith('TodoListComponent: todoAdded event received, reloading todos.', newTodo);
    expect(mockTodoService.getTodos).toHaveBeenCalled();
    // Check against the new combined list length
    const expectedLength = initialMockTodos.length + 1;
    expect(component.todos.length).toBe(expectedLength);
  });

  it('handleToggleComplete should toggle the completed status of a todo', () => {
    const initialTodos: Todo[] = [
      { id: '1', content: 'Todo 1', completed: false },
      { id: '2', content: 'Todo 2', completed: true },
    ];
    component.todos = [...initialTodos]; // Set directly for this test

    // Toggle first todo
    component.handleToggleComplete(initialTodos[0]);
    expect(component.todos[0].completed).toBeTrue();

    // Toggle first todo again
    component.handleToggleComplete(initialTodos[0]);
    expect(component.todos[0].completed).toBeFalse();
  });

  it('handleDeleteTodo should remove the todo from the list (front-end behavior)', () => {
    const initialTodosForDelete: Todo[] = [ // Renamed to avoid conflict
      { id: 'del1', content: 'Todo Delete 1', completed: false },
      { id: 'del2', content: 'Todo Delete 2', completed: false },
    ];
    component.todos = [...initialTodosForDelete];
    // For current implementation, service is not called in handleDeleteTodo
    // If it were: spyOn(component['todoService'], 'deleteTodo').and.returnValue(of(null));

    spyOn(console, 'log'); // To acknowledge the log

    component.handleDeleteTodo('del1'); // Pass the ID

    expect(console.log).toHaveBeenCalledWith('TodoListComponent received delete request for ID (frontend only):', 'del1');
    expect(component.todos.length).toBe(1);
    expect(component.todos[0].id).toBe('del2');
  });

  it('trackById should return todo.id or empty string', () => {
      const todoWithId: Todo = { id: 'testId', content: 'Test', completed: false };
      const todoWithoutId: Todo = { content: 'Test No ID', completed: false }; // id is optional
      expect(component.trackById(0, todoWithId)).toBe('testId');
      expect(component.trackById(0, todoWithoutId)).toBe('');
  });
});
