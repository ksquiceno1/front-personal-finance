import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../shared/components/confirm-dialog/confirm-dialog.component';
import { resolveCategoryIconClass } from '../shared/utils/category-icons';
import {
  TransactionCategory,
  TransactionItem,
  TransactionPayload,
  TransactionsService,
} from '../shared/services/transactions.service';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule, ConfirmDialogComponent],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions implements OnInit {
  private readonly transactionsService = inject(TransactionsService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  transactions: TransactionItem[] = [];
  categories: TransactionCategory[] = [];
  totalCount = 0;
  totalExpenses = 0;
  nextPage = 1;
  hasMore = true;
  isLoading = false;
  isLoadingCategories = true;
  isSaving = false;
  deletingTransactionId: number | null = null;
  loadError = '';
  categoriesError = '';
  formError = '';
  formSuccessMessage = '';
  editingTransactionId: number | null = null;
  activeMenuTransactionId: number | null = null;
  pendingDeleteTransaction: TransactionItem | null = null;
  deleteError = '';
  form = this.createEmptyForm();

  get formattedDate(): string {
    const date = new Date(`${this.form.date}T00:00:00`);
    const day = date.getDate();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[date.getMonth()]}`;
  }

  ngOnInit(): void {
    this.loadTransactions();
    this.loadCategories();
  }

  private loadCategories(): void {
    this.transactionsService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoadingCategories = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.categoriesError = error instanceof Error
          ? error.message
          : 'No se pudieron cargar las categorías.';
        this.isLoadingCategories = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  loadTransactions(): void {
    if (this.isLoading || !this.hasMore) {
      return;
    }

    this.isLoading = true;
    this.loadError = '';
    const requestedPage = this.nextPage;
    this.transactionsService.getTransactions(requestedPage).subscribe({
      next: (page) => {
        this.transactions = [...this.transactions, ...page.results];
        this.totalCount = page.count;
        this.totalExpenses = page.totalExpenses;
        this.hasMore = page.hasNextPage;
        this.nextPage = requestedPage + 1;
        this.isLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.loadError = error instanceof Error
          ? error.message
          : 'No se pudieron cargar las transacciones.';
        this.isLoading = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  onTransactionsScroll(event: Event): void {
    const element = event.currentTarget as HTMLElement;
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 80) {
      this.loadTransactions();
    }
  }

  toggleMenu(transactionId: number): void {
    this.activeMenuTransactionId =
      this.activeMenuTransactionId === transactionId ? null : transactionId;
  }

  editTransaction(transaction: TransactionItem): void {
    this.editingTransactionId = transaction.id;
    this.form = {
      date: transaction.date.slice(0, 10),
      amount: transaction.amount,
      description: transaction.description ?? '',
      categoryId: transaction.categoryId,
      type: transaction.type,
    };
    this.formError = '';
    this.formSuccessMessage = '';
    this.activeMenuTransactionId = null;
  }

  saveTransaction(): void {
    if (this.isSaving || this.isLoadingCategories) {
      return;
    }

    if (
      !this.form.date ||
      !Number.isFinite(this.form.amount) ||
      this.form.amount <= 0 ||
      this.form.categoryId === null ||
      !this.form.description.trim()
    ) {
      this.formError = 'Completa todos los campos con valores válidos.';
      return;
    }

    const payload: TransactionPayload = {
      amount: Number(this.form.amount),
      category_id: this.form.categoryId,
      type: this.form.type,
      description: this.form.description.trim(),
      date: `${this.form.date}T12:00:00Z`,
    };
    const request = this.editingTransactionId === null
      ? this.transactionsService.createTransaction(payload)
      : this.transactionsService.updateTransaction(this.editingTransactionId, payload);
    const wasEditing = this.editingTransactionId !== null;

    this.isSaving = true;
    this.formError = '';
    this.formSuccessMessage = '';
    request.subscribe({
      next: () => {
        this.isSaving = false;
        this.formSuccessMessage = wasEditing
          ? 'La transacción se actualizó correctamente.'
          : 'La transacción se creó correctamente.';
        this.resetForm(false);
        this.refreshTransactions();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.formError = error instanceof Error
          ? error.message
          : 'No se pudo guardar la transacción.';
        this.isSaving = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  requestDeleteConfirmation(transaction: TransactionItem): void {
    if (this.deletingTransactionId !== null) {
      return;
    }

    this.pendingDeleteTransaction = transaction;
    this.deleteError = '';
    this.activeMenuTransactionId = null;
  }

  confirmDeleteTransaction(): void {
    const transaction = this.pendingDeleteTransaction;
    if (!transaction || this.deletingTransactionId !== null) {
      return;
    }

    this.deletingTransactionId = transaction.id;
    this.deleteError = '';
    this.transactionsService.deleteTransaction(transaction.id).subscribe({
      next: () => {
        this.deletingTransactionId = null;
        this.pendingDeleteTransaction = null;
        if (this.editingTransactionId === transaction.id) {
          this.resetForm();
        }
        this.refreshTransactions();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.deleteError = error instanceof Error
          ? error.message
          : 'No se pudo eliminar la transacción.';
        this.deletingTransactionId = null;
        this.changeDetector.markForCheck();
      },
    });
  }

  cancelDeleteConfirmation(): void {
    if (this.deletingTransactionId !== null) {
      return;
    }

    this.pendingDeleteTransaction = null;
    this.deleteError = '';
  }

  resetForm(clearMessages = true): void {
    this.form = this.createEmptyForm();
    this.editingTransactionId = null;
    if (clearMessages) {
      this.formError = '';
      this.formSuccessMessage = '';
    }
  }

  private refreshTransactions(): void {
    this.transactions = [];
    this.totalCount = 0;
    this.totalExpenses = 0;
    this.nextPage = 1;
    this.hasMore = true;
    this.loadTransactions();
  }

  private createEmptyForm(): {
    date: string;
    amount: number;
    description: string;
    categoryId: number | null;
    type: 'expense' | 'income';
  } {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return {
      date: `${today.getFullYear()}-${month}-${day}`,
      amount: 0,
      description: '',
      categoryId: null,
      type: 'expense',
    };
  }

  getCategoryIconClass(icon: string): string {
    return resolveCategoryIconClass(icon);
  }

}
