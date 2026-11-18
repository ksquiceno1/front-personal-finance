import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TransactionCategory,
  TransactionItem,
  TransactionsService,
} from '../../services/transactions.service';

@Component({
  selector: 'app-form-transaction',
  imports: [FormsModule],
  templateUrl: './form-transaction.component.html',
  styleUrl: './form-transaction.component.scss',
})
export class FormTransactionComponent implements OnInit {
  private readonly transactionsService = inject(TransactionsService);

  @Output() readonly saved = new EventEmitter<TransactionItem>();
  @Output() readonly closed = new EventEmitter<void>();

  categories: TransactionCategory[] = [];
  isLoadingCategories = true;
  isSaving = false;
  categoryLoadError = '';
  saveError = '';

  transaction = {
    date: this.getToday(),
    amount: 0,
    description: '',
    categoryId: null as number | null,
    type: 'expense' as 'expense' | 'income',
  };

  get formattedDate(): string {
    const [year, month, day] = this.transaction.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoryLoadError = '';
    this.transactionsService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.isLoadingCategories = false;
      },
      error: (error: unknown) => {
        this.categoryLoadError = error instanceof Error
          ? error.message
          : 'No se pudieron cargar las categorías.';
        this.isLoadingCategories = false;
      },
    });
  }

  onSubmit(): void {
    if (this.isSaving || this.isLoadingCategories) {
      return;
    }

    if (
      !this.transaction.date ||
      !Number.isFinite(this.transaction.amount) ||
      this.transaction.amount <= 0 ||
      this.transaction.categoryId === null ||
      !this.transaction.description.trim()
    ) {
      this.saveError = 'Completa todos los campos con valores válidos.';
      return;
    }

    this.isSaving = true;
    this.saveError = '';
    this.transactionsService.createTransaction({
      amount: Number(this.transaction.amount),
      category_id: this.transaction.categoryId,
      type: this.transaction.type,
      description: this.transaction.description.trim(),
      date: `${this.transaction.date}T12:00:00Z`,
    }).subscribe({
      next: (transaction) => {
        this.isSaving = false;
        this.saved.emit(transaction);
        this.close();
      },
      error: (error: unknown) => {
        this.saveError = error instanceof Error
          ? error.message
          : 'No se pudo crear la transacción.';
        this.isSaving = false;
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

  private getToday(): string {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  }
}
