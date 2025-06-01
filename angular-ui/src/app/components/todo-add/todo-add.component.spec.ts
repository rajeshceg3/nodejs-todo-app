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

  it('should call TodoService.addTodo when form is valid and submitted', () => {
    const newTodo: Todo = { _id: '1', content: 'Test Todo' };
    mockTodoService.addTodo.and.returnValue(of(newTodo));
    spyOn(component.todoAdded, 'emit');

    component.todoForm.controls['content'].setValue('Test Todo');
    component.onSubmit();

    expect(mockTodoService.addTodo).toHaveBeenCalledWith('Test Todo');
    expect(component.todoAdded.emit).toHaveBeenCalledWith(newTodo);
    expect(component.todoForm.value.content).toBeNull(); // Form should be reset
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
