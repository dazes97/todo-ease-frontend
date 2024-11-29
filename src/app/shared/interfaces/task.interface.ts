import { TaskPriority } from '@shared/enums/task-priority.enum';
import { TaskStatus } from '@shared/enums/task-status.enum';

export interface Task {
  id: number;
  name: string;
  description?: string;
  code: string;
  taskPriorityId: TaskPriority;
  taskStatusId: TaskStatus;
  estimate?: number;
  startAt?: string;
  endAt?: string;
  projectId: number;
  reporterUserId: number;
  assignedUserId?: number;
  createdAt: string;
  updatedAt?: string;
  projectName: string;
  projectCode: string;
  reporterName: string;
  assignedName?: string;
}
