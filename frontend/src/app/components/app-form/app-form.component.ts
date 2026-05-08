import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Application, ApplicationStatus, KANBAN_STATUSES, STATUS_LABELS } from '@app/models/application.model';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ isEdit ? 'Edit Application' : 'New Application' }}</h2>
          <button class="btn-close" (click)="close.emit()">×</button>
        </div>

        <form (ngSubmit)="onSubmit()" class="form-body">
          <div class="form-row">
            <div class="field">
              <label>Company *</label>
              <input [(ngModel)]="form.company" name="company" placeholder="e.g. Google" required />
            </div>
            <div class="field">
              <label>Role *</label>
              <input [(ngModel)]="form.role" name="role" placeholder="e.g. Senior SWE" required />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Status</label>
              <select [(ngModel)]="form.status" name="status">
                <option *ngFor="let s of statuses" [value]="s">{{ statusLabels[s] }}</option>
              </select>
            </div>
            <div class="field">
              <label>Date Applied</label>
              <input type="date" [(ngModel)]="form.dateApplied" name="dateApplied" />
            </div>
          </div>

          <div class="form-row">
            <div class="field">
              <label>Location</label>
              <input [(ngModel)]="form.location" name="location" placeholder="e.g. Remote" />
            </div>
            <div class="field">
              <label>Salary Range</label>
              <input [(ngModel)]="form.salaryRange" name="salaryRange" placeholder="e.g. $150k-$200k" />
            </div>
          </div>

          <div class="field">
            <label>Job URL</label>
            <input [(ngModel)]="form.jobUrl" name="jobUrl" placeholder="https://..." />
          </div>

          <div class="field">
            <label>Tags (comma-separated)</label>
            <input [(ngModel)]="tagsInput" name="tags" placeholder="e.g. remote, java, startup" />
          </div>

          <div class="field">
            <label>Notes</label>
            <textarea [(ngModel)]="notesInput" name="notes" rows="3"
                      placeholder="Add any notes..."></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="close.emit()">Cancel</button>
            <button type="submit" class="btn-primary">{{ isEdit ? 'Save Changes' : 'Create' }}</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 200;
      padding: 1rem;
    }

    .modal {
      background: var(--bg-card);
      border-radius: 16px;
      width: 100%;
      max-width: 560px;
      max-height: 90vh;
      overflow-y: auto;
      border: 1px solid var(--border);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .modal-header h2 {
      font-size: 1.15rem;
      font-weight: 600;
      margin: 0;
      color: var(--text-primary);
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-tertiary);
      cursor: pointer;
    }

    .form-body { padding: 1.5rem; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .field {
      margin-bottom: 1rem;
    }

    .field label {
      display: block;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 0.35rem;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .field input, .field select, .field textarea {
      width: 100%;
      padding: 0.6rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 0.9rem;
      background: var(--bg-primary);
      color: var(--text-primary);
      font-family: inherit;
      box-sizing: border-box;
    }

    .field input:focus, .field select:focus, .field textarea:focus {
      outline: none;
      border-color: var(--accent);
    }

    .field textarea { resize: vertical; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 0.5rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
    }

    .btn-primary {
      background: var(--accent);
      color: #fff;
    }

    .btn-secondary {
      background: var(--bg-primary);
      color: var(--text-secondary);
      border: 1px solid var(--border);
    }
  `]
})
export class AppFormComponent implements OnInit {
  @Input() application: Application | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Partial<Application>>();

  statuses = KANBAN_STATUSES;
  statusLabels = STATUS_LABELS;

  form = {
    company: '',
    role: '',
    status: 'APPLIED' as ApplicationStatus,
    dateApplied: '',
    location: '',
    salaryRange: '',
    jobUrl: ''
  };

  tagsInput = '';
  notesInput = '';

  get isEdit(): boolean {
    return !!this.application;
  }

  ngOnInit() {
    if (this.application) {
      this.form = {
        company: this.application.company,
        role: this.application.role,
        status: this.application.status,
        dateApplied: this.application.dateApplied || '',
        location: this.application.location || '',
        salaryRange: this.application.salaryRange || '',
        jobUrl: this.application.jobUrl || ''
      };
      this.tagsInput = this.application.tags?.join(', ') || '';
      this.notesInput = this.application.notes?.join('\n') || '';
    } else {
      this.form.dateApplied = new Date().toISOString().split('T')[0];
    }
  }

  onSubmit() {
    const tags = this.tagsInput.split(',').map(t => t.trim()).filter(Boolean);
    const notes = this.notesInput.split('\n').map(n => n.trim()).filter(Boolean);

    this.save.emit({
      ...this.form,
      tags,
      notes,
      contacts: this.application?.contacts || []
    });
  }
}
