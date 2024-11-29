import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { NgIf } from '@angular/common';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TaskPriorityPipe } from '@shared/pipes/task-priority.pipe';
import { TaskStatusPipe } from '@shared/pipes/task-status.pipe';
import { TaskStatus } from '@shared/enums/task-status.enum';
import { TaskPriority } from '@shared/enums/task-priority.enum';
import { IUser } from '@shared/interfaces/user.interface';
import { Subscription } from 'rxjs';
import { UserService } from '@shared/services/user.service';
import { Task } from '@shared/interfaces/task.interface';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { format } from 'date-fns';
import { UpdateTaskRequest } from '@shared/interfaces/update-task-request.interface';
import { TaskService } from '@shared/services/task.service';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    ButtonDirective,
    CalendarModule,
    DropdownModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
    NgIf,
    PrimeTemplate,
    ReactiveFormsModule,
    TaskPriorityPipe,
    TaskStatusPipe
  ],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss'
})
export class TaskDetailComponent implements OnInit, OnDestroy {
  public taskDetailForm: FormGroup;
  public priorities: TaskPriority[];
  public statuses: TaskStatus[];
  public loadingUsers: boolean;
  public users: IUser[];
  public thereAreChanges: boolean;
  public updatingTask: boolean;

  public readonly TODAY: Date;

  private _task?: Task;
  private _usersSubscription?: Subscription;
  private _taskDetailFormChangesSubscription?: Subscription;
  private _tasksSubscription?: Subscription;

  constructor(
    private _userService: UserService,
    private _messageService: MessageService,
    private _dynamicDialogConfig: DynamicDialogConfig,
    private _taskService: TaskService
  ) {
    this.taskDetailForm = new FormGroup({
      project: new FormControl({ value: null, disabled: true }, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(null),
      priority: new FormControl(null, [Validators.required]),
      status: new FormControl(null, [Validators.required]),
      estimate: new FormControl(null),
      startAt: new FormControl(null),
      endAt: new FormControl(null),
      assignedUser: new FormControl(null),
      createdAt: new FormControl({ value: null, disabled: true }),
      updatedAt: new FormControl({ value: null, disabled: true }),
      reporterName: new FormControl({ value: null, disabled: true })
    });
    this.priorities = [];
    this.statuses = [];
    this.loadingUsers = false;
    this.users = [];
    this.thereAreChanges = false;
    this.updatingTask = false;

    this.TODAY = new Date(new Date().setHours(0, 0, 0, 0));
  }

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public updateTask(): void {
    if (!this._task || this.taskDetailForm.invalid) {
      return;
    }
    this.updatingTask = true;
    const name: string = this.name?.value;
    const description: string = this._description?.value;
    const taskPriorityId: TaskPriority = this.priority?.value;
    const taskStatusId: TaskStatus = this.status?.value;
    const estimate: number = this._estimate?.value;
    const startAt: Date = this._startAt?.value;
    const endAt: Date = this._endAt?.value;
    if (startAt && endAt && startAt > endAt) {
      this.updatingTask = false;
      this._messageService.add({
        severity: 'error',
        summary: 'Error al actualizar la tarea',
        detail: 'La fecha inicio no debe ser mayor que la fecha fin.'
      });
      return;
    }
    const formattedStartAt: string | undefined = startAt ? startAt.toISOString().split('T')[0] : undefined;
    const formattedEndAt: string | undefined = endAt ? endAt.toISOString().split('T')[0] : undefined;
    const assignedUser: IUser = this._assignedUser?.value;
    const assignedUserId: number | undefined = assignedUser ? assignedUser.id : undefined;
    const request: UpdateTaskRequest = {
      id: this._task.id,
      name,
      description,
      taskPriorityId,
      taskStatusId,
      estimate,
      startAt: formattedStartAt,
      endAt: formattedEndAt,
      assignedUserId
    }
    this._tasksSubscription = this._taskService.updateTask(request).subscribe({
      next: () => {
        this.updatingTask = false;
        this._messageService.add({
          severity: 'success',
          detail: 'Tarea actualizada exitosamente.'
        });
        if (!this._task) {
          return;
        }
        this._task.name = name;
        this._task.description = description;
        this._task.taskPriorityId = taskPriorityId;
        this._task.taskStatusId = taskStatusId;
        this._task.estimate = estimate;
        this._task.startAt = formattedStartAt;
        this._task.endAt = formattedEndAt;
        this._task.assignedUserId = assignedUserId;
        this._task.assignedName = assignedUser ? `${assignedUser.firstname} ${assignedUser.lastname}` : undefined;
        this.thereAreChanges = false;
      },
      error: () => {
        this.updatingTask = false;
        this._messageService.add({
          severity: 'error',
          summary: 'Error al actualizar la tarea',
          detail: 'Ocurrió un error al actualizar la tarea.'
        });
      }
    });
  }

  public get name(): AbstractControl | null {
    return this._getControlFromTaskDetailForm('name');
  }

  public get priority(): AbstractControl | null {
    return this._getControlFromTaskDetailForm('priority');
  }

  public get status(): AbstractControl | null {
    return this._getControlFromTaskDetailForm('status');
  }

  private _initialize(): void {
    this.priorities = [TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW];
    this.statuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.FINISHED];
    this._loadUsers();
    this._initializeTaskDetailForm();
    this._listenTaskDetailFormChanges();
  }

