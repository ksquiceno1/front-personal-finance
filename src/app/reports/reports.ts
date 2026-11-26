import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartDataset } from 'chart.js';
import { jsPDF } from 'jspdf';
import { ChartLineComponent } from '../shared/components/chart-line/chart-line.component';
import { ChartDoughnutComponent } from '../shared/components/chart-doughnut/chart-doughnut.component';
import { ChartBarComponent } from "../shared/components/chart-bar/chart-bar.component";
import {
  ReportBalance,
  ReportComparison,
  ReportExpensesByCategory,
  ReportSummaryPeriod,
  ComparativeChartPeriod,
  ReportsService,
} from '../shared/services/reports.service';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, ChartLineComponent, ChartDoughnutComponent, FormsModule, ReactiveFormsModule, ChartBarComponent],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports implements OnInit {
  private readonly reportsService = inject(ReportsService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  @ViewChild('reportContent') private reportContent!: ElementRef<HTMLElement>;
  @ViewChild('exportOptions') private exportOptions!: ElementRef<HTMLElement>;

  reportBalance: ReportBalance | null = null;
  isLoadingBalance = true;
  balanceLoadError = '';
  reportSummary: ReportSummaryPeriod | null = null;
  isLoadingSummary = true;
  summaryLoadError = '';
  reportExpensesByCategory: ReportExpensesByCategory | null = null;
  expenseCategoryChartLabels: string[] = [];
  expenseCategoryChartData: ChartDataset[] = [];
  isLoadingExpensesByCategory = true;
  expensesByCategoryLoadError = '';
  comparativeChartPeriod: ComparativeChartPeriod = 'months';
  comparativeChartLabels: string[] = [];
  comparativeChartData: ChartDataset[] = [];
  isLoadingComparativeChart = true;
  comparativeChartLoadError = '';
  isExportingCsv = false;
  csvExportError = '';
  isExportingExcel = false;
  excelExportError = '';
  isExportingPdf = false;
  pdfExportError = '';

  // Chart data for the bar chart
  incomeData: number[] = [1500000, 1200000, 1800000];
  expensesData: number[] = [80000, 480000, 400000];
  dataSets: ChartDataset[] = [
    {
      label: 'Ingresos', data: this.incomeData,
      borderColor: [
        'rgb(8, 117, 4)',
      ],
      backgroundColor: [
        'rgb(8, 117, 4)',
      ],
    },
    {
      label: 'Gastos', data: this.expensesData,
      borderColor: ['rgb(197, 33, 24)'],
      backgroundColor: ['rgb(197, 33, 24)'],
    }
  ];
  chartLabels: string[] = ['Abril', 'Mayo', 'Junio'];
  readonly expenseCategoryColors = [
    'rgb(8, 117, 4)',
    'rgb(197, 33, 24)',
    'rgb(54, 162, 235)',
    'rgb(255, 159, 64)',
    'rgb(153, 102, 255)',
    'rgb(255, 205, 86)',
  ];
  private expensesByCategoryRequestId = 0;

  startDate: string = this.getDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  endDate: string = this.getDateInputValue(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0));

  get formattedDateRangeStart(): string {
    return `${this.formatDate(this.startDate)}`;
  }

  get formattedDateRangeEnd(): string {
    return `${this.formatDate(this.endDate)}`;
  }

  select: string = 'Mensual';

  private getDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    console.log(`${year}-${month}-${day}`);
    return `${year}-${month}-${day}`;
  }

  private formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    return new Intl.DateTimeFormat('en', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  onStartDateChange() {
    this.startDate = this.getMonthStartValue(this.startDate);
    if (this.endDate && this.startDate > this.endDate) {
      this.endDate = this.getMonthEndValue(this.startDate);
    }
    this.loadBalance();
  }

  onEndDateChange() {
    this.endDate = this.getMonthEndValue(this.endDate);
    if (this.startDate && this.endDate < this.startDate) {
      this.startDate = this.getMonthStartValue(this.endDate);
    }
    this.loadBalance();
  }

  scrollToExportOptions(): void {
    this.exportOptions.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  private getMonthStartValue(value: string): string {
    const [year, month] = value.split('-').map(Number);
    if (!year || !month) {
      return value;
    }
    return this.getDateInputValue(new Date(year, month - 1, 1));
  }

  private getMonthEndValue(value: string): string {
    const [year, month] = value.split('-').map(Number);
    if (!year || !month) {
      return value;
    }
    return this.getDateInputValue(new Date(year, month, 0));
  }

  ngOnInit(): void {
    this.loadBalance();
    this.loadComparativeChart();
  }

  onComparativeChartPeriodChange(): void {
    this.loadComparativeChart();
  }

  loadComparativeChart(): void {
    this.isLoadingComparativeChart = true;
    this.comparativeChartLoadError = '';
    this.reportsService.getComparativeChart(this.comparativeChartPeriod).subscribe({
      next: (chart) => {
        this.comparativeChartLabels = chart.labels;
        this.comparativeChartData = [
          {
            label: 'Ingresos',
            data: chart.income,
            borderColor: 'rgb(8, 117, 4)',
            backgroundColor: 'rgb(8, 117, 4)',
          },
          {
            label: 'Gastos',
            data: chart.expenses,
            borderColor: 'rgb(197, 33, 24)',
            backgroundColor: 'rgb(197, 33, 24)',
          },
        ];
        this.isLoadingComparativeChart = false;
        this.changeDetector.markForCheck();
      },
      error: (error: Error) => {
        this.comparativeChartLoadError = error.message;
        this.isLoadingComparativeChart = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  loadBalance(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }

    this.isLoadingBalance = true;
    this.balanceLoadError = '';
    this.reportsService.getBalance(this.startDate, this.endDate).subscribe({
      next: (balance) => {
        this.reportBalance = balance;
        this.isLoadingBalance = false;
        this.changeDetector.markForCheck();
      },
      error: (error: Error) => {
        this.balanceLoadError = error.message;
        this.isLoadingBalance = false;
        this.changeDetector.markForCheck();
      },
    });

    this.loadSummaryPeriod();
    this.loadExpensesByCategory();
  }

  loadSummaryPeriod(): void {
    this.isLoadingSummary = true;
    this.summaryLoadError = '';
    this.reportsService.getSummaryPeriod(this.startDate, this.endDate).subscribe({
      next: (summary) => {
        this.reportSummary = summary;
        this.isLoadingSummary = false;
        this.changeDetector.markForCheck();
      },
      error: (error: Error) => {
        this.summaryLoadError = error.message;
        this.isLoadingSummary = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  loadExpensesByCategory(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }

    const requestId = ++this.expensesByCategoryRequestId;
    this.isLoadingExpensesByCategory = true;
    this.expensesByCategoryLoadError = '';
    this.reportExpensesByCategory = null;
    this.expenseCategoryChartLabels = [];
    this.expenseCategoryChartData = [];
    this.reportsService.getExpensesByCategory(this.startDate, this.endDate).subscribe({
      next: (report) => {
        if (requestId !== this.expensesByCategoryRequestId) {
          return;
        }

        this.reportExpensesByCategory = report;
        this.expenseCategoryChartLabels = report.categories.map((category) => category.name);
        this.expenseCategoryChartData = [{
          label: 'Gastos',
          data: report.categories.map((category) => category.amount),
          backgroundColor: report.categories.map((_, index) =>
            this.getExpenseCategoryColor(index),
          ),
          borderColor: report.categories.map((_, index) =>
            this.getExpenseCategoryColor(index),
          ),
        }];
        this.isLoadingExpensesByCategory = false;
        this.changeDetector.markForCheck();
      },
      error: (error: Error) => {
        if (requestId !== this.expensesByCategoryRequestId) {
          return;
        }

        this.expensesByCategoryLoadError = error.message;
        this.isLoadingExpensesByCategory = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  getExpenseCategoryColor(index: number): string {
    return this.expenseCategoryColors[index % this.expenseCategoryColors.length];
  }

  formatAmount(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(value);
  }

  formatHighestExpense(): string {
    if (this.isLoadingSummary) {
      return 'Cargando...';
    }
    const expense = this.reportSummary?.highestExpense;
    if (!expense) {
      return 'Sin gastos';
    }
    return `${expense.description || 'Sin descripción'} - ${this.formatAmount(expense.amount)}`;
  }

  formatLowestExpense(): string {
    if (this.isLoadingSummary) {
      return 'Cargando...';
    }
    const expense = this.reportSummary?.lowestExpense;
    if (!expense) {
      return 'Sin gastos';
    }
    return `${expense.description || 'Sin descripción'} - ${this.formatAmount(expense.amount)}`;
  }

  formatHighestExpenseCategory(): string {
    if (this.isLoadingSummary) {
      return 'Cargando...';
    }
    const category = this.reportSummary?.highestExpenseCategory;
    if (!category) {
      return 'Sin gastos';
    }
    return `${category.name} (${category.percentage}%)`;
  }

  formatComparison(comparison: ReportComparison | undefined): string {
    if (!comparison) {
      return '0%';
    }
    if (comparison.percentage === null) {
      return 'Nuevo';
    }
    if (comparison.percentage > 0) {
      return `+${comparison.percentage}%`;
    }
    if (comparison.percentage < 0) {
      return `${comparison.percentage}%`;
    }
    return '0%';
  }

  comparisonClass(comparison: ReportComparison | undefined): string {
    if (!comparison || comparison.percentage === null) {
      return 'comparison-neutral';
    }
    if (comparison.percentage > 0) {
      return 'comparison-positive';
    }
    if (comparison.percentage < 0) {
      return 'comparison-negative';
    }
    return 'comparison-neutral';
  }

  comparisonIcon(comparison: ReportComparison | undefined): string {
    if (!comparison || comparison.percentage === null) {
      return 'fa-arrow-trend-up';
    }
    if (comparison.direction === 'up') {
      return 'fa-arrow-trend-up';
    }
    if (comparison.direction === 'down') {
      return 'fa-arrow-trend-down';
    }
    return 'fa-minus';
  }

  downloadReportCsv(event: Event): void {
    event.preventDefault();
    if (
      this.isExportingCsv
      || this.isLoadingBalance
      || this.isLoadingSummary
      || this.isLoadingExpensesByCategory
      || this.isLoadingComparativeChart
    ) {
      return;
    }

    this.isExportingCsv = true;
    this.csvExportError = '';

    try {
      const rows: (string | number)[][] = [
        ['Sección', 'Concepto', 'Valor', 'Detalle', 'Porcentaje', 'Ingresos', 'Gastos'],
        ['Periodo', 'Rango', `${this.startDate} a ${this.endDate}`, '', '', '', ''],
        [
          'Resumen financiero',
          'Ingresos totales',
          this.reportBalance?.income ?? 0,
          `Comparación: ${this.formatComparison(this.reportBalance?.incomeComparison)}`,
          '',
          '',
          '',
        ],
        [
          'Resumen financiero',
          'Gastos totales',
          this.reportBalance?.expenses ?? 0,
          `Comparación: ${this.formatComparison(this.reportBalance?.expenseComparison)}`,
          '',
          '',
          '',
        ],
        [
          'Resumen financiero',
          'Ahorros',
          this.reportBalance?.saved ?? 0,
          `Comparación: ${this.formatComparison(this.reportBalance?.savedComparison)}`,
          '',
          '',
          '',
        ],
        [
          'Resumen financiero',
          'Saldo final',
          this.reportBalance?.finalBalance ?? 0,
          `Comparación: ${this.formatComparison(this.reportBalance?.finalBalanceComparison)}`,
          '',
          '',
          '',
        ],
        ['Resumen del periodo', 'Días del periodo', this.reportSummary?.daysPeriod ?? 0, '', '', '', ''],
        [
          'Resumen del periodo',
          'Promedio diario de gastos',
          this.reportSummary?.averageDailyExpense ?? 0,
          '',
          '',
          '',
          '',
        ],
        [
          'Resumen del periodo',
          'Mayor gasto',
          this.reportSummary?.highestExpense?.amount ?? 0,
          this.reportSummary?.highestExpense?.description || 'Sin gastos',
          '',
          '',
          '',
        ],
        [
          'Resumen del periodo',
          'Menor gasto',
          this.reportSummary?.lowestExpense?.amount ?? 0,
          this.reportSummary?.lowestExpense?.description || 'Sin gastos',
          '',
          '',
          '',
        ],
        [
          'Resumen del periodo',
          'Categoría con mayor gasto',
          this.reportSummary?.highestExpenseCategory?.percentage ?? 0,
          this.reportSummary?.highestExpenseCategory?.name || 'Sin gastos',
          '%',
          '',
          '',
        ],
        [
          'Gastos por categoría',
          'Total de gastos',
          this.reportExpensesByCategory?.totalExpenses ?? 0,
          '',
          '',
          '',
          '',
        ],
        ...((this.reportExpensesByCategory?.categories ?? []).map((category) => [
          'Gastos por categoría',
          category.name,
          category.amount,
          '',
          category.percentage,
          '',
          '',
        ])),
        ...this.comparativeChartLabels.map((label, index) => [
          'Ingresos y gastos',
          label,
          '',
          '',
          '',
          this.getComparativeChartValue(0, index),
          this.getComparativeChartValue(1, index),
        ]),
      ];
      const csv = rows
        .map((row) => row.map((cell) => this.escapeCsvCell(cell)).join(','))
        .join('\r\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = objectUrl;
      downloadLink.download = `reporte-${this.startDate}-${this.endDate}.csv`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    } catch (error: unknown) {
      this.csvExportError = error instanceof Error
        ? `No se pudo generar el archivo CSV: ${error.message}`
        : 'No se pudo generar el archivo CSV.';
    } finally {
      this.isExportingCsv = false;
      this.changeDetector.markForCheck();
    }
  }

  private escapeCsvCell(value: string | number): string {
    const text = String(value);
    const safeText = typeof value === 'string' && /^[\s]*[=+\-@]/.test(text)
      ? `'${text}`
      : text;
    return `"${safeText.replace(/"/g, '""')}"`;
  }

  private getComparativeChartValue(datasetIndex: number, dataIndex: number): number {
    const value = this.comparativeChartData[datasetIndex]?.data[dataIndex];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      throw new Error('Los datos comparativos no tienen un formato válido.');
    }
    return value;
  }

  async downloadReportExcel(event: Event): Promise<void> {
    event.preventDefault();
    if (
      this.isExportingExcel
      || this.isLoadingBalance
      || this.isLoadingSummary
      || this.isLoadingExpensesByCategory
      || this.isLoadingComparativeChart
    ) {
      return;
    }

    this.isExportingExcel = true;
    this.excelExportError = '';

    try {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Personal Finance';
      workbook.created = new Date();

      const summarySheet = workbook.addWorksheet('Resumen');
      summarySheet.columns = [
        { key: 'indicator', width: 34 },
        { key: 'value', width: 24 },
        { key: 'comparison', width: 32 },
      ];
      summarySheet.addRow(['Reporte financiero']);
      summarySheet.addRow(['Periodo', `${this.startDate} a ${this.endDate}`]);
      summarySheet.addRow([]);
      summarySheet.addRow(['Indicador', 'Valor', 'Comparación vs. mes anterior']);
      summarySheet.addRows([
        ['Ingresos totales', this.reportBalance?.income ?? 0, this.formatComparison(this.reportBalance?.incomeComparison)],
        ['Gastos totales', this.reportBalance?.expenses ?? 0, this.formatComparison(this.reportBalance?.expenseComparison)],
        ['Ahorros', this.reportBalance?.saved ?? 0, this.formatComparison(this.reportBalance?.savedComparison)],
        ['Saldo final', this.reportBalance?.finalBalance ?? 0, this.formatComparison(this.reportBalance?.finalBalanceComparison)],
      ]);
      summarySheet.addRow([]);
      summarySheet.addRow(['Resumen del periodo', 'Valor']);
      summarySheet.addRows([
        ['Días del periodo', this.reportSummary?.daysPeriod ?? 0],
        ['Promedio diario de gastos', this.reportSummary?.averageDailyExpense ?? 0],
        [
          'Mayor gasto',
          this.reportSummary?.highestExpense?.amount ?? 0,
          this.reportSummary?.highestExpense?.description || 'Sin gastos',
        ],
        [
          'Menor gasto',
          this.reportSummary?.lowestExpense?.amount ?? 0,
          this.reportSummary?.lowestExpense?.description || 'Sin gastos',
        ],
        [
          'Categoría con mayor gasto',
          this.reportSummary?.highestExpenseCategory?.percentage ?? 0,
          this.reportSummary?.highestExpenseCategory?.name || 'Sin gastos',
        ],
      ]);
      summarySheet.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF1F5834' } };
      summarySheet.getRow(4).font = { bold: true };
      summarySheet.getRow(10).font = { bold: true };
      summarySheet.getColumn(2).numFmt = '"COP" #,##0.00;[Red]-"COP" #,##0.00';
      summarySheet.getColumn(2).alignment = { horizontal: 'left' };
      summarySheet.views = [{ state: 'frozen', ySplit: 4 }];

      const categoriesSheet = workbook.addWorksheet('Gastos por categoría');
      categoriesSheet.columns = [
        { key: 'category', width: 34 },
        { key: 'amount', width: 22 },
        { key: 'percentage', width: 18 },
      ];
      categoriesSheet.addRow(['Gastos por categoría']);
      categoriesSheet.addRow(['Periodo', `${this.startDate} a ${this.endDate}`]);
      categoriesSheet.addRow(['Total de gastos', this.reportExpensesByCategory?.totalExpenses ?? 0]);
      categoriesSheet.addRow(['Categoría', 'Monto (COP)', 'Porcentaje']);
      for (const category of this.reportExpensesByCategory?.categories ?? []) {
        categoriesSheet.addRow([
          category.name,
          category.amount,
          category.percentage / 100,
        ]);
      }
      categoriesSheet.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF1F5834' } };
      categoriesSheet.getRow(4).font = { bold: true };
      categoriesSheet.getColumn(2).numFmt = '"COP" #,##0.00;[Red]-"COP" #,##0.00';
      categoriesSheet.getColumn(3).numFmt = '0.00%';
      categoriesSheet.autoFilter = 'A4:C4';
      categoriesSheet.views = [{ state: 'frozen', ySplit: 4 }];

      const comparisonSheet = workbook.addWorksheet('Ingresos y gastos');
      comparisonSheet.columns = [
        { key: 'period', width: 22 },
        { key: 'income', width: 22 },
        { key: 'expenses', width: 22 },
      ];
      comparisonSheet.addRow(['Ingresos y gastos']);
      comparisonSheet.addRow(['Periodo del reporte', `${this.startDate} a ${this.endDate}`]);
      comparisonSheet.addRow([]);
      comparisonSheet.addRow(['Periodo', 'Ingresos (COP)', 'Gastos (COP)']);
      this.comparativeChartLabels.forEach((label, index) => {
        comparisonSheet.addRow([
          label,
          this.comparativeChartData[0]?.data[index] ?? 0,
          this.comparativeChartData[1]?.data[index] ?? 0,
        ]);
      });
      comparisonSheet.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF1F5834' } };
      comparisonSheet.getRow(4).font = { bold: true };
      comparisonSheet.getColumn(2).numFmt = '"COP" #,##0.00;[Red]-"COP" #,##0.00';
      comparisonSheet.getColumn(3).numFmt = '"COP" #,##0.00;[Red]-"COP" #,##0.00';
      comparisonSheet.autoFilter = `A4:C${Math.max(4, comparisonSheet.rowCount)}`;
      comparisonSheet.views = [{ state: 'frozen', ySplit: 4 }];

      const workbookData = await workbook.xlsx.writeBuffer();
      const blob = new Blob([new Uint8Array(workbookData)], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = objectUrl;
      downloadLink.download = `reporte-${this.startDate}-${this.endDate}.xlsx`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    } catch (error: unknown) {
      this.excelExportError = error instanceof Error
        ? `No se pudo generar el archivo Excel: ${error.message}`
        : 'No se pudo generar el archivo Excel.';
    } finally {
      this.isExportingExcel = false;
      this.changeDetector.markForCheck();
    }
  }

  downloadReportPdf(event: Event): void {
    event.preventDefault();
    if (
      this.isExportingPdf
      || this.isLoadingBalance
      || this.isLoadingSummary
      || this.isLoadingExpensesByCategory
      || this.isLoadingComparativeChart
    ) {
      return;
    }

    this.isExportingPdf = true;
    this.pdfExportError = '';

    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const ensureSpace = (height: number): void => {
        if (y + height > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      };

      const addSectionTitle = (title: string): void => {
        ensureSpace(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(31, 88, 52);
        pdf.text(title, margin, y);
        y += 8;
      };

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(31, 88, 52);
      pdf.text('Reporte financiero', margin, y + 6);
      y += 13;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Periodo: ${this.startDate} a ${this.endDate}`, margin, y + 2);
      y += 11;

      addSectionTitle('Resumen financiero');
      const metrics = [
        ['Ingresos totales', this.formatAmount(this.reportBalance?.income ?? 0), this.formatComparison(this.reportBalance?.incomeComparison)],
        ['Gastos totales', this.formatAmount(this.reportBalance?.expenses ?? 0), this.formatComparison(this.reportBalance?.expenseComparison)],
        ['Ahorros', this.formatAmount(this.reportBalance?.saved ?? 0), this.formatComparison(this.reportBalance?.savedComparison)],
        ['Saldo final', this.formatAmount(this.reportBalance?.finalBalance ?? 0), this.formatComparison(this.reportBalance?.finalBalanceComparison)],
      ];
      const metricWidth = contentWidth / 2;
      metrics.forEach(([label, amount, comparison], index) => {
        const row = Math.floor(index / 2);
        const column = index % 2;
        const metricY = y + row * 19;
        const metricX = margin + column * metricWidth;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(90, 90, 90);
        pdf.text(label, metricX, metricY);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(35, 35, 35);
        pdf.text(amount, metricX, metricY + 6);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(110, 110, 110);
        pdf.text(`${comparison} vs. Mes anterior`, metricX, metricY + 11);
      });
      y += 42;

      addSectionTitle('Resumen del periodo');
      const summaryLines = [
        `Duración: ${this.reportSummary?.daysPeriod ?? 0} días`,
        `Promedio diario de gastos: ${this.formatAmount(this.reportSummary?.averageDailyExpense ?? 0)}`,
        `Mayor gasto: ${this.formatHighestExpense()}`,
        `Menor gasto: ${this.formatLowestExpense()}`,
        `Categoría con mayor gasto: ${this.formatHighestExpenseCategory()}`,
      ];
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(45, 45, 45);
      for (const line of summaryLines) {
        ensureSpace(7);
        pdf.text(line, margin, y);
        y += 6;
      }
      y += 3;

      const insights = Array.from(
        this.reportContent.nativeElement.querySelectorAll(
          '.section-2 .card:nth-child(2) .item-r p',
        ),
      )
        .map((paragraph) => paragraph.textContent?.replace(/\s+/g, ' ').trim() ?? '')
        .filter((text) => text.length > 0);
      if (insights.length > 0) {
        addSectionTitle('Insights y recomendaciones');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(45, 45, 45);
        for (const insight of insights) {
          const lines = pdf.splitTextToSize(insight, contentWidth);
          const lineHeight = 5;
          ensureSpace(lines.length * lineHeight);
          pdf.text(lines, margin, y);
          y += lines.length * lineHeight + 2;
        }
      }

      addSectionTitle('Gastos por categoría');
      const categories = this.reportExpensesByCategory?.categories ?? [];
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(45, 45, 45);
      pdf.text(
        `Total de gastos: ${this.formatAmount(this.reportExpensesByCategory?.totalExpenses ?? 0)}`,
        margin,
        y,
      );
      y += 7;
      if (categories.length === 0) {
        pdf.text('No hay gastos por categoría en este periodo.', margin, y);
        y += 7;
      } else {
        for (const category of categories) {
          ensureSpace(7);
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(9);
          pdf.setTextColor(45, 45, 45);
          pdf.text(category.name, margin, y);
          pdf.text(this.formatAmount(category.amount), margin + contentWidth * 0.62, y);
          pdf.text(`${category.percentage}%`, margin + contentWidth * 0.88, y);
          y += 6;
        }
      }

      const canvases = this.reportContent.nativeElement.querySelectorAll('canvas');
      for (const [index, canvas] of Array.from(canvases).entries()) {
        const chartTitle = canvas.closest('.card')?.querySelector('h3')?.textContent?.trim()
          || `Gráfica ${index + 1}`;
        const aspectRatio = canvas.width / canvas.height;
        if (!aspectRatio || !canvas.width || !canvas.height) {
          continue;
        }

        const imageHeight = Math.min(95, contentWidth / aspectRatio);
        const imageWidth = imageHeight * aspectRatio;
        ensureSpace(imageHeight + 13);
        y += 4;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(31, 88, 52);
        pdf.text(chartTitle, margin, y);
        y += 5;
        const imageData = canvas.toDataURL('image/png');
        pdf.addImage(
          imageData,
          'PNG',
          margin + (contentWidth - imageWidth) / 2,
          y,
          imageWidth,
          imageHeight,
        );
        y += imageHeight + 5;
      }

      const totalPages = pdf.getNumberOfPages();
      for (let page = 1; page <= totalPages; page++) {
        pdf.setPage(page);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(
          `Página ${page} de ${totalPages}`,
          pageWidth - margin,
          pageHeight - 7,
          { align: 'right' },
        );
      }

      pdf.save(`reporte-${this.startDate}-${this.endDate}.pdf`);
    } catch (error: unknown) {
      this.pdfExportError = error instanceof Error
        ? `No se pudo generar el PDF: ${error.message}`
        : 'No se pudo generar el PDF.';
    } finally {
      this.isExportingPdf = false;
      this.changeDetector.markForCheck();
    }
  }
}
