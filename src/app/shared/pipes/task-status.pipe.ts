import { Pipe, PipeTransform } from '@angular/core';
import { TaskStatus } from '@shared/enums/task-status.enum';

@Pipe({
  name: 'taskStatus',
  standalone: true
})
export class TaskStatusPipe implements PipeTransform {
  private readonly _TASK_STATUS_NAMES: Record<TaskStatus, string>;

  constructor() {
    this._TASK_STATUS_NAMES = {
      [TaskStatus.PENDING]: 'Pendiente',
      [TaskStatus.IN_PROGRESS]: 'En Progreso',
      [TaskStatus.FINISHED]: 'Finalizada'
    }
  }

  transform(taskStatusId: TaskStatus): string {
    return this._TASK_STATUS_NAMES[taskStatusId];
  }
}
