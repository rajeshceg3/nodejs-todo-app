import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { TodoAddComponent } from './todo-add.component';
import { TodoService } from '../../services/todo/todo.service';
import { Todo } from '../../models/todo.model';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // Added for potential animation interaction in tests

describe('TodoAddComponent', () => {
  let component: TodoAddComponent;
  let fixture: ComponentFixture<TodoAddComponent>;
  let mockTodoService: jasmine.SpyObj<TodoService>;

  beforeEach(async () => {
    mockTodoService = jasmine.createSpyObj('TodoService', ['addTodo']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule, // Ensure animations are handled if any part of Angular Material or other UI libs use them
        TodoAddComponent
      ],
      providers: [
        { provide: TodoService, useValue: mockTodoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TodoAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty content', () => {
    expect(component.todoForm.value.content).toEqual('');
  });

  it('should make the content form control required', () => {
    const contentControl = component.todoForm.controls['content'];
    contentControl.setValue('');
    expect(contentControl.valid).toBeFalsy();
    contentControl.setValue('Test');
    expect(contentControl.valid).toBeTruthy();
  });

  it('should call TodoService.addTodo, emit todoAdded, and reset form on valid submission', () => {
    const newTodo: Todo = { id: '1', content: 'New Task', completed: false }; // Use id and completed
    mockTodoService.addTodo.and.returnValue(of(newTodo));
    spyOn(component.todoAdded, 'emit');

    component.todoForm.setValue({ content: 'New Task' }); // Use setValue for the whole form
    component.onSubmit();

    expect(mockTodoService.addTodo).toHaveBeenCalledWith('New Task');
    expect(component.todoAdded.emit).toHaveBeenCalledWith(newTodo); // Should emit the Todo object
    expect(component.todoForm.value.content).toBeNull(); // Form should be reset
  });

  it('should set isAdding to true and then false after onSubmit', (done) => {
    const newTodo: Todo = { id: '1', content: 'Test Todo', completed: false };
    mockTodoService.addTodo.and.returnValue(of(newTodo));
    component.todoForm.setValue({ content: 'Test Todo' });

    expect(component.isAdding).toBeFalse();
    component.onSubmit();
    expect(component.isAdding).toBeTrue();

    // Wait for the setTimeout to complete
    setTimeout(() => {
      expect(component.isAdding).toBeFalse();
      done(); // Jasmine's done() for async tests
    }, 550); // A bit longer than the 500ms in component
  });

  it('should not call TodoService.addTodo if form is invalid', () => {
    component.onSubmit();
    expect(mockTodoService.addTodo).not.toHaveBeenCalled();
  });

  it('should log an error if addTodo service call fails', () => { // Corrected describe name
    mockTodoService.addTodo.and.returnValue(throwError(() => new Error('Service error')));
    spyOn(console, 'error');
    component.todoForm.controls['content'].setValue('Test');
    component.onSubmit();
    expect(console.error).toHaveBeenCalledWith('Error adding todo:', jasmine.any(Error));
  });
});
