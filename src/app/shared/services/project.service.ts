import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IRequest } from '../interfaces/request.interface';
import { HttpClient } from '@angular/common/http';
import { IProject, IProjectCreate } from '@shared/interfaces/project.interface';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly API_URL: string = 'https://todo-ease.com/api/project';
  private httpClient = inject(HttpClient);

  getAll(): Observable<IRequest<IProject[]>> {
    return this.httpClient.get<IRequest<IProject[]>>(`${this.API_URL}/all`);
  }
  create(project: IProjectCreate): Observable<IRequest<IProjectCreate>> {
    return this.httpClient.post<IRequest<IProjectCreate>>(
      `${this.API_URL}/create`,
      project
    );
  }
}
