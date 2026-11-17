import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from './auth.service';

interface DashboardBalanceResponse {
  total_income: string;
  total_expense: string;
  total_balance: string;
  income_comparison: MonthlyComparison;
  expense_comparison: MonthlyComparison;
}

interface DashboardTopCategoryResponse {
  category_name: string;
  percentage: number;
  icon: string;
  total_amount: string;
}

interface DashboardRecentTransactionResponse {
  description: string | null;
  icon_category: string;
  amount: string;
  type: 'expense' | 'income';
  date: string;
}

export interface MonthlyComparison {
  percentage: number | null;
  direction: 'up' | 'down' | 'unchanged';
}

export interface DashboardRecentTransaction {
  description: string | null;
  iconCategory: string;
  amount: number;
  type: 'expense' | 'income';
  date: string;
}

export interface DashboardTopCategory {
  categoryName: string;
  percentage: number;
  icon: string;
  totalAmount: number;
}

export interface DashboardBalance {
  income: number;
  expenses: number;
  balance: number;
  incomeComparison: MonthlyComparison;
  expenseComparison: MonthlyComparison;
}

export type DashboardChartPeriod = 'months' | 'quarters' | 'years';

interface DashboardChartResponse {
  chartLabels: string[];
  incomeData: number[];
  expensesData: number[];
}

export interface DashboardChart {
  labels: string[];
  income: number[];
  expenses: number[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly endpoint = 'http://localhost:8000/dashboard';

  getBalance(): Observable<DashboardBalance> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() => new Error('No hay una sesión activa. Inicia sesión para continuar.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get<DashboardBalanceResponse>(`${this.endpoint}/balance/`, { headers }).pipe(
      map((response) => ({
        income: Number(response.total_income),
        expenses: Number(response.total_expense),
        balance: Number(response.total_balance),
        incomeComparison: response.income_comparison,
        expenseComparison: response.expense_comparison,
      })),
      catchError((error: unknown) => this.handleError(error)),
    );
  }

  getTopCategories(): Observable<DashboardTopCategory[]> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() => new Error('No hay una sesión activa. Inicia sesión para continuar.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get<DashboardTopCategoryResponse[]>(
      `${this.endpoint}/top-categories/`,
      { headers },
    ).pipe(
      map((categories) => categories.map((category) => ({
        categoryName: category.category_name,
        percentage: category.percentage,
        icon: category.icon,
        totalAmount: Number(category.total_amount),
      }))),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudieron cargar las categorías principales.'),
      ),
    );
  }

  getRecentTransactions(): Observable<DashboardRecentTransaction[]> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() => new Error('No hay una sesión activa. Inicia sesión para continuar.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get<DashboardRecentTransactionResponse[]>(
      `${this.endpoint}/recent-transactions/`,
      { headers },
    ).pipe(
      map((transactions) => transactions.map((transaction) => ({
        description: transaction.description,
        iconCategory: transaction.icon_category,
        amount: Number(transaction.amount),
        type: transaction.type,
        date: transaction.date,
      }))),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudieron cargar las transacciones recientes.'),
      ),
    );
  }

  getChart(period: DashboardChartPeriod): Observable<DashboardChart> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() => new Error('No hay una sesión activa. Inicia sesión para continuar.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
    const params = new HttpParams().set('period', period);

    return this.http.get<DashboardChartResponse>(`${this.endpoint}/chart/`, { headers, params }).pipe(
      map((response) => ({
        labels: response.chartLabels,
        income: response.incomeData,
        expenses: response.expensesData,
      })),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudo cargar el gráfico del dashboard.'),
      ),
    );
  }

  private handleError(
    error: unknown,
    fallbackMessage = 'No se pudo cargar el balance.',
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
      error instanceof Error ? error : new Error('Ocurrió un error inesperado al cargar el balance.'),
    );
  }
}
