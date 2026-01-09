import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TodoListComponent } from './todo-list.component';
import { TodoService } from '../../services/todo/todo.service';
import { Todo } from '../../models/todo.model';
import { TodoItemComponent } from '../todo-item/todo-item.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'; // For *ngIf, *ngFor
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TodoListComponent', () => {
  let component: TodoListComponent;
  let fixture: ComponentFixture<TodoListComponent>;
  let mockTodoService: jasmine.SpyObj<TodoService>;
  const mockTodos: Todo[] = [
    { _id: '1', content: 'Todo 1', status: 'pending' },
    { _id: '2', content: 'Todo 2', status: 'completed' }
  ];

  beforeEach(async () => {
    mockTodoService = jasmine.createSpyObj('TodoService', ['getTodos', 'deleteTodo', 'updateTodo']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule, // For *ngIf, *ngFor in TodoListComponent's template
        HttpClientTestingModule,
        NoopAnimationsModule,
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
    expect(noTodosEl.nativeElement.textContent).toContain('You have no pending tasks.');
  });

  it('should log error if getTodos fails', () => {
    mockTodoService.getTodos.and.returnValue(throwError(() => new Error('Failed to load')));
    spyOn(console, 'error');
    fixture.detectChanges(); // ngOnInit
    expect(console.error).toHaveBeenCalledWith('Error loading todos:', jasmine.any(Error));
  });

  it('should reload todos when handleTodoAdded is called', () => {
    const newTodo: Todo = { _id: '3', content: 'New Todo', status: 'pending' };
    const initialMockTodos: Todo[] = [
      { _id: '1', content: 'Todo 1', status: 'pending' },
      { _id: '2', content: 'Todo 2', status: 'completed' }
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
      { _id: '1', content: 'Todo 1', status: 'pending' },
      { _id: '2', content: 'Todo 2', status: 'completed' },
    ];
    component.todos = [...initialTodos];

    // Setup updateTodo spy to return success (can return modified or null, since we reload)
    mockTodoService.updateTodo.and.returnValue(of({ ...initialTodos[0], status: 'completed' }));
    mockTodoService.getTodos.and.returnValue(of([{ ...initialTodos[0], status: 'completed' }, initialTodos[1]]));

    // Toggle first todo
    component.handleToggleComplete(initialTodos[0]);

    expect(mockTodoService.updateTodo).toHaveBeenCalled();
    expect(mockTodoService.getTodos).toHaveBeenCalled();
  });

  it('handleDeleteTodo should remove the todo from the list', () => {
    const initialTodosForDelete: Todo[] = [
      { _id: 'del1', content: 'Todo Delete 1', status: 'pending' },
      { _id: 'del2', content: 'Todo Delete 2', status: 'pending' },
    ];
    component.todos = [...initialTodosForDelete];

    mockTodoService.deleteTodo.and.returnValue(of(null));
    mockTodoService.getTodos.and.returnValue(of([initialTodosForDelete[1]]));

    component.handleDeleteTodo('del1');

    expect(mockTodoService.deleteTodo).toHaveBeenCalledWith('del1');
    expect(mockTodoService.getTodos).toHaveBeenCalled();
  });

  it('trackById should return todo._id or empty string', () => {
      const todoWithId: Todo = { _id: 'testId', content: 'Test', status: 'pending' };
      const todoWithoutId: Todo = { content: 'Test No ID', status: 'pending' } as Todo; // id is optional
      expect(component.trackById(0, todoWithId)).toBe('testId');
      expect(component.trackById(0, todoWithoutId)).toBe('');
  });
});
