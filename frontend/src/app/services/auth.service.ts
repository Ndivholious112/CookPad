import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map } from 'rxjs';

export interface User {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) {}

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
      }),
      map(() => true)
    );
  }

  register(email: string, password: string): Observable<boolean> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/register`, { email, password }).pipe(
      tap((res) => localStorage.setItem('token', res.token)),
      map(() => true)
    );
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
  }

  isAuthenticated(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('token');
  }

  getProfile(): Observable<{ _id: string; email: string; name: string; bio: string }> {
    const token = this.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return this.http.get<{ _id: string; email: string; name: string; bio: string }>(`${this.apiUrl}/me`, { headers });
  }

  updateProfile(data: { name: string; bio: string }): Observable<{ _id: string; email: string; name: string; bio: string }> {
    const token = this.getToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return this.http.put<{ _id: string; email: string; name: string; bio: string }>(`${this.apiUrl}/me`, data, { headers });
  }

  getUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch {
      return null;
    }
  }
}
