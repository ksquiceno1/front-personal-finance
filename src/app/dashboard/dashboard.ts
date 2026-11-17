import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartBarComponent } from '../shared/components/chart-bar/chart-bar.component';
import { FormTransactionComponent } from '../shared/components/form-transaction/form-transaction.component';
import { AuthService } from '../shared/services/auth.service';
import {
  DashboardChartPeriod,
  DashboardService,
  DashboardRecentTransaction,
  DashboardTopCategory,
  MonthlyComparison,
} from '../shared/services/dashboard.service';
import { ChartDataset } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ChartBarComponent, FormTransactionComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly authService = inject(AuthService);
  private readonly dashboardService = inject(DashboardService);

  chartLabels: string[] = [];
  dataSets: ChartDataset[] = [
    {
      label: 'Ingresos',
      data: [],
      backgroundColor: ['rgb(8, 117, 4)'],
      borderRadius: 5,
    },
    {
      label: 'Gastos',
      data: [],
      backgroundColor: ['rgb(197, 33, 24)'],
      borderRadius: 5,
    },
  ];

  chartPeriod: DashboardChartPeriod = 'months';
  isLoadingChart = true;
  chartLoadError = '';
  private chartRequestId = 0;
  showTransactionModal = false;

  username = '';
  userLoadError = '';
  isLoadingUser = true;
  date: string = new Date().toISOString().split('T')[0];
  income: number | null = null;
  expenses: number | null = null;
  balance: number | null = null;
  incomeComparison: MonthlyComparison | null = null;
  expenseComparison: MonthlyComparison | null = null;
  isLoadingBalance = true;
  balanceLoadError = '';
  topCategories: DashboardTopCategory[] = [];
  isLoadingCategories = true;
  categoriesLoadError = '';
  transactions: DashboardRecentTransaction[] = [];
  isLoadingTransactions = true;
  transactionsLoadError = '';

  private readonly categoryIconClasses: Record<string, string> = {
    bus: 'fa-solid fa-bus',
    fork: 'fa-solid fa-utensils',
    house: 'fa-regular fa-house',
    wallet: 'fa-solid fa-wallet',
  };

  get formattedDate(): string {
    const date = new Date(this.date);
    const day = date.getDate();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[date.getMonth()]}`;
  }

  ngOnInit(): void {
    this.loadChart(this.chartPeriod);

    this.dashboardService.getBalance().subscribe({
      next: (balance) => {
        this.income = balance.income;
        this.expenses = balance.expenses;
        this.balance = balance.balance;
        this.incomeComparison = balance.incomeComparison;
        this.expenseComparison = balance.expenseComparison;
        this.isLoadingBalance = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.balanceLoadError = error instanceof Error
          ? error.message
          : 'No se pudo cargar el balance.';
        this.isLoadingBalance = false;
        this.changeDetector.markForCheck();
      },
    });

    this.dashboardService.getTopCategories().subscribe({
      next: (categories) => {
        this.topCategories = categories;
        this.isLoadingCategories = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.categoriesLoadError = error instanceof Error
          ? error.message
          : 'No se pudieron cargar las categorías principales.';
        this.isLoadingCategories = false;
        this.changeDetector.markForCheck();
      },
    });

    this.dashboardService.getRecentTransactions().subscribe({
      next: (transactions) => {
        this.transactions = transactions;
        this.isLoadingTransactions = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.transactionsLoadError = error instanceof Error
          ? error.message
          : 'No se pudieron cargar las transacciones recientes.';
        this.isLoadingTransactions = false;
        this.changeDetector.markForCheck();
      },
    });

    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.username = user.username;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.userLoadError = error instanceof Error
          ? error.message
          : 'No se pudo cargar la información del usuario.';
        this.isLoadingUser = false;
        this.changeDetector.markForCheck();
      },
      complete: () => {
        this.isLoadingUser = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  closeTransactionModal(): void {
    this.showTransactionModal = false;
  }

  loadChart(period: DashboardChartPeriod): void {
    this.chartPeriod = period;
    this.isLoadingChart = true;
    this.chartLoadError = '';
    const requestId = ++this.chartRequestId;

    this.dashboardService.getChart(period).subscribe({
      next: (chart) => {
        if (requestId !== this.chartRequestId) {
          return;
        }

        this.chartLabels = chart.labels;
        this.dataSets = [
          {
            label: 'Ingresos',
            data: chart.income,
            backgroundColor: ['rgb(8, 117, 4)'],
            borderRadius: 5,
          },
          {
            label: 'Gastos',
            data: chart.expenses,
            backgroundColor: ['rgb(197, 33, 24)'],
            borderRadius: 5,
          },
        ];
        this.isLoadingChart = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        if (requestId !== this.chartRequestId) {
          return;
        }

        this.chartLoadError = error instanceof Error
          ? error.message
          : 'No se pudo cargar el gráfico del dashboard.';
        this.isLoadingChart = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  formatComparison(comparison: MonthlyComparison): string {
    if (comparison.percentage === null) {
      return 'Nuevo';
    }

    const percentage = `${comparison.percentage}%`;
    if (comparison.direction === 'up') {
      return `Subió ${percentage}`;
    }
    if (comparison.direction === 'down') {
      return `Bajó ${percentage}`;
    }
    return 'Sin cambio';
  }

  getCategoryIconClass(icon: string): string {
    if (icon.startsWith('fa-')) {
      return icon;
    }

    return this.categoryIconClasses[icon.toLowerCase()] ?? 'fa-solid fa-tag';
  }
}
