import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IRequest } from '@shared/interfaces/request.interface';
import { IUser } from '@shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly API_URL: string = 'https://todo-ease.com/api/user';
  private httpClient = inject(HttpClient);

  getAll(): Observable<IRequest<IUser[]>> {
    return this.httpClient.get<IRequest<IUser[]>>(`${this.API_URL}/all`);
  }
}
