import { Component } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { ButtonDirective } from 'primeng/button';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    NgForOf,
    ButtonDirective,
    NgIf,
    RouterOutlet
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  public visibleSidebar: boolean;
  public menuItems: any[];

  constructor(private _router: Router, private _authService: AuthService) {
    this.visibleSidebar = true;
    this.menuItems = [
      { label: 'Proyectos', icon: 'pi-folder', route: '/projects' },
      { label: 'Tareas', icon: 'pi-list', route: '/tasks' }
    ]
  }

  public toggleSidebar(): void {
    this.visibleSidebar = !this.visibleSidebar;
  }

  public navigateTo(route: string) {
    this._router.navigate([route]);
    this.visibleSidebar = false;
  }

  public logout(): void {
    this._authService.logOut();
    this._router.navigate(['/login']);
  }
}
