import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Application, ApplicationStatus, AnalyticsSummary, ActivityLog } from '@app/models/application.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly API = environment.apiUrl + '/applications';

  constructor(private http: HttpClient) {}

  getAll(filters?: {
    status?: ApplicationStatus;
    tag?: string;
    search?: string;
    from?: string;
    to?: string;
  }): Observable<Application[]> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val) params = params.set(key, val);
      });
    }
    return this.http.get<Application[]>(this.API, { params });
  }

  getById(id: string): Observable<Application> {
    return this.http.get<Application>(`${this.API}/${id}`);
  }

  create(app: Partial<Application>): Observable<Application> {
    return this.http.post<Application>(this.API, app);
  }

  update(id: string, app: Partial<Application>): Observable<Application> {
    return this.http.put<Application>(`${this.API}/${id}`, app);
  }

  updateStatus(id: string, status: ApplicationStatus): Observable<Application> {
    return this.http.patch<Application>(`${this.API}/${id}/status`, { status });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  getTimeline(id: string): Observable<ActivityLog[]> {
    return this.http.get<ActivityLog[]>(`${this.API}/${id}/timeline`);
  }

  getAnalytics(): Observable<AnalyticsSummary> {
    return this.http.get<AnalyticsSummary>(`${environment.apiUrl}/analytics/summary`);
  }

  exportCsv(): void {
    this.http.get(`${this.API}/export/csv`, { responseType: 'blob' }).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'applications.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
