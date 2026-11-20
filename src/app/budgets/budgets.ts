import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ChartCircleComponent } from '../shared/components/chart-circle/chart-circle.component';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { TableDynamicComponent } from "../shared/components/table-dynamic/table-dynamic.component";
import { BudgetFormModal } from './components/budget-form-modal/budget-form-modal';
import { CategoriesService } from '../shared/services/categories.service';
import {
  BudgetBalance,
  BudgetCategory,
  BudgetItem,
  BudgetSummary,
  BudgetsService,
} from '../shared/services/budgets.service';
import { resolveCategoryIconClass } from '../shared/utils/category-icons';

interface BudgetTableRow {
  id: number;
  name: string;
  period: string;
  asign: string;
  expense: string;
  state: string;
}

@Component({
  selector: 'app-budgets',
  imports: [
    CommonModule,
    FormsModule,
    ChartCircleComponent,
    ConfirmDialogComponent,
    TableDynamicComponent,
    BudgetFormModal,
  ],
  templateUrl: './budgets.html',
  styleUrl: './budgets.scss',
})
export class Budgets implements OnInit {
  private readonly budgetsService = inject(BudgetsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  date: string = new Date().toISOString().split('T')[0];
  budgetBalance: BudgetBalance | null = null;
  isLoadingBalance = true;
  balanceLoadError = '';
  budgetSummary: BudgetSummary | null = null;
  isLoadingSummary = true;
  summaryLoadError = '';
  categoryBudgets: BudgetCategory[] = [];
  isLoadingCategoryBudgets = true;
  categoryBudgetsLoadError = '';
  budgetItems: BudgetItem[] = [];
  budgetRows: BudgetTableRow[] = [];
  isLoadingBudgets = true;
  budgetsLoadError = '';
  showBudgetModal = false;
  selectedBudget: BudgetItem | null = null;
  pendingDeleteBudget: BudgetItem | null = null;
  isDeletingBudget = false;
  deleteBudgetError = '';
  currentBudgetPage = 1;
  readonly budgetPageSize = 5;
  private summaryRequestId = 0;
  columns = [
    { key: 'name', label: 'Nombre' },
    { key: 'period', label: 'Periodo' },
    { key: 'asign', label: 'Total Asignado' },
    { key: 'expense', label: 'Gastado' },
    { key: 'state', label: 'Estado' },
    {
      key: 'actions',
      label: 'Acciones',
      actions: [
        { key: 'edit', label: 'Editar', icon: 'fa-solid fa-pen' },
        { key: 'delete', label: 'Eliminar', icon: 'fa-solid fa-trash-can' },
      ],
    },
  ];

  get rows(): BudgetTableRow[] {
    const startIndex = (this.currentBudgetPage - 1) * this.budgetPageSize;
    return this.budgetRows.slice(startIndex, startIndex + this.budgetPageSize);
  }

  get budgetPageCount(): number {
    return Math.max(1, Math.ceil(this.budgetRows.length / this.budgetPageSize));
  }

  get firstVisibleBudget(): number {
    return this.budgetRows.length === 0
      ? 0
      : (this.currentBudgetPage - 1) * this.budgetPageSize + 1;
  }

  get lastVisibleBudget(): number {
    return Math.min(this.currentBudgetPage * this.budgetPageSize, this.budgetRows.length);
  }

  get pendingDeleteBudgetName(): string {
    if (!this.pendingDeleteBudget) {
      return 'este presupuesto';
    }

    return this.budgetRows.find((row) => row.id === this.pendingDeleteBudget?.id)?.name
      ?? 'este presupuesto';
  }

  get formattedDate(): string {
    const date = new Date(this.date);
    const day = date.getDate();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[date.getMonth()]}`;
  }

  ngOnInit(): void {
    this.loadBudgetBalance();
    this.loadBudgetSummary();
    this.loadCategoryBudgets();
    this.loadBudgets();
  }

  loadBudgetBalance(): void {
    this.isLoadingBalance = true;
    this.balanceLoadError = '';
    this.budgetsService.getBalance().subscribe({
      next: (balance) => {
        this.budgetBalance = balance;
        this.isLoadingBalance = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.balanceLoadError = error instanceof Error
          ? error.message
          : 'No se pudo cargar el resumen de presupuestos.';
        this.isLoadingBalance = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  loadBudgetSummary(): void {
    const requestId = ++this.summaryRequestId;
    this.isLoadingSummary = true;
    this.summaryLoadError = '';
    this.budgetsService.getSummary(this.date).subscribe({
      next: (summary) => {
        if (requestId !== this.summaryRequestId) {
          return;
        }

        this.budgetSummary = summary;
        this.isLoadingSummary = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        if (requestId !== this.summaryRequestId) {
          return;
        }

        this.summaryLoadError = error instanceof Error
          ? error.message
          : 'No se pudo cargar el resumen mensual del presupuesto.';
        this.isLoadingSummary = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  loadCategoryBudgets(): void {
    this.isLoadingCategoryBudgets = true;
    this.categoryBudgetsLoadError = '';
    this.budgetsService.getCategoryBudgets().subscribe({
      next: (categories) => {
        this.categoryBudgets = categories;
        this.isLoadingCategoryBudgets = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.categoryBudgetsLoadError = error instanceof Error
          ? error.message
          : 'No se pudieron cargar los presupuestos por categoría.';
        this.isLoadingCategoryBudgets = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  getCategoryIconClass(icon: string): string {
    return resolveCategoryIconClass(icon);
  }

  loadBudgets(): void {
    this.isLoadingBudgets = true;
    this.budgetsLoadError = '';
    forkJoin({
      budgets: this.budgetsService.getBudgets(),
      categories: this.categoriesService.getCategories(),
    }).subscribe({
      next: ({ budgets, categories }) => {
        this.budgetItems = budgets;
        const categoryNames = new Map(
          categories.map((category) => [category.id, category.name]),
        );
        this.budgetRows = [...budgets]
          .sort((left, right) =>
            right.startDate.localeCompare(left.startDate) || right.id - left.id,
          )
          .map((budget) => this.toBudgetTableRow(budget, categoryNames));
        this.currentBudgetPage = 1;
        this.isLoadingBudgets = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.budgetsLoadError = error instanceof Error
          ? error.message
          : 'No se pudieron cargar los presupuestos.';
        this.isLoadingBudgets = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  openCreateBudgetModal(): void {
    this.selectedBudget = null;
    this.showBudgetModal = true;
  }

  onBudgetTableAction(event: { action: string; row: BudgetTableRow }): void {
    const budget = this.budgetItems.find((item) => item.id === event.row.id);
    if (!budget) {
      return;
    }

    if (event.action === 'edit') {
      this.selectedBudget = budget;
      this.showBudgetModal = true;
      return;
    }

    if (event.action === 'delete' && !this.isDeletingBudget) {
      this.pendingDeleteBudget = budget;
      this.deleteBudgetError = '';
    }
  }

  onBudgetSaved(): void {
    this.showBudgetModal = false;
    this.selectedBudget = null;
    this.refreshBudgetData();
  }

  confirmDeleteBudget(): void {
    const budget = this.pendingDeleteBudget;
    if (!budget || this.isDeletingBudget) {
      return;
    }

    this.isDeletingBudget = true;
    this.deleteBudgetError = '';
    this.budgetsService.deleteBudget(budget.id).subscribe({
      next: () => {
        this.isDeletingBudget = false;
        this.pendingDeleteBudget = null;
        this.refreshBudgetData();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.deleteBudgetError = error instanceof Error
          ? error.message
          : 'No se pudo eliminar el presupuesto.';
        this.isDeletingBudget = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  cancelDeleteBudget(): void {
    if (!this.isDeletingBudget) {
      this.pendingDeleteBudget = null;
      this.deleteBudgetError = '';
    }
  }

  private refreshBudgetData(): void {
    this.loadBudgets();
    this.loadBudgetBalance();
    this.loadBudgetSummary();
    this.loadCategoryBudgets();
  }

  closeBudgetModal(): void {
    this.showBudgetModal = false;
    this.selectedBudget = null;
  }

  previousBudgetPage(): void {
    if (this.currentBudgetPage > 1) {
      this.currentBudgetPage--;
    }
  }

  nextBudgetPage(): void {
    if (this.currentBudgetPage < this.budgetPageCount) {
      this.currentBudgetPage++;
    }
  }

  private toBudgetTableRow(
    budget: BudgetItem,
    categoryNames: Map<number, string>,
  ): BudgetTableRow {
    return {
      id: budget.id,
      name: categoryNames.get(budget.categoryId) ?? `Categoría ${budget.categoryId}`,
      period: budget.startDate.slice(0, 7),
      asign: this.formatAmount(budget.amount),
      expense: this.formatAmount(budget.expended),
      state: this.getBudgetState(budget),
    };
  }

  private formatAmount(amount: number): string {
    return `$${amount.toLocaleString('es-CO', {
      maximumFractionDigits: 2,
    })}`;
  }

  private getBudgetState(budget: BudgetItem): string {
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    if (budget.startDate > today) {
      return 'Programado';
    }
    return budget.endDate < today ? 'Finalizado' : 'Activo';
  }
}
