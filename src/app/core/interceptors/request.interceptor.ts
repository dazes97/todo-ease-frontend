import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { catchError, EMPTY, Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
  useClass: RequestInterceptor,
})
export class RequestInterceptor implements HttpInterceptor {
  private readonly HTTP_REDIRECT_CODE = 401;
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const userInfo = this.authService.getUserInfo();
    if (userInfo && userInfo.token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
    }
    return next.handle(req).pipe(
      catchError((error) => {
        if (error.status === this.HTTP_REDIRECT_CODE) {
          this.authService.logOut();
          this.router.navigate(['/login'], { replaceUrl: true });
          return EMPTY;
        }
        return throwError(() => error);
      })
    );
  }
}
