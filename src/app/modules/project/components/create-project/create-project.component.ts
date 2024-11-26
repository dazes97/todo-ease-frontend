import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { dateRangeValidator } from '@shared/utils/form';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { ProjectService } from '@shared/services/project.service';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-create-project',
  standalone: true,
  providers: [DialogService],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
  ],
  templateUrl: './create-project.component.html',
  styleUrl: './create-project.component.scss',
})
export class CreateProjectComponent implements OnInit {
  public projectForm!: FormGroup;
  private ref = inject(DynamicDialogRef);
  private readonly projectService = inject(ProjectService);

  ngOnInit(): void {
    this.setupForm();
  }

  setupForm(): void {
    this.projectForm = new FormGroup(
      {
        name: new FormControl(null, [
          Validators.required,
          Validators.maxLength(255),
        ]),
        description: new FormControl(null, [
          Validators.required,
          Validators.maxLength(255),
        ]),
        code: new FormControl(null, [
          Validators.required,
          Validators.maxLength(15),
        ]),
        startAt: new FormControl(null, [Validators.required]),
        endAt: new FormControl(null, [Validators.required]),
      },
      {
        validators: dateRangeValidator(),
      }
    );
  }

  submitCreateForm(): void {
    if (!this.isFormValid()) return;
    this.sendformRequest();
  }

  sendformRequest(): void {
    const project = this.formatFormDate(this.projectForm);
    this.projectService.create(project).subscribe({
      next: () => {
        this.ref.close();
      },
      error: (error) => {
        this.ref.close();
      },
    });
  }

  formatFormDate(project: FormGroup) {
    const projectData = project.value;
    projectData.startAt = projectData.startAt.toISOString().split('T')[0];
    projectData.endAt = projectData.endAt.toISOString().split('T')[0];
    return projectData;
  }

  private isFormValid(): boolean {
    return this.projectForm.valid;
  }

  public getFormError(key: string): boolean {
    const touched = this.projectForm.get(key)?.touched;
    const errors = this.projectForm.get(key)?.errors;
    return !!touched && !!errors;
  }
}
