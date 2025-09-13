import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface User {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private users: User[] = [];

  constructor() {}

  // Mock login
  login(email: string, password: string): Observable<boolean> {
    const userExists = this.users.find(
      (user) => user.email === email && user.password === password
    );
    return of(!!userExists);
  }

  // Mock register
  register(email: string, password: string): Observable<boolean> {
    const userExists = this.users.find((user) => user.email === email);
    if (userExists) {
      return of(false);
    }
    this.users.push({ email, password });
    return of(true);
  }
}
