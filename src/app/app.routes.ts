import { Routes } from '@angular/router';
import { LogInComponent } from '@modules/log-in/log-in.component';
import { MainLayoutComponent } from '@shared/main-layout/main-layout.component';
import { AuthGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LogInComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      // { path: 'projects', component: ProjectComponent },
      // { path: '', redirectTo: 'projects', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' },
];
