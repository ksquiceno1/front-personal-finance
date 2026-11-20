import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AuthService } from './auth.service';

interface BudgetBalanceResponse {
  presupuesto_total: string;
  gastado: string;
  gastado_porcentaje: string;
  disponible: string;
  disponible_porcentaje: string;
  categorias_activas: number;
}

interface BudgetSummaryResponse {
  porcentaje_utilizado: string;
  categorias: BudgetSummaryCategoryResponse[];
}

interface BudgetSummaryCategoryResponse {
  nombre_categoria: string;
  presupuesto_categoria: string;
  total_gastado: string;
  porcentaje: string;
}

interface BudgetCategoryResponse {
  name_category: string;
  icon_category: string;
  budget_amount: string;
  percentage: string;
}

interface BudgetResponse {
  id: number;
  category_id: number;
  amount: string;
  expended: string;
  available: string;
  start_date: string;
  end_date: string;
}

export interface BudgetPayload {
  category_id: number;
  amount: number;
  expended: number;
  available: number;
  start_date: string;
  end_date: string;
}

export interface BudgetBalance {
  totalBudget: number;
  spent: number;
  spentPercentage: number;
  available: number;
  availablePercentage: number;
  activeCategories: number;
}

export interface BudgetSummaryCategory {
  name: string;
  budgetAmount: number;
  totalSpent: number;
  percentage: number;
}

export interface BudgetSummary {
  usedPercentage: number;
  categories: BudgetSummaryCategory[];
}

export interface BudgetCategory {
  name: string;
  icon: string;
  budgetAmount: number;
  percentage: number;
}

export interface BudgetItem {
  id: number;
  categoryId: number;
  amount: number;
  expended: number;
  available: number;
  startDate: string;
  endDate: string;
}

@Injectable({ providedIn: 'root' })
export class BudgetsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly endpoint = 'http://localhost:8000/budgets/balance/';

  getBalance(): Observable<BudgetBalance> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() =>
        new Error('No hay una sesión activa. Inicia sesión para continuar.'),
      );
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get<BudgetBalanceResponse>(this.endpoint, { headers }).pipe(
      map((response) => ({
        totalBudget: Number(response.presupuesto_total),
        spent: Number(response.gastado),
        spentPercentage: Number(response.gastado_porcentaje),
        available: Number(response.disponible),
        availablePercentage: Number(response.disponible_porcentaje),
        activeCategories: response.categorias_activas,
      })),
      catchError((error: unknown) => this.handleError(error)),
    );
  }

  getSummary(date: string): Observable<BudgetSummary> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() =>
        new Error('No hay una sesión activa. Inicia sesión para continuar.'),
      );
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });
    const params = new HttpParams().set('fecha', date);

    return this.http.get<BudgetSummaryResponse>(
      'http://localhost:8000/budgets/summary/',
      { headers, params },
    ).pipe(
      map((response) => ({
        usedPercentage: Number(response.porcentaje_utilizado),
        categories: response.categorias.map((category) => ({
          name: category.nombre_categoria,
          budgetAmount: Number(category.presupuesto_categoria),
          totalSpent: Number(category.total_gastado),
          percentage: Number(category.porcentaje),
        })),
      })),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudo cargar el resumen mensual del presupuesto.'),
      ),
    );
  }

  getCategoryBudgets(): Observable<BudgetCategory[]> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() =>
        new Error('No hay una sesión activa. Inicia sesión para continuar.'),
      );
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get<BudgetCategoryResponse[]>(
      'http://localhost:8000/budgets/categories/',
      { headers },
    ).pipe(
      map((categories) => categories.map((category) => ({
        name: category.name_category,
        icon: category.icon_category,
        budgetAmount: Number(category.budget_amount),
        percentage: Number(category.percentage),
      }))),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudieron cargar los presupuestos por categoría.'),
      ),
    );
  }

  getBudgets(): Observable<BudgetItem[]> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() =>
        new Error('No hay una sesión activa. Inicia sesión para continuar.'),
      );
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.get<BudgetResponse[]>('http://localhost:8000/budgets/', { headers }).pipe(
      map((budgets) => budgets.map((budget) => ({
        id: budget.id,
        categoryId: budget.category_id,
        amount: Number(budget.amount),
        expended: Number(budget.expended),
        available: Number(budget.available),
        startDate: budget.start_date,
        endDate: budget.end_date,
      }))),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudieron cargar los presupuestos.'),
      ),
    );
  }

  createBudget(payload: BudgetPayload): Observable<BudgetItem> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() =>
        new Error('No hay una sesión activa. Inicia sesión para continuar.'),
      );
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.post<BudgetResponse>(
      'http://localhost:8000/budgets/create/',
      payload,
      { headers },
    ).pipe(
      map((budget) => this.mapBudget(budget)),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudo crear el presupuesto.'),
      ),
    );
  }

  updateBudget(id: number, payload: BudgetPayload): Observable<BudgetItem> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() =>
        new Error('No hay una sesión activa. Inicia sesión para continuar.'),
      );
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.patch<BudgetResponse>(
      `http://localhost:8000/budgets/edit/${id}/`,
      payload,
      { headers },
    ).pipe(
      map((budget) => this.mapBudget(budget)),
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudo actualizar el presupuesto.'),
      ),
    );
  }

  deleteBudget(id: number): Observable<void> {
    const accessToken = this.authService.getAccessToken();
    if (!accessToken) {
      return throwError(() =>
        new Error('No hay una sesión activa. Inicia sesión para continuar.'),
      );
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http.delete<void>(
      `http://localhost:8000/budgets/delete/${id}/`,
      { headers },
    ).pipe(
      catchError((error: unknown) =>
        this.handleError(error, 'No se pudo eliminar el presupuesto.'),
      ),
    );
  }

  private mapBudget(budget: BudgetResponse): BudgetItem {
    return {
      id: budget.id,
      categoryId: budget.category_id,
      amount: Number(budget.amount),
      expended: Number(budget.expended),
      available: Number(budget.available),
      startDate: budget.start_date,
      endDate: budget.end_date,
    };
  }

  private handleError(
    error: unknown,
    fallbackMessage = 'No se pudo cargar el resumen de presupuestos.',
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
