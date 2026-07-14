import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ChartDoughnutComponent } from "./chart-doughnut.component";

describe("ChartDoughnutComponent", () => {
    let component: ChartDoughnutComponent;
    let fixture: ComponentFixture<ChartDoughnutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ChartDoughnutComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ChartDoughnutComponent);
        component = fixture.componentInstance;
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
