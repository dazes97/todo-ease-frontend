import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@shared/main-layout/main-layout.component';
import { ProjectComponent } from '@modules/project/project.component';
import { LogInComponent } from '@modules/log-in/log-in.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { TaskComponent } from '@modules/task/task.component';

export const routes: Routes = [
  { path: 'login', component: LogInComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'projects', component: ProjectComponent },
      { path: 'tasks', component: TaskComponent },
      { path: '', redirectTo: 'projects', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
