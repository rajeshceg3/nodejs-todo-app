export interface Todo {
  id?: string; // Optional because it's assigned by the backend
  content: string;
  completed: boolean;
  // We might add 'completed: boolean' later if PUT functionality is added
}
