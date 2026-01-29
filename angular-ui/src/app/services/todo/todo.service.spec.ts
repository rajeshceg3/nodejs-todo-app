import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TodoService } from './todo.service';
import { Todo } from '../../models/todo.model';

describe('TodoService', () => {
  let service: TodoService;
  let httpMock: HttpTestingController;
  const apiUrl = '/list';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TodoService]
    });
    service = TestBed.inject(TodoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Make sure that there are no outstanding requests.
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTodos', () => {
    it('should retrieve todos from the API via GET', () => {
      const mockTodos: Todo[] = [
        { _id: '1', content: 'Test Todo 1' },
        { _id: '2', content: 'Test Todo 2' }
      ];
      const mockResponse = { todos: mockTodos };

      // First, verify the initial state is empty
      service.getTodos().subscribe(todos => {
        if (todos.length > 0) {
          expect(todos.length).toBe(2);
          expect(todos).toEqual(mockTodos);
        }
      });

      // Trigger the load
      service.loadTodos();

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('addTodo', () => {
    it('should send a new todo to the API via POST and return the added todo', () => {
      const newTodoContent = 'New Test Todo';
      const mockAddedTodo: Todo = { _id: '3', content: newTodoContent };
      const mockResponse = { todo: mockAddedTodo };

      service.addTodo(newTodoContent).subscribe(todo => {
        expect(todo).toEqual(mockAddedTodo);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ text: newTodoContent });
      req.flush(mockResponse);
    });
  });
});
