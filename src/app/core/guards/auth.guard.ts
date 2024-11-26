import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ILogin } from '../interfaces';

@Injectable({
  providedIn: 'root',
  useClass: AuthGuard
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {
  }

  canActivate(): boolean {
    const userInfo: ILogin | null = this.authService.getUserInfo();
    if (userInfo && userInfo.token) {
      return true;
    }
    this.router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
}
