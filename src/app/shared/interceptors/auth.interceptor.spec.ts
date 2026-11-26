import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpTestingController: HttpTestingController;
  let navigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    navigate = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate } },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.removeItem('personal-finance-access-token');
    localStorage.removeItem('personal-finance-refresh-token');
    sessionStorage.removeItem('personal-finance-access-token');
    sessionStorage.removeItem('personal-finance-refresh-token');
  });

  it('clears the session and redirects when an authenticated request returns 401', () => {
    localStorage.setItem('personal-finance-access-token', 'invalid-token');
    localStorage.setItem('personal-finance-refresh-token', 'refresh-token');
    sessionStorage.setItem('personal-finance-access-token', 'session-access-token');
    sessionStorage.setItem('personal-finance-refresh-token', 'session-refresh-token');

    http.get('/api/private', {
      headers: { Authorization: 'Bearer invalid-token' },
    }).subscribe({ error: () => undefined });

    httpTestingController.expectOne('/api/private').flush(
      { detail: 'Token is invalid' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(localStorage.getItem('personal-finance-access-token')).toBeNull();
    expect(localStorage.getItem('personal-finance-refresh-token')).toBeNull();
    expect(sessionStorage.getItem('personal-finance-access-token')).toBeNull();
    expect(sessionStorage.getItem('personal-finance-refresh-token')).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not close the session for an unauthenticated 401 response', () => {
    localStorage.setItem('personal-finance-access-token', 'stored-token');

    http.post('/auth/login', {}).subscribe({ error: () => undefined });

    httpTestingController.expectOne('/auth/login').flush(
      { detail: 'Invalid credentials' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(localStorage.getItem('personal-finance-access-token')).toBe('stored-token');
    expect(navigate).not.toHaveBeenCalled();
  });
});
