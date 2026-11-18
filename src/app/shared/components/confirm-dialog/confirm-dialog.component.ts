import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirmar acción';
  @Input() message = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() errorMessage = '';
  @Input() isConfirming = false;
  @Output() readonly confirmed = new EventEmitter<void>();
  @Output() readonly cancelled = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }

  cancel(): void {
    if (!this.isConfirming) {
      this.cancelled.emit();
    }
  }
}
