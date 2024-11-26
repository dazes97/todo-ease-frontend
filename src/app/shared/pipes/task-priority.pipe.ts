import { Pipe, PipeTransform } from '@angular/core';
import { TaskPriority } from '@shared/enums/task-priority.enum';

@Pipe({
  name: 'taskPriority',
  standalone: true
})
export class TaskPriorityPipe implements PipeTransform {
  private readonly _TASK_PRIORITY_NAMES: Record<TaskPriority, string>;

  constructor() {
    this._TASK_PRIORITY_NAMES = {
      [TaskPriority.HIGH]: 'Alta',
      [TaskPriority.MEDIUM]: 'Media',
      [TaskPriority.LOW]: 'Baja'
    };
  }

  transform(taskPriorityId: TaskPriority): string {
    return this._TASK_PRIORITY_NAMES[taskPriorityId];
  }
}
