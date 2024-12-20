import { Component, OnDestroy, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { DatePipe, NgIf } from '@angular/common';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '@shared/services/project.service';
import { Observable, Subscription } from 'rxjs';
import { IProject } from '@shared/interfaces/project.interface';
import { Task } from '@shared/interfaces/task.interface';
import { TaskPriorityPipe } from '@shared/pipes/task-priority.pipe';
import { TaskStatusPipe } from '@shared/pipes/task-status.pipe';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '@shared/services/task.service';
import { IRequest } from '@shared/interfaces/request.interface';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateTaskComponent } from '@modules/task/components/create-task/create-task.component';
import { TaskDetailComponent } from '@modules/task/components/task-detail/task-detail.component';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    Button,
    DatePipe,
    PrimeTemplate,
    SkeletonModule,
    TableModule,
    TooltipModule,
    DropdownModule,
    FormsModule,
    TaskPriorityPipe,
    TaskStatusPipe,
    NgIf
  ],
  providers: [DynamicDialogRef, DialogService],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss'
})
export class TaskComponent implements OnInit, OnDestroy {
  public loadingProjects: boolean;
  public projects: IProject[];
  public selectedProjectId?: number;
  public loadingTasks: boolean;
  public tasks: Task[];

  private _selectedProjectIdSubscription?: Subscription;
  private _projectsSubscription?: Subscription;
  private _tasksSubscription?: Subscription;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _projectService: ProjectService,
    private _taskService: TaskService,
    private _messageService: MessageService,
    private _router: Router,
    private _dynamicDialogRef: DynamicDialogRef,
    private _dialogService: DialogService
  ) {
    this.loadingProjects = false;
    this.projects = [];
    this.loadingTasks = false;
    this.tasks = [];
  }

  public ngOnInit(): void {
    this._initialize();
  }

  public ngOnDestroy(): void {
    this._finalize();
  }

  public openCreateTaskDialog(): void {
    this._dynamicDialogRef = this._dialogService.open(
      CreateTaskComponent,
      {
        data: {
          selectedProjectId: this.selectedProjectId
        },
        header: 'Crear Tarea',
        width: '30%',
        height: '60%',
        closable: true
      }
    );
    this._dynamicDialogRef.onClose.subscribe((value) => {
      if (value) {
        this._loadTasks();
      }
    });
  }

  public onSelectProject(): void {
    this._router.navigate(
      [],
      {
        relativeTo: this._activatedRoute,
        queryParams: this.selectedProjectId ? { project: this.selectedProjectId } : {}
      }
    );
    this._loadTasks();
  }

  public openTaskDetailDialog(task: Task): void {
    this._dynamicDialogRef = this._dialogService.open(
      TaskDetailComponent,
      {
        data: { task },
        header: task.code,
        width: '30%',
        height: '75%',
        closable: true
      }
    );
    this._dynamicDialogRef.onClose.subscribe(() => this._loadTasks());
  }

  private _initialize(): void {
    this._searchSelectedProjectId();
  }

  private _searchSelectedProjectId(): void {
    this._selectedProjectIdSubscription = this._activatedRoute.queryParams.subscribe((params) => {
      const selectedProjectId: any = params['project'];
      if (selectedProjectId) {
        this.selectedProjectId = +selectedProjectId;
      }
      this._loadProjects();
    });
  }

  private _loadProjects(): void {
    this.loadingProjects = true;
    this._projectsSubscription = this._projectService.getAll().subscribe({
      next: ({ body }) => {
        this.loadingProjects = false;
        this.projects = [...body];
        this._loadTasks();
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

  private _loadTasks(): void {
    this.loadingTasks = true;
    const taskObservable: Observable<IRequest<Task[]>> = !this.selectedProjectId
      ? this._taskService.getAllTasks()
      : this._taskService.getAllTasksByProjectId(this.selectedProjectId);
    this._tasksSubscription = taskObservable.subscribe({
      next: ({ body }) => {
        this.loadingTasks = false;
        this.tasks = [...body];
      },
      error: () => {
        this.loadingTasks = false;
        this._messageService.add({
          severity: 'error',
          summary: 'Error al cargar las tareas',
          detail: 'Ocurrió un error al obtener los datos.'
        });
      }
    });
  }

  private _finalize(): void {
    this._selectedProjectIdSubscription?.unsubscribe();
    this._projectsSubscription?.unsubscribe();
    this._tasksSubscription?.unsubscribe();
  }
}
