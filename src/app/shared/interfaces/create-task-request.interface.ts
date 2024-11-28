import { TaskPriority } from '@shared/enums/task-priority.enum';
import { TaskStatus } from '@shared/enums/task-status.enum';

export interface CreateTaskRequest {
  name: string;
  description?: string;
  taskPriorityId: TaskPriority;
  taskStatusId: TaskStatus;
  estimate?: number;
  startAt?: string;
  endAt?: string;
  projectId: number;
  assignedUserId?: number;
}