  private _loadUsers(): void {
    this.loadingUsers = true;
    this._usersSubscription = this._userService.getAll().subscribe({
      next: ({ body }) => {
        this.loadingUsers = false;
        this.users = [...body];
        if (!this._task) {
          return;
        }
        const assignedUserId: number | undefined = this._task.assignedUserId;
        if (!assignedUserId) {
          return;
        }
        const assignedUser: IUser | undefined = this.users.find((user) => user.id === assignedUserId);
        if (assignedUser) {
          this._assignedUser?.setValue(assignedUser);
        }
      },
      error: () => {
        this.loadingUsers = false;
        this._messageService.add({
          severity: 'error',
          summary: 'Error al cargar los usuarios',
          detail: 'Ocurrió un error al obtener los datos.'
        });
      }
    });
  }

  private _initializeTaskDetailForm(): void {
    this._task = this._dynamicDialogConfig.data.task;
    if (!this._task) {
      return;
    }
    this._getControlFromTaskDetailForm('project')?.setValue(this._task.projectName);
    this.name?.setValue(this._task.name);
    const description: string | undefined = this._task.description;
    if (description) {
      this._description?.setValue(description);
    }
    this.priority?.setValue(this._task.taskPriorityId);
    this.status?.setValue(this._task.taskStatusId);
    const estimate: number | undefined = this._task.estimate;
    if (estimate) {
      this._estimate?.setValue(estimate);
    }
    const startAt: string | undefined = this._task.startAt;
    if (startAt) {
      const startAtDate: Date = new Date(`${startAt.split('T')[0]}T00:00:00`);
      this._startAt?.setValue(startAtDate);
    }
    const endAt: string | undefined = this._task.endAt;
    if (endAt) {
      const endAtDate: Date = new Date(`${endAt.split('T')[0]}T00:00:00`);
      this._endAt?.setValue(endAtDate);
    }
    const createdAtDate: Date = new Date(`${this._task.createdAt.split('T')[0]}T00:00:00`);
    this._getControlFromTaskDetailForm('createdAt')?.setValue(createdAtDate);
    const updatedAt: string | undefined = this._task.updatedAt;
    if (updatedAt) {
      const updatedAtDate: Date = new Date(`${updatedAt.split('T')[0]}T00:00:00`);
      this._getControlFromTaskDetailForm('updatedAt')?.setValue(updatedAtDate);
    }
    this._getControlFromTaskDetailForm('reporterName')?.setValue(this._task.reporterName);
  }

  private _listenTaskDetailFormChanges(): void {
    this._taskDetailFormChangesSubscription = this.taskDetailForm.valueChanges.subscribe((formValues) => {
      this.thereAreChanges = Object.keys(formValues).some((key) => {
        const formValue: any = formValues[key];
        if (key === 'priority') {
          return formValue !== this._task?.taskPriorityId;
        }
        if (key === 'status') {
          return formValue !== this._task?.taskStatusId;
        }
        const originalValue: any = (this._task as any)[key];
        if (key === 'startAt' || key === 'endAt') {
          if (!formValue) {
            return !!originalValue;
          }
          if (!originalValue) {
            return true;
          }
          const formattedFormValue: string = format(formValue, 'yyyy-MM-dd');
          const formattedOriginalValue: string = originalValue.split('T')[0];
          return formattedFormValue !== formattedOriginalValue;
        }
        if (key === 'assignedUser') {
          const assignedUserId: number | undefined = this._task?.assignedUserId;
          if (!formValue) {
            return !!assignedUserId;
          }
          if (!assignedUserId) {
            return true;
          }
          return formValue.id !== assignedUserId;
        }
        return formValue !== originalValue;
      });
    });
  }

  private _finalize(): void {
    this._usersSubscription?.unsubscribe();
    this._taskDetailFormChangesSubscription?.unsubscribe();
    this._tasksSubscription?.unsubscribe();
  }

  private _getControlFromTaskDetailForm(name: string): AbstractControl | null {
    return this.taskDetailForm.get(name);
  }

  private get _description(): AbstractControl | null {
    return this._getControlFromTaskDetailForm('description');
  }

  private get _estimate(): AbstractControl | null {
    return this._getControlFromTaskDetailForm('estimate');
  }

  private get _startAt(): AbstractControl | null {
    return this._getControlFromTaskDetailForm('startAt');
  }

  private get _endAt(): AbstractControl | null {
    return this._getControlFromTaskDetailForm('endAt');
  }

  private get _assignedUser(): AbstractControl | null {
    return this._getControlFromTaskDetailForm('assignedUser');
  }
}
