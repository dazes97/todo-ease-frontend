import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Component, inject, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { ProjectService } from '@shared/services/project.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { UserService } from '@shared/services/user.service';
import { IUser } from '@shared/interfaces/user.interface';
import { IProjectUserAssign } from '@shared/interfaces/project.interface';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-assign-project',
  standalone: true,
  providers: [DialogService, MessageService],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DropdownModule,
    MessagesModule,
  ],
  templateUrl: './assign-project.component.html',
  styleUrl: './assign-project.component.scss',
})
export class AssignProjectComponent implements OnInit {
  public isLoading!: boolean;
  public userList!: IUser[];
  public assignForm!: FormGroup;
  private projectId!: number;
  private ref = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private readonly projectService = inject(ProjectService);
  private readonly userService = inject(UserService);
  private readonly messageService = inject(MessageService);
  private MESSAGE_ERROR: string = 'Error usuario ya asignado al proyecto';
  private MESSAGE_LIFE: number = 3000;

  ngOnInit(): void {
    this.setupForm();
    this.readParameters();
    this.fetchUsers();
  }

  private readParameters(): void {
    this.projectId = this.config.data.projectId;
  }

  private fetchUsers(): void {
    this.isLoading = true;
    this.userService.getAll().subscribe({
      next: ({ body }) => {
        this.userList = this.formatUserList(body);
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
      },
    });
  }

  private setupForm(): void {
    this.assignForm = new FormGroup({
      user: new FormControl(null, [Validators.required]),
    });
  }

  sendformRequest(): void {
    const body: IProjectUserAssign = {
      userId: this.assignForm.value.user,
      projectId: this.projectId,
      enabled: true,
      isOwner: false,
    };
    this.projectService.assignUser(body).subscribe({
      next: () => {
        this.ref.close();
      },
      error: (error) => {
        console.error('error...', error);
        this.showErrorMessage();
      },
    });
  }

  submitAssignForm(): void {
    if (!this.isFormValid()) return;
    this.sendformRequest();
  }

  private isFormValid(): boolean {
    return this.assignForm.valid;
  }

  private formatUserList(body: IUser[]): IUser[] {
    return body.map((user) => ({
      ...user,
      fullname: `${user.firstname} ${user.lastname}`,
    }));
  }

  private showErrorMessage() {
    this.messageService.clear();
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: this.MESSAGE_ERROR,
      life: this.MESSAGE_LIFE,
    });
  }
}
