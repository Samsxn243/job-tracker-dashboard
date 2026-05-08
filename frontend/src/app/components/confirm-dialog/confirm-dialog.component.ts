import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" (click)="cancel.emit()">
      <div class="dialog" (click)="$event.stopPropagation()">
        <h3>{{ title }}</h3>
        <p>{{ message }}</p>
        <div class="actions">
          <button class="btn-secondary" (click)="cancel.emit()">Cancel</button>
          <button class="btn-danger" (click)="confirm.emit()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: center; justify-content: center;
      z-index: 300;
    }
    .dialog {
      background: var(--bg-card); border-radius: 12px;
      padding: 1.5rem; max-width: 380px; width: 100%;
      border: 1px solid var(--border);
    }
    h3 { margin: 0 0 0.5rem; color: var(--text-primary); font-size: 1.05rem; }
    p { margin: 0 0 1.25rem; color: var(--text-secondary); font-size: 0.9rem; }
    .actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
    .btn-secondary, .btn-danger {
      padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.85rem;
      font-weight: 600; cursor: pointer; border: none;
    }
    .btn-secondary { background: var(--bg-primary); color: var(--text-secondary); border: 1px solid var(--border); }
    .btn-danger { background: var(--status-rejected); color: #fff; }
  `]
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirm Delete';
  @Input() message = 'Are you sure? This action cannot be undone.';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
