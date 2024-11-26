import { Component, OnInit } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { ProjectService } from '@shared/services/project.service';
import { DialogService } from 'primeng/dynamicdialog';
import { MenubarModule } from 'primeng/menubar';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { IProject } from '@shared/interfaces/project.interface';

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
  projects!: IProject[];
  isLoading!: boolean;

  constructor(private projectService: ProjectService) {}

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
}
