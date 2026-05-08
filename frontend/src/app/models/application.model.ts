export interface Application {
  id: string;
  company: string;
  role: string;
  jobUrl?: string;
  location?: string;
  salaryRange?: string;
  status: ApplicationStatus;
  dateApplied?: string;
  tags: string[];
  notes: string[];
  contacts: Contact[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  name: string;
  email?: string;
  role?: string;
  linkedinUrl?: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  applicationId: string;
  userId: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  action: string;
  timestamp: string;
}

export interface AnalyticsSummary {
  totalApplications: number;
  byStatus: Record<string, number>;
  responseRate: number;
  byWeek: Record<string, number>;
  byTag: Record<string, number>;
}

export interface AuthResponse {
  token: string;
  email: string;
  displayName: string;
}

export type ApplicationStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'PHONE_SCREEN'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  WISHLIST: 'Wishlist',
  APPLIED: 'Applied',
  PHONE_SCREEN: 'Phone Screen',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn'
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  WISHLIST: '#6B7280',
  APPLIED: '#3B82F6',
  PHONE_SCREEN: '#8B5CF6',
  INTERVIEW: '#F59E0B',
  OFFER: '#10B981',
  REJECTED: '#EF4444',
  WITHDRAWN: '#9CA3AF'
};

export const KANBAN_STATUSES: ApplicationStatus[] = [
  'WISHLIST', 'APPLIED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'
];
