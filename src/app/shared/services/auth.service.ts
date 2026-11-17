import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, tap, throwError } from 'rxjs';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  email: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
}

interface RegisterResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8000/auth';
  private readonly accessTokenKey = 'personal-finance-access-token';
  private readonly refreshTokenKey = 'personal-finance-refresh-token';

  login(credentials: LoginCredentials): Observable<AuthTokens> {
    return this.http.post<AuthTokens>(`${this.apiUrl}/login/`, credentials).pipe(
      tap((tokens) => {
        localStorage.setItem(this.accessTokenKey, tokens.access);
        localStorage.setItem(this.refreshTokenKey, tokens.refresh);
      }),
      catchError((error: unknown) => this.handleError(error)),
    );
  }

  register(credentials: RegisterCredentials): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register/`, credentials).pipe(
      catchError((error: unknown) => this.handleError(error)),
    );
  }

  getCurrentUser(): Observable<AuthenticatedUser> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return throwError(() => new Error('No hay una sesión activa. Inicia sesión para continuar.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get<AuthenticatedUser>(`${this.apiUrl}/me/`, { headers }).pipe(
      catchError((error: unknown) => this.handleError(error)),
    );
  }

  logout(): Observable<void> {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getStoredToken(this.refreshTokenKey);
    if (!accessToken || !refreshToken) {
      return throwError(() => new Error('No se encontraron los tokens de sesión.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.post(`${this.apiUrl}/logout/`, { refresh: refreshToken }, { headers }).pipe(
      tap(() => this.clearTokens()),
      map(() => undefined),
      catchError((error: unknown) => this.handleError(error)),
    );
  }

  getAccessToken(): string | null {
    return this.getStoredToken(this.accessTokenKey);
  }

  private clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
  }

  private getStoredToken(key: string): string | null {
    const persistentToken = localStorage.getItem(key);
    if (persistentToken) {
      return persistentToken;
    }

    const sessionToken = sessionStorage.getItem(key);
    if (sessionToken) {
      localStorage.setItem(key, sessionToken);
      sessionStorage.removeItem(key);
    }

    return sessionToken;
  }

  private handleError(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return throwError(() => new Error('No fue posible conectar con el servidor. Inténtalo de nuevo.'));
      }

      const message = this.getResponseMessage(error.error);
      return throwError(() => new Error(message || `Error del servidor (${error.status}).`));
    }

    return throwError(() =>
      error instanceof Error ? error : new Error('Ocurrió un error inesperado. Inténtalo de nuevo.'),
    );
  }

  private getResponseMessage(response: unknown): string {
    if (typeof response === 'string') {
      return response;
    }

    if (typeof response !== 'object' || response === null) {
      return '';
    }

    const data = response as Record<string, unknown>;
    const detail = data['detail'];
    if (typeof detail === 'string') {
      return detail;
    }

    return Object.entries(data)
      .flatMap(([field, messages]) => {
        const values = Array.isArray(messages) ? messages : [messages];
        return values
          .filter((message): message is string => typeof message === 'string')
          .map((message) => `${field}: ${message}`);
      })
      .join(' ');
  }
}
