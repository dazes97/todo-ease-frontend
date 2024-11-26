import { TaskPriority } from '@shared/enums/task-priority.enum';
import { TaskStatus } from '@shared/enums/task-status.enum';

export interface Task {
  id: number;
  name: string;
  description: string;
  code: string;
  taskPriorityId: TaskPriority;
  taskStatusId: TaskStatus;
  estimate: number;
  startAt: Date;
  endAt: Date;
  projectId: number;
  reporterUserId: number;
  assignedUserId: number;
  createdAt: Date;
  updatedAt: Date;
  projectName: string;
  projectCode: string;
  reporterName: string;
  assignedName: string;
}
