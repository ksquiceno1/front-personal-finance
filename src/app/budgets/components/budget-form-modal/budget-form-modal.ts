import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriesService, Category } from '../../../shared/services/categories.service';
import {
  BudgetItem,
  BudgetPayload,
  BudgetsService,
} from '../../../shared/services/budgets.service';

@Component({
  selector: 'app-budget-form-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './budget-form-modal.html',
  styleUrl: './budget-form-modal.scss',
})
export class BudgetFormModal implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly categoriesService = inject(CategoriesService);
  private readonly budgetsService = inject(BudgetsService);

  @Input() budget: BudgetItem | null = null;
  @Output() readonly saved = new EventEmitter<BudgetItem>();
  @Output() readonly closed = new EventEmitter<void>();

  categories: Category[] = [];
  isLoadingCategories = true;
  isSaving = false;
  categoryLoadError = '';
  saveError = '';
  form = this.createEmptyForm();

  get isEditing(): boolean {
    return this.budget !== null;
  }

  get availableAmount(): number {
    return Math.max(0, Number(this.form.amount) - Number(this.form.expended));
  }

  ngOnInit(): void {
    if (this.budget) {
      this.form = {
        categoryId: this.budget.categoryId,
        amount: this.budget.amount,
        expended: this.budget.expended,
        startDate: this.budget.startDate,
        endDate: this.budget.endDate,
      };
    }

    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoryLoadError = '';
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoadingCategories = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.categoryLoadError = error instanceof Error
          ? error.message
          : 'No se pudieron cargar las categorías.';
        this.isLoadingCategories = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  onSubmit(): void {
    if (this.isSaving || this.isLoadingCategories) {
      return;
    }

    if (
      this.form.categoryId === null ||
      !this.form.startDate ||
      !this.form.endDate ||
      this.form.startDate > this.form.endDate ||
      !Number.isFinite(this.form.amount) ||
      this.form.amount <= 0 ||
      !Number.isFinite(this.form.expended) ||
      this.form.expended < 0 ||
      this.form.expended > this.form.amount
    ) {
      this.saveError = 'Verifica la categoría, los montos y el rango de fechas.';
      return;
    }

    const payload: BudgetPayload = {
      category_id: this.form.categoryId,
      amount: Number(this.form.amount),
      expended: Number(this.form.expended),
      available: this.availableAmount,
      start_date: this.form.startDate,
      end_date: this.form.endDate,
    };
    const request = this.budget
      ? this.budgetsService.updateBudget(this.budget.id, payload)
      : this.budgetsService.createBudget(payload);

    this.isSaving = true;
    this.saveError = '';
    request.subscribe({
      next: (budget) => {
        this.isSaving = false;
        this.changeDetector.markForCheck();
        this.saved.emit(budget);
        this.close();
      },
      error: (error: unknown) => {
        this.saveError = error instanceof Error
          ? error.message
          : 'No se pudo guardar el presupuesto.';
        this.isSaving = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  close(): void {
    if (!this.isSaving) {
      this.closed.emit();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && !this.isSaving) {
      this.close();
    }
  }

  private createEmptyForm(): {
    categoryId: number | null;
    amount: number;
    expended: number;
    startDate: string;
    endDate: string;
  } {
    const today = this.getToday();
    return {
      categoryId: null,
      amount: 0,
      expended: 0,
      startDate: today,
      endDate: today,
    };
  }

  private getToday(): string {
    const today = new Date();
    return [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
  }
}
