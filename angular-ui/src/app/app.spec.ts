import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app';
import { TodoAddComponent } from './components/todo-add/todo-add.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { RouterOutlet } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { Todo } from './models/todo.model'; // Import Todo model

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        ReactiveFormsModule,
        AppComponent,
        TodoAddComponent,
        TodoListComponent,
        RouterOutlet
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it(`should have the 'Todo App' title`, () => {
    expect(component.title).toEqual('Todo App');
  });

  it('should render title in an h1 tag', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // The h1 is inside a div with text-align:center.
    expect(compiled.querySelector('h1')?.textContent).toContain('Todo App');
  });

  it('should render app-todo-add component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-todo-add')).toBeTruthy();
  });

  it('should render app-todo-list component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-todo-list')).toBeTruthy();
  });

  it('onTodoAdded should call todoListComponent.handleTodoAdded if todoListComponent is available', () => {
    const newTodo: Todo = { _id: 'mock-id', content: 'Test', status: 'pending' };

    // Manually ensure todoListComponent is defined for this test if ViewChild might not be ready
    // or if direct interaction is simpler for the test.
    // In a real test, you might need to use ngZone or fixture.whenStable for ViewChild.
    // For this unit test, directly assigning a spy or mock can be more straightforward
    // if the child component isn't critical to the logic being tested in *this specific test*.
    // However, the current implementation relies on ViewChild.

    // Ensure change detection has run to pick up ViewChild
    fixture.detectChanges(); // This might be needed if todoListComponent is not immediately available

    if (component.todoListComponent) {
      spyOn(component.todoListComponent, 'handleTodoAdded');
      component.onTodoAdded(newTodo);
      expect(component.todoListComponent.handleTodoAdded).toHaveBeenCalledWith(newTodo);
    } else {
      // This path indicates an issue with ViewChild not being resolved.
      // It's better to fail the test if todoListComponent is expected to be present.
      fail('todoListComponent was not initialized via ViewChild');
    }
  });
});
