import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ReportExpensesByCategory, ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.setItem('personal-finance-access-token', 'test-token');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReportsService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.removeItem('personal-finance-access-token');
  });

  it('loads and maps expenses grouped by category for the selected date range', () => {
    let result: ReportExpensesByCategory | undefined;
    service.getExpensesByCategory('2026-04-01', '2026-04-30').subscribe((response) => {
      result = response;
    });

    const request = httpTestingController.expectOne(
      'http://localhost:8000/reports/expenses-by-category/?start_date=2026-04-01&end_date=2026-04-30',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({
      total_expenses: '100.00',
      categories: [
        { name: 'Comida', amount: '60.00', percentage: '60.00' },
        { name: 'Transporte', amount: '40.00', percentage: '40.00' },
      ],
    });

    expect(result).toEqual({
      totalExpenses: 100,
      categories: [
        { name: 'Comida', amount: 60, percentage: 60 },
        { name: 'Transporte', amount: 40, percentage: 40 },
      ],
    });
  });
});
