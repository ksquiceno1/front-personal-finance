import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { fromReadableStreamLike } from 'rxjs/internal/observable/innerFrom';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  date: string = new Date().toISOString().split('T')[0];

  get formattedDate(): string {
    const date = new Date(this.date);
    const day = date.getDate();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${day} ${months[date.getMonth()]}`;
  }

  showMenu: boolean = false;
}
