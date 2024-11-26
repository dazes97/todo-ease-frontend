import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { ILogin } from '../../core/interfaces';
import { MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-log-in',
  standalone: true,
  providers: [MessageService],
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    ReactiveFormsModule,
    MessagesModule,
  ],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.scss',
})
export class LogInComponent implements OnInit {
  public authForm!: FormGroup;
  private router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly MIN_PASSWORD_LENGTH = 1;
  private readonly MAX_EMAIL_LENGTH = 50;
  private readonly MESSAGE_LIFE = 2000;

  ngOnInit() {
    this.authForm = new FormGroup({
      username: new FormControl(null, [
        Validators.required,
        Validators.maxLength(this.MAX_EMAIL_LENGTH),
      ]),
      password: new FormControl(null, [
        Validators.required,
        Validators.minLength(this.MIN_PASSWORD_LENGTH),
      ]),
    });
  }

  get username(): string | null {
    return this.authForm.get('username')?.value;
  }

  get password(): string | null {
    return this.authForm.get('password')?.value;
  }

  private isFormValid(): boolean {
    return this.authForm.valid;
  }

  public getFormError(key: string): boolean {
    const touched = this.authForm.get(key)?.touched;
    const errors = this.authForm.get(key)?.errors;
    return !!touched && !!errors;
  }

  public submitAuthForm() {
    if (!this.isFormValid()) {
      console.log('Formulario es invalido');
      return;
    }
    this.sendformRequest();
  }

  private saveCredentials(userInfo: ILogin) {
    this.authService.saveUserInfo(userInfo);
  }

  private redirectToHome() {
    this.router.navigate(['/'], { replaceUrl: true });
  }

  private showErrorMessage() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Usuario o contraseña incorrectos',
      life: this.MESSAGE_LIFE,
    });
  }

  public sendformRequest() {
    this.authService.logIn(this.username, this.password).subscribe({
      next: ({ body }) => {
        this.saveCredentials(body);
        this.redirectToHome();
      },
      error: (error) => {
        console.error('Error: ', error);
        this.showErrorMessage();
      },
    });
  }
}
