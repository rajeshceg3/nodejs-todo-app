export interface Todo {
  _id: string;
  content: string;
  rawContent?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  tags?: string[];
  dueDate?: string | Date;
  status?: 'pending' | 'completed';
  createdAt?: string | Date;
  isTemp?: boolean;
}
