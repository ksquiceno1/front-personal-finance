import { Component, input } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
    selector: 'app-chart-circle',
    imports: [CommonModule],
    templateUrl: './chart-circle.component.html',
    styleUrl: './chart-circle.component.scss',
})
export class ChartCircleComponent {
    public readonly percentage = input<number>(65);
    public readonly size = input<number>(200);
    public readonly strokeWidth = input<number>(8);

    get radius() {
        return (this.size() - this.strokeWidth()) / 2;
    }

    get circumference() {
        return 2 * Math.PI * this.radius;
    }

    get strokeDashoffset() {
        return this.circumference - (this.percentage() / 100) * this.circumference;
    }

    get center() {
        return this.size() / 2;
    }
}
