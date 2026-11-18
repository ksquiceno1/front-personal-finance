import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export interface Category {
  id: number;
  name: string;
  icon: string;
  description: string;
  transaction_count: number;
}

interface CategoryTransactionResponse {
  id: number;
  description: string | null;
  amount: string;
  date: string;
  type: 'expense' | 'income';
  category_name: string;
  icon_category: string;
}

export interface CategoryTransaction {
  id: number;
  description: string | null;
  amount: number;
  date: string;
  type: 'expense' | 'income';
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = 'http://localhost:8000';

  getCategories(): Observable<Category[]> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return this.missingSessionError();
    }

    return this.http.get<Category[]>(`${this.apiUrl}/categories/`, { headers }).pipe(
      catchError((error: unknown) => this.handleError(error)),
    );
  }

  getCategoryTransactions(categoryId: number): Observable<CategoryTransaction[]> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return this.missingSessionError();
    }

    return this.http.get<CategoryTransactionResponse[]>(
      `${this.apiUrl}/transactions/${categoryId}/`,
      { headers },
    ).pipe(
      map((transactions) => transactions.map((transaction) => ({
        id: transaction.id,
        description: transaction.description,
        amount: Number(transaction.amount),
        date: transaction.date,
        type: transaction.type,
      }))),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudieron cargar las transacciones de la categoría.'),
      ),
    );
  }

  private getAuthHeaders(): HttpHeaders | null {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return null;
    }

    return new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
  }

  private missingSessionError(): Observable<never> {
    return throwError(() =>
      new Error('No hay una sesión activa. Inicia sesión para continuar.'),
    );
  }

  private handleError(
    error: unknown,
    fallbackMessage = 'No se pudieron cargar las categorías.',
  ): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return throwError(() =>
          new Error('No fue posible conectar con el servidor. Inténtalo de nuevo.'),
        );
      }

      const detail = error.error?.detail;
      const message = typeof detail === 'string'
        ? detail
        : `${fallbackMessage} (${error.status}).`;
      return throwError(() => new Error(message));
    }

    return throwError(() =>
      error instanceof Error ? error : new Error('Ocurrió un error inesperado.'),
    );
  }
}
