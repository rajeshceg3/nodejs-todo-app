export interface Todo {
  _id: string;
  content: string;
  rawContent?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  tags?: string[];
  dueDate?: string;
  status?: 'pending' | 'completed';
  createdAt?: string;
}
