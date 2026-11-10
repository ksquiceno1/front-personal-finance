import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormTransactionComponent } from '../shared/components/form-transaction/form-transaction.component';

@Component({
  selector: 'app-categories',
  imports: [CommonModule, FormTransactionComponent],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  showMenu: boolean = false;
  showTransactionModal = false;

  closeTransactionModal(): void {
    this.showTransactionModal = false;
  }
}
