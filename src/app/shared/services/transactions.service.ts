import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from './auth.service';

interface TransactionPageResponse {
  count: number;
  next: string | null;
  summary: {
    transaction_count: number;
    total_expenses: string;
  };
  results: TransactionResponse[];
}

interface TransactionResponse {
  id: number;
  description: string | null;
  amount: string;
  date: string;
  type: 'expense' | 'income';
  category_id: number;
  category_name: string;
  icon_category: string;
}

interface CategoryResponse {
  id: number;
  name: string;
  icon: string;
  description: string;
}

export interface TransactionCategory {
  id: number;
  name: string;
  icon: string;
}

export interface TransactionPayload {
  amount: number;
  category_id: number;
  type: 'expense' | 'income';
  description: string;
  date: string;
}

export interface TransactionItem {
  id: number;
  description: string | null;
  amount: number;
  date: string;
  type: 'expense' | 'income';
  categoryId: number;
  categoryName: string;
  iconCategory: string;
}

export interface TransactionPage {
  count: number;
  totalExpenses: number;
  hasNextPage: boolean;
  results: TransactionItem[];
}

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly endpoint = 'http://localhost:8000/transactions/';
  private readonly categoriesEndpoint = 'http://localhost:8000/categories/';

  getTransactions(page: number): Observable<TransactionPage> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return this.missingSessionError();
    }
    const params = new HttpParams().set('page', page);

    return this.http.get<TransactionPageResponse>(this.endpoint, { headers, params }).pipe(
      map((response) => ({
        count: response.count,
        totalExpenses: Number(response.summary.total_expenses),
        hasNextPage: response.next !== null,
        results: response.results.map((transaction) => ({
          id: transaction.id,
          description: transaction.description,
          amount: Number(transaction.amount),
          date: transaction.date,
          type: transaction.type,
          categoryId: transaction.category_id,
          categoryName: transaction.category_name,
          iconCategory: transaction.icon_category,
        })),
      })),
      catchError((error: unknown) => this.handleError(error)),
    );
  }

  getCategories(): Observable<TransactionCategory[]> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return this.missingSessionError();
    }

    return this.http.get<CategoryResponse[]>(this.categoriesEndpoint, {
      headers,
    }).pipe(
      map((categories) => categories.map(({ id, name, icon }) => ({ id, name, icon }))),
      catchError((error: unknown) => this.handleError(error, 'No se pudieron cargar las categorías.')),
    );
  }

  createTransaction(payload: TransactionPayload): Observable<TransactionItem> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return this.missingSessionError();
    }

    return this.http.post<TransactionResponse>(
      `${this.endpoint}create/`,
      payload,
      { headers },
    ).pipe(
      map((transaction) => this.mapTransaction(transaction)),
      catchError((error: unknown) => this.handleError(error, 'No se pudo crear la transacción.')),
    );
  }

  updateTransaction(id: number, payload: TransactionPayload): Observable<TransactionItem> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return this.missingSessionError();
    }

    return this.http.patch<TransactionResponse>(
      `${this.endpoint}edit/${id}/`,
      payload,
      { headers },
    ).pipe(
      map((transaction) => this.mapTransaction(transaction)),
      catchError((error: unknown) => this.handleError(error, 'No se pudo actualizar la transacción.')),
    );
  }

  deleteTransaction(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    if (!headers) {
      return this.missingSessionError();
    }

    return this.http.delete<void>(
      `${this.endpoint}delete/${id}/`,
      { headers },
    ).pipe(
      catchError((error: unknown) => this.handleError(error, 'No se pudo eliminar la transacción.')),
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

  private mapTransaction(transaction: TransactionResponse): TransactionItem {
    return {
      id: transaction.id,
      description: transaction.description,
      amount: Number(transaction.amount),
      date: transaction.date,
      type: transaction.type,
      categoryId: transaction.category_id,
      categoryName: transaction.category_name,
      iconCategory: transaction.icon_category,
    };
  }

  private handleError(
    error: unknown,
    fallbackMessage = 'No se pudieron cargar las transacciones.',
  ): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return throwError(() => new Error('No fue posible conectar con el servidor. Inténtalo de nuevo.'));
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
