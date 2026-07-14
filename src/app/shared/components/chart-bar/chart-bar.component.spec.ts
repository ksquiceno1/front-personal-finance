import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartBarComponent } from './chart-bar.component';

describe('ChartBarComponent', () => {
  let component: ChartBarComponent;
  let fixture: ComponentFixture<ChartBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChartBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChartBarComponent);
    component = fixture.componentInstance;
  });

  it('should default to vertical orientation', () => {
    expect(component.orientation()).toBe('vertical');
  });

  it('should build a horizontal chart config when requested', () => {
    const config = component['buildChartConfig'](
      ['Ene', 'Feb'],
      [{ data: [10, 20], label: 'Gastos' }],
      'horizontal'
    );

    expect(config.type).toBe('bar');
    expect(config.options?.indexAxis).toBe('y');
  });
});
