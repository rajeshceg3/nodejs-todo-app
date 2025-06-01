export interface Todo {
  _id?: string; // Optional because it's assigned by the backend
  content: string;
  // We might add 'completed: boolean' later if PUT functionality is added
}
