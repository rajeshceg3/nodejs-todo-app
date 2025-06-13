import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo/todo.service';
import { Todo } from '../../models/todo.model';
import { CommonModule } from '@angular/common'; // Added CommonModule for *ngIf if needed in template

@Component({
  selector: 'app-todo-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // Ensure CommonModule for directives like *ngIf
  templateUrl: './todo-add.component.html',
  styleUrls: ['./todo-add.component.css']
  // changeDetection: ChangeDetectionStrategy.OnPush // Removed as it was not in the script for this update
})
export class TodoAddComponent {
  @Output() todoAdded = new EventEmitter<Todo>();
  todoForm: FormGroup;
  isAdding: boolean = false; // For button animation
  private todoService = inject(TodoService);
  private fb = inject(FormBuilder);

  constructor() {
    this.todoForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.todoForm.valid) {
      const content = this.todoForm.value.content;
      this.todoService.addTodo(content).subscribe({
        next: (newTodo) => {
          this.todoAdded.emit(newTodo);
          this.todoForm.reset();
          this.isAdding = true;
          setTimeout(() => { this.isAdding = false; }, 500); // Duration of animation
        },
        error: (err) => console.error('Error adding todo:', err)
      });
    }
  }
}
