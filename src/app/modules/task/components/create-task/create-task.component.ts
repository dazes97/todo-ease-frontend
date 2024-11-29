import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { IProject } from '@shared/interfaces/project.interface';
import { InputTextModule } from 'primeng/inputtext';
import { NgIf } from '@angular/common';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TaskPriority } from '@shared/enums/task-priority.enum';
import { TaskStatus } from '@shared/enums/task-status.enum';
import { TaskPriorityPipe } from '@shared/pipes/task-priority.pipe';
import { TaskStatusPipe } from '@shared/pipes/task-status.pipe';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { IUser } from '@shared/interfaces/user.interface';
import { Subscription } from 'rxjs';
import { ProjectService } from '@shared/services/project.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UserService } from '@shared/services/user.service';
import { CreateTaskRequest } from '@shared/interfaces/create-task-request.interface';
import { TaskService } from '@shared/services/task.service';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    NgIf,
    InputTextareaModule,
    TaskPriorityPipe,
    TaskStatusPipe,
    InputNumberModule,
    CalendarModule
  ],
  templateUrl: './create-task.component.html',
  styleUrl: './create-task.component.scss'
})
export class CreateTaskComponent implements OnInit, OnDestroy {
  public createTaskForm: FormGroup;
  public loadingProjects: boolean;
  public projects: IProject[];
  public priorities: TaskPriority[];
  public statuses: TaskStatus[];
  public loadingUsers: boolean;
  public users: IUser[];
  public creatingTask: boolean;

  public readonly TODAY: Date;

  private _projectsSubscription?: Subscription;
  private _usersSubscription?: Subscription;
  private _tasksSubscription?: Subscription;

  constructor(
    private _projectService: ProjectService,
    private _dynamicDialogConfig: DynamicDialogConfig,
    private _messageService: MessageService,
    private _userService: UserService,
    private _taskService: TaskService,
    private _dynamicDialogRef: DynamicDialogRef
  ) {
    this.createTaskForm = new FormGroup({
      projectId: new FormControl(null, [Validators.required]),
      name: new FormControl(null, [Validators.required]),
      description: new FormControl(null),
      priority: new FormControl(null, [Validators.required]),
      status: new FormControl(TaskStatus.PENDING, [Validators.required]),
      estimate: new FormControl(null),
      startAt: new FormControl(null),
      endAt: new FormControl(null),
      assignedUser: new FormControl(null)
    });
    this.loadingProjects = false;
    this.projects = [];
    this.priorities = [];
    this.statuses = [];
    this.loadingUsers = false;
    this.users = [];
    this.creatingTask = false;

    this.TODAY = new Date(new Date().setHours(0, 0, 0, 0));
  }

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public createTask(): void {
    if (this.createTaskForm.invalid) {
      return;
    }
    this.creatingTask = true;
    const projectId: number = this.projectId?.value;
    const name: string = this.name?.value;
    const description: string = this._getControlFromCreateTaskForm('description')?.value;
    const taskPriorityId: TaskPriority = this.priority?.value;
    const taskStatusId: TaskStatus = this.status?.value;
    const estimate: number = this._getControlFromCreateTaskForm('estimate')?.value;
    const startAt: Date = this._getControlFromCreateTaskForm('startAt')?.value;
    const endAt: Date = this._getControlFromCreateTaskForm('endAt')?.value;
    if (startAt && endAt && startAt > endAt) {
      this.creatingTask = false;
      this._messageService.add({
        severity: 'error',
        summary: 'Error al crear la tarea',
        detail: 'La fecha inicio no debe ser mayor que la fecha fin.'
      });
      return;
    }
    const assignedUser: IUser = this._getControlFromCreateTaskForm('assignedUser')?.value;
    const request: CreateTaskRequest = {
      name,
      description,
      taskPriorityId,
      taskStatusId,
      estimate,
      startAt: startAt ? startAt.toISOString().split('T')[0] : undefined,
      endAt: endAt ? endAt.toISOString().split('T')[0] : undefined,
      projectId,
      assignedUserId: assignedUser ? assignedUser.id : undefined
    }
    this._tasksSubscription = this._taskService.createTask(request).subscribe({
      next: () => {
        this.creatingTask = false;
        this._messageService.add({
          severity: 'success',
          detail: 'Tarea creada exitosamente.'
        });
        this._dynamicDialogRef.close(true);
      },
      error: () => {
        this.creatingTask = false;
        this._messageService.add({
          severity: 'error',
          summary: 'Error al crear la tarea',
          detail: 'Ocurrió un error al crear la tarea.'
        });
      }
    });
  }

  public get projectId(): AbstractControl | null {
    return this._getControlFromCreateTaskForm('projectId');
  }

  public get name(): AbstractControl | null {
    return this._getControlFromCreateTaskForm('name');
  }

  public get priority(): AbstractControl | null {
    return this._getControlFromCreateTaskForm('priority');
  }

  public get status(): AbstractControl | null {
    return this._getControlFromCreateTaskForm('status');
  }

  private _initialize(): void {
    this._loadProjects();
    this.priorities = [TaskPriority.HIGH, TaskPriority.MEDIUM, TaskPriority.LOW];
    this.statuses = [TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.FINISHED];
    this._loadUsers();
  }

  private _loadProjects(): void {
    this.loadingProjects = true;
    this._projectsSubscription = this._projectService.getAll().subscribe({
      next: ({ body }) => {
        this.loadingProjects = false;
        this.projects = [...body];
        const selectedProjectId: number | undefined = this._dynamicDialogConfig.data.selectedProjectId;
        if (selectedProjectId) {
          this.projectId?.setValue(selectedProjectId);
        }
      },
      error: () => {
        this.loadingProjects = false;
        this._messageService.add({
          severity: 'error',
          summary: 'Error al cargar los proyectos',
          detail: 'Ocurrió un error al obtener los datos.'
        });
      }
    });
  }

  private _loadUsers(): void {
    this.loadingUsers = true;
    this._usersSubscription = this._userService.getAll().subscribe({
      next: ({ body }) => {
        this.loadingUsers = false;
        this.users = [...body];
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

  private _finalize(): void {
    this._projectsSubscription?.unsubscribe();
    this._usersSubscription?.unsubscribe();
    this._tasksSubscription?.unsubscribe();
  }

  private _getControlFromCreateTaskForm(name: string): AbstractControl | null {
    return this.createTaskForm.get(name);
  }
}
