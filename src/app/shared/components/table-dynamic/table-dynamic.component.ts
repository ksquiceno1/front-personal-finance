import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-table-dynamic',
  imports: [CommonModule],
  templateUrl: './table-dynamic.component.html',
  styleUrls: ['./table-dynamic.component.scss']
})
export class TableDynamicComponent {
  @Input() columns: { key: string; label: string; actions?: { key: string; label: string; class?: string }[] }[] = [];
  @Input() rows: any[] = [];

  @Output() action = new EventEmitter<{ action: string; row: any }>();

  trackByIndex(index: number, _item?: any) { return index; }

  onActionClick(actionKey: string, row: any) {
    this.action.emit({ action: actionKey, row });
  }
}
