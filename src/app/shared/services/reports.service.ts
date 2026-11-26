import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from './auth.service';

interface ReportBalanceResponse {
  total_income: string;
  total_expense: string;
  total_saved: string;
  final_balance: string;
  income_comparison: ReportComparison;
  expense_comparison: ReportComparison;
  saved_comparison: ReportComparison;
  final_balance_comparison: ReportComparison;
}

export interface ReportComparison {
  percentage: number | null;
  direction: 'up' | 'down' | 'unchanged';
}

export interface ReportBalance {
  income: number;
  expenses: number;
  saved: number;
  finalBalance: number;
  incomeComparison: ReportComparison;
  expenseComparison: ReportComparison;
  savedComparison: ReportComparison;
  finalBalanceComparison: ReportComparison;
}

export interface PeriodExpense {
  description: string | null;
  amount: number;
}

export interface PeriodHighestCategory {
  name: string;
  percentage: number;
}

export interface ReportSummaryPeriod {
  daysPeriod: number;
  averageDailyExpense: number;
  highestExpense: PeriodExpense | null;
  lowestExpense: PeriodExpense | null;
  highestExpenseCategory: PeriodHighestCategory | null;
}

export type ComparativeChartPeriod = 'months' | 'quarters' | 'years';

export interface ComparativeChart {
  labels: string[];
  income: number[];
  expenses: number[];
}

export interface ReportExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
}

export interface ReportExpensesByCategory {
  totalExpenses: number;
  categories: ReportExpenseCategory[];
}

interface ReportSummaryPeriodResponse {
  days_period: number;
  average_daily_expense: string;
  highest_expense: {
    description: string | null;
    amount: string;
  } | null;
  lowest_expense: {
    description: string | null;
    amount: string;
  } | null;
  highest_expense_category: {
    name: string;
    percentage: string;
  } | null;
}

interface ComparativeChartResponse {
  chartLabels: string[];
  incomeData: number[];
  expensesData: number[];
}

interface ReportExpensesByCategoryResponse {
  total_expenses: string;
  categories: {
    name: string;
    amount: string;
    percentage: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class ReportsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly endpoint = 'http://localhost:8000/reports';

  getBalance(startDate: string, endDate: string): Observable<ReportBalance> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() => new Error('No hay una sesión activa. Inicia sesión para continuar.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get<ReportBalanceResponse>(`${this.endpoint}/balance/`, {
      headers,
      params,
    }).pipe(
      map((response) => ({
        income: Number(response.total_income),
        expenses: Number(response.total_expense),
        saved: Number(response.total_saved),
        finalBalance: Number(response.final_balance),
        incomeComparison: response.income_comparison,
        expenseComparison: response.expense_comparison,
        savedComparison: response.saved_comparison,
        finalBalanceComparison: response.final_balance_comparison,
      })),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudo cargar el balance de los reportes.'),
      ),
    );
  }

  getSummaryPeriod(startDate: string, endDate: string): Observable<ReportSummaryPeriod> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() => new Error('No hay una sesión activa. Inicia sesión para continuar.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get<ReportSummaryPeriodResponse>(`${this.endpoint}/summary-period/`, {
      headers,
      params,
    }).pipe(
      map((response) => ({
        daysPeriod: response.days_period,
        averageDailyExpense: Number(response.average_daily_expense),
        highestExpense: response.highest_expense
          ? {
              description: response.highest_expense.description,
              amount: Number(response.highest_expense.amount),
            }
          : null,
        lowestExpense: response.lowest_expense
          ? {
              description: response.lowest_expense.description,
              amount: Number(response.lowest_expense.amount),
            }
          : null,
        highestExpenseCategory: response.highest_expense_category
          ? {
              name: response.highest_expense_category.name,
              percentage: Number(response.highest_expense_category.percentage),
            }
          : null,
      })),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudo cargar el resumen del periodo.'),
      ),
    );
  }

  getComparativeChart(period: ComparativeChartPeriod): Observable<ComparativeChart> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() => new Error('No hay una sesión activa. Inicia sesión para continuar.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
    const params = new HttpParams().set('period', period);

    return this.http.get<ComparativeChartResponse>(
      `${this.endpoint}/comparative-chart/`,
      { headers, params },
    ).pipe(
      map((response) => ({
        labels: response.chartLabels,
        income: response.incomeData,
        expenses: response.expensesData,
      })),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudo cargar el gráfico comparativo.'),
      ),
    );
  }

  getExpensesByCategory(
    startDate: string,
    endDate: string,
  ): Observable<ReportExpensesByCategory> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() => new Error('No hay una sesión activa. Inicia sesión para continuar.'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    return this.http.get<ReportExpensesByCategoryResponse>(
      `${this.endpoint}/expenses-by-category/`,
      { headers, params },
    ).pipe(
      map((response) => ({
        totalExpenses: Number(response.total_expenses),
        categories: response.categories.map((category) => ({
          name: category.name,
          amount: Number(category.amount),
          percentage: Number(category.percentage),
        })),
      })),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudieron cargar los gastos por categoría.'),
      ),
    );
  }

  private handleError(
    error: unknown,
    fallbackMessage: string,
  ): Observable<never> {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return throwError(() => new Error('No fue posible conectar con el servidor.'));
      }

      const detail = error.error?.detail;
      const message = typeof detail === 'string'
        ? detail
        : `${fallbackMessage} (${error.status}).`;
      return throwError(() => new Error(message));
    }

    return throwError(() =>
      error instanceof Error ? error : new Error(fallbackMessage),
    );
  }
}
