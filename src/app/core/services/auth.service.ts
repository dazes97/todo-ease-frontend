import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IRequest } from "@shared/interfaces/request.interface";
import { ILogin } from "../interfaces";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly apiUrl = "https://todo-ease.com/api/authentication";
  private httpClient = inject(HttpClient);

  public logIn(
    username: string | null,
    password: string | null
  ): Observable<IRequest<ILogin>> {
    return this.httpClient.post<IRequest<ILogin>>(`${this.apiUrl}/login`, {
      username,
      password,
    });
  }

  public saveUserInfo(userInfo: ILogin): void {
    localStorage.setItem("user", JSON.stringify(userInfo));
  }

  public getUserInfo(): ILogin | null {
    const userInfo = localStorage.getItem("user");
    if (!userInfo) {
      return null;
    }
    return JSON.parse(userInfo);
  }

  public logOut(): void {
    localStorage.removeItem("user");
  }
}
