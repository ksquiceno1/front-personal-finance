import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface TransactionFormValue {
  date: string;
  amount: number;
  description: string;
  category: string;
  type: 'expense' | 'income';
}

@Component({
  selector: 'app-form-transaction',
  imports: [FormsModule],
  templateUrl: './form-transaction.component.html',
  styleUrl: './form-transaction.component.scss',
})
export class FormTransactionComponent {
  @Output() readonly save = new EventEmitter<TransactionFormValue>();
  @Output() readonly closed = new EventEmitter<void>();

  transaction: TransactionFormValue = {
    date: this.getToday(),
    amount: 0,
    description: '',
    category: 'Hogar',
    type: 'expense',
  };

  get formattedDate(): string {
    const [year, month, day] = this.transaction.date.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  }

  onSubmit(): void {
    this.save.emit({ ...this.transaction });
  }

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
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
