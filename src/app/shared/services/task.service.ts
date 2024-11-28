import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRequest } from '@shared/interfaces/request.interface';
import { Task } from '@shared/interfaces/task.interface';
import { CreateTaskRequest } from '@shared/interfaces/create-task-request.interface';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly _API_URL: string;

  constructor(private _httpClient: HttpClient) {
    this._API_URL = 'https://todo-ease.com/api/task';
  }

  public getAllTasks(): Observable<IRequest<Task[]>> {
    return this._httpClient.get<IRequest<Task[]>>(`${this._API_URL}/all`);
  }

  public getAllTasksByProjectId(projectId: number): Observable<IRequest<Task[]>> {
    return this._httpClient.get<IRequest<Task[]>>(`${this._API_URL}/project/${projectId}`);
  }

  public createTask(request: CreateTaskRequest): Observable<IRequest<any>> {
    return this._httpClient.post<IRequest<any>>(`${this._API_URL}/create`, request);
  }
}
