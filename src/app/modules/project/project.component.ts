import { Component, OnInit } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { ProjectService } from '@shared/services/project.service';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateProjectComponent } from './components/create-project/create-project.component';
import { MenubarModule } from 'primeng/menubar';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IProject } from '@shared/interfaces/project.interface';
import { AssignProjectComponent } from './components/assign-project/assign-project.component';

@Component({
  selector: 'app-project',
  standalone: true,
  imports: [
    TableModule,
    CommonModule,
    ButtonModule,
    SkeletonModule,
    MenubarModule,
  ],
  providers: [DialogService],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss',
})
export class ProjectComponent implements OnInit {
  private CREATE_PROJECT_DIALOG_HEADER = 'Crear Proyecto';
  private ASSIGN_PROJECT_DIALOG_HEADER = 'Asignar Proyecto';
  ref!: DynamicDialogRef;
  projects!: IProject[];
  isLoading!: boolean;

  constructor(
    private projectService: ProjectService,
    private dialogService: DialogService
  ) {}

  ngOnInit(): void {
    this.initialize();
  }

  private initialize(): void {
    this.getAllProjects();
  }

  private getAllProjects(): void {
    this.isLoading = true;
    this.projectService.getAll().subscribe({
      next: ({ body }) => {
        this.isLoading = false;
        this.projects = body;
      },
      error: (error) => {
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  public openCreateProjectDialog(): void {
    this.ref = this.dialogService.open(CreateProjectComponent, {
      header: this.CREATE_PROJECT_DIALOG_HEADER,
      closable: true,
      styleClass: 'md:w-6',
    });
    this.ref.onClose.subscribe(() => {
      this.getAllProjects();
    });
  }

  public openAssignProjectDialog(projectId: number): void {
    this.ref = this.dialogService.open(AssignProjectComponent, {
      header: this.ASSIGN_PROJECT_DIALOG_HEADER,
      closable: true,
      styleClass: 'md:w-4',
      height:'50%',
      data: {
        projectId,
      },
    });
  }
}
