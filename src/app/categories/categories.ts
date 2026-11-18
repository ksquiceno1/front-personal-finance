import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormTransactionComponent } from '../shared/components/form-transaction/form-transaction.component';
import { resolveCategoryIconClass } from '../shared/utils/category-icons';
import {
  CategoriesService,
  Category,
  CategoryTransaction,
} from '../shared/services/categories.service';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormTransactionComponent],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  showTransactionModal = false;
  categories: Category[] = [];
  isLoadingCategories = true;
  categoriesLoadError = '';
  selectedCategory: Category | null = null;
  categoryTransactions: CategoryTransaction[] = [];
  isLoadingCategoryTransactions = false;
  categoryTransactionsError = '';
  private categoryTransactionsRequestId = 0;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.categoriesLoadError = '';
    this.categoriesService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        if (this.selectedCategory) {
          this.selectedCategory =
            categories.find((category) => category.id === this.selectedCategory?.id) ?? null;
        }
        this.isLoadingCategories = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.categoriesLoadError = error instanceof Error
          ? error.message
          : 'No se pudieron cargar las categorías.';
        this.isLoadingCategories = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  getCategoryIconClass(icon: string): string {
    return resolveCategoryIconClass(icon);
  }

  selectCategory(category: Category): void {
    this.selectedCategory = category;
    this.categoryTransactions = [];
    this.categoryTransactionsError = '';
    this.isLoadingCategoryTransactions = true;
    const requestId = ++this.categoryTransactionsRequestId;

    this.categoriesService.getCategoryTransactions(category.id).subscribe({
      next: (transactions) => {
        if (requestId !== this.categoryTransactionsRequestId) {
          return;
        }

        this.categoryTransactions = transactions;
        this.isLoadingCategoryTransactions = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        if (requestId !== this.categoryTransactionsRequestId) {
          return;
        }

        this.categoryTransactionsError = error instanceof Error
          ? error.message
          : 'No se pudieron cargar las transacciones de la categoría.';
        this.isLoadingCategoryTransactions = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  get selectedCategoryIsIncome(): boolean {
    if (!this.selectedCategory) {
      return false;
    }

    const categoryIndex = this.categories.findIndex(
      (category) => category.id === this.selectedCategory?.id,
    );
    const categoryPosition = categoryIndex + 1;
    return categoryPosition >= 12 && categoryPosition <= 20;
  }

  get selectedCategoryTotal(): number {
    const type = this.selectedCategoryIsIncome ? 'income' : 'expense';
    return this.categoryTransactions
      .filter((transaction) => transaction.type === type)
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  getCategoryIconClassForSelection(): string {
    return this.selectedCategory
      ? this.getCategoryIconClass(this.selectedCategory.icon)
      : 'fa-solid fa-wallet';
  }

  reloadSelectedCategory(): void {
    if (this.selectedCategory) {
      this.selectCategory(this.selectedCategory);
    }
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
  }

  onTransactionSaved(): void {
    this.showTransactionModal = false;
    this.loadCategories();
    if (this.selectedCategory) {
      this.selectCategory(this.selectedCategory);
    }
  }
}
