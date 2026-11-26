import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { Reports } from './reports';

const pdfMocks = vi.hoisted(() => ({
  addImage: vi.fn(),
  save: vi.fn(),
}));

vi.mock('jspdf', () => {
  class MockJsPDF {
    internal = { pageSize: { getWidth: () => 210, getHeight: () => 297 } };

    addImage(...args: unknown[]): this {
      pdfMocks.addImage(...args);
      return this;
    }

    addPage(): this { return this; }
    setFont(): this { return this; }
    setFontSize(): this { return this; }
    setTextColor(): this { return this; }
    text(): this { return this; }
    setPage(): this { return this; }
    splitTextToSize(text: string): string[] { return [text]; }
    getNumberOfPages(): number { return 1; }
    save(filename: string): this {
      pdfMocks.save(filename);
      return this;
    }
  }

  return { jsPDF: MockJsPDF };
});

describe('Reports', () => {
  let component: Reports;
  let fixture: ComponentFixture<Reports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reports],
    }).compileComponents();

    fixture = TestBed.createComponent(Reports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('scrolls to the export format options when requested', () => {
    fixture.detectChanges();
    const exportOptions = fixture.nativeElement.querySelector(
      '#report-export-options',
    ) as HTMLElement;
    const scrollIntoView = vi.fn();
    Object.defineProperty(exportOptions, 'scrollIntoView', { value: scrollIntoView });

    component.scrollToExportOptions();

    expect(scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'center',
    });
  });

  it('downloads a PDF for the selected date range with the report charts', () => {
    fixture.detectChanges();
    component.isLoadingBalance = false;
    component.isLoadingSummary = false;
    component.isLoadingExpensesByCategory = false;
    component.isLoadingComparativeChart = false;

    const canvasSpy = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/png;base64,test');

    component.downloadReportPdf(new Event('click'));

    expect(pdfMocks.save).toHaveBeenCalledWith(
      `reporte-${component.startDate}-${component.endDate}.pdf`,
    );
    expect(pdfMocks.addImage).toHaveBeenCalled();

    canvasSpy.mockRestore();
  });

  it('downloads an Excel workbook with report data and no embedded charts', async () => {
    component.isLoadingBalance = false;
    component.isLoadingSummary = false;
    component.isLoadingExpensesByCategory = false;
    component.isLoadingComparativeChart = false;
    component.reportBalance = {
      income: 1200,
      expenses: 500,
      saved: 700,
      finalBalance: 700,
      incomeComparison: { percentage: 5, direction: 'up' },
      expenseComparison: { percentage: -2, direction: 'down' },
      savedComparison: { percentage: 10, direction: 'up' },
      finalBalanceComparison: { percentage: 3, direction: 'up' },
    };
    component.reportSummary = {
      daysPeriod: 30,
      averageDailyExpense: 16.67,
      highestExpense: { description: 'Renta', amount: 300 },
      lowestExpense: { description: 'Bus', amount: 20 },
      highestExpenseCategory: { name: 'Hogar', percentage: 60 },
    };
    component.reportExpensesByCategory = {
      totalExpenses: 500,
      categories: [{ name: 'Hogar', amount: 300, percentage: 60 }],
    };
    let downloadedBlob: Blob | undefined;
    const createObjectURL = vi.fn((blob: Blob) => {
      downloadedBlob = blob;
      return 'blob:report';
    });
    const revokeObjectURL = vi.fn();
    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    await component.downloadReportExcel(new Event('click'));

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(downloadedBlob?.type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(anchorClickSpy).toHaveBeenCalledOnce();
    expect(component.excelExportError).toBe('');

    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await downloadedBlob!.arrayBuffer());
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      'Resumen',
      'Gastos por categoría',
      'Ingresos y gastos',
    ]);
    expect(workbook.getWorksheet('Gastos por categoría')?.getRow(5).getCell(1).value)
      .toBe('Hogar');
    expect(workbook.model.media).toHaveLength(0);

    vi.unstubAllGlobals();
    anchorClickSpy.mockRestore();
  });

  it('downloads the report data as UTF-8 CSV without attaching charts', async () => {
    component.isLoadingBalance = false;
    component.isLoadingSummary = false;
    component.isLoadingExpensesByCategory = false;
    component.isLoadingComparativeChart = false;
    component.reportExpensesByCategory = {
      totalExpenses: 100,
      categories: [{ name: '=SUM(1,1)', amount: 100, percentage: 100 }],
    };

    let downloadedBlob: Blob | undefined;
    const createObjectURL = vi.fn((blob: Blob) => {
      downloadedBlob = blob;
      return 'blob:report';
    });
    const revokeObjectURL = vi.fn();
    const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    component.downloadReportCsv(new Event('click'));

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(downloadedBlob?.type).toBe('text/csv;charset=utf-8');
    expect(anchorClickSpy).toHaveBeenCalledOnce();
    expect(component.csvExportError).toBe('');

    const bytes = new Uint8Array(await downloadedBlob!.arrayBuffer());
    expect(Array.from(bytes.slice(0, 3))).toEqual([0xEF, 0xBB, 0xBF]);
    const csv = new TextDecoder().decode(bytes);
    expect(csv).toContain('"Sección","Concepto","Valor","Detalle","Porcentaje","Ingresos","Gastos"');
    expect(csv).toContain(`"'=SUM(1,1)","100","","100","",""`);
    await new Promise<void>((resolve) => setTimeout(resolve, 1));
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:report');

    vi.unstubAllGlobals();
    anchorClickSpy.mockRestore();
  });
});
