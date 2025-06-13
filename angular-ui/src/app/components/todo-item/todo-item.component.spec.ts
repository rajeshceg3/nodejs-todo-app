import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoItemComponent } from './todo-item.component';
import { Todo } from '../../models/todo.model';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'; // Import CommonModule if template uses its directives

describe('TodoItemComponent', () => {
  let component: TodoItemComponent;
  let fixture: ComponentFixture<TodoItemComponent>;
  // Updated mockTodo to use id and completed status
  const mockTodo: Todo = { id: '1', content: 'Test Todo Item', completed: false };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, TodoItemComponent] // TodoItemComponent is standalone
    }).compileComponents();

    fixture = TestBed.createComponent(TodoItemComponent);
    component = fixture.componentInstance;
    component.todo = mockTodo; // Set input
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the todo content', () => {
    const contentElement = fixture.debugElement.query(By.css('.content'));
    expect(contentElement.nativeElement.textContent).toContain(mockTodo.content);
  });

  it('isCompleted HostBinding should reflect todo.completed state', () => {
    component.todo = { id: '1', content: 'Test', completed: false };
    fixture.detectChanges();
    expect(component.isCompleted).toBeFalse();
    expect(fixture.nativeElement.classList.contains('completed-item')).toBeFalse();

    component.todo.completed = true;
    fixture.detectChanges();
    expect(component.isCompleted).toBeTrue();
    expect(fixture.nativeElement.classList.contains('completed-item')).toBeTrue();
  });

  it('should emit toggleComplete event with the todo when onToggleComplete is called', () => {
    // Use the component's already set todo or set a new one
    // component.todo is already set with mockTodo in beforeEach
    spyOn(component.toggleComplete, 'emit');
    spyOn(console, 'log'); // Keep spy for existing console log

    component.onToggleComplete();

    expect(console.log).toHaveBeenCalledWith('Toggle complete requested for (frontend only):', component.todo);
    expect(component.toggleComplete.emit).toHaveBeenCalledWith(component.todo);
  });

  it('should emit delete event with todo id when onDelete is called', () => {
    // component.todo is already set with mockTodo in beforeEach
    spyOn(component.delete, 'emit');
    spyOn(console, 'log'); // Keep spy for existing console log
    component.onDelete();
    expect(console.log).toHaveBeenCalledWith('Delete requested for (frontend only):', component.todo.id);
    expect(component.delete.emit).toHaveBeenCalledWith(component.todo.id); // Ensure it's todo.id
  });
});
