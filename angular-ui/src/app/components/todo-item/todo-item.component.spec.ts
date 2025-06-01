import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TodoItemComponent } from './todo-item.component';
import { Todo } from '../../models/todo.model';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common'; // Import CommonModule if template uses its directives

describe('TodoItemComponent', () => {
  let component: TodoItemComponent;
  let fixture: ComponentFixture<TodoItemComponent>;
  const mockTodo: Todo = { _id: '1', content: 'Test Todo Item' };

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

  it('should emit delete event with todo id when onDelete is called', () => {
    spyOn(component.delete, 'emit');
    spyOn(console, 'log'); // To acknowledge the FE only log
    component.onDelete();
    expect(console.log).toHaveBeenCalledWith('Delete requested for (frontend only):', mockTodo._id);
    expect(component.delete.emit).toHaveBeenCalledWith(mockTodo._id);
  });

  it('should log to console when onToggleComplete is called (as it is FE only)', () => {
    spyOn(console, 'log');
    component.onToggleComplete();
    expect(console.log).toHaveBeenCalledWith('Toggle complete requested for (frontend only):', mockTodo);
  });
});
