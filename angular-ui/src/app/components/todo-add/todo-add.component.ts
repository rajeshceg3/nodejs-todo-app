import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo/todo.service';
import { Todo } from '../../models/todo.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-todo-add',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './todo-add.component.html',
  styleUrls: ['./todo-add.component.css']
})
export class TodoAddComponent {
  @Output() todoAdded = new EventEmitter<Todo>();
  todoForm: FormGroup;
  isAdding: boolean = false;
  isFocused = false;
  private todoService = inject(TodoService);
  private fb = inject(FormBuilder);

  constructor() {
    this.todoForm = this.fb.group({
      content: ['', Validators.required]
    });
  }

  onFocus() {
    this.isFocused = true;
  }

  onBlur() {
    this.isFocused = false;
  }

  onSubmit(): void {
    if (this.todoForm.valid) {
      this.isAdding = true;
      const content = this.todoForm.value.content;

      // Optimistic: Reset form immediately
      this.todoForm.reset();

      this.todoService.addTodo(content).subscribe({
        next: (newTodo) => {
          this.todoAdded.emit(newTodo);
          // Animation timing
          setTimeout(() => { this.isAdding = false; }, 500);
        },
        error: (err) => {
            console.error('Error adding todo:', err);
            this.isAdding = false;
            // Optionally restore form value here
        }
      });
    }
  }
}
