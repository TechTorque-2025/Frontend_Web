// Time Logging TypeScript Interfaces

export interface TimeLogRequest {
  serviceId: string; // Required - changed from optional
  projectId?: string;
  hours: number;
  date: string; // YYYY-MM-DD
  description?: string;
  workType?: string;
}

export interface TimeLogUpdateRequest {
  hours?: number;
  date?: string;
  description?: string;
  workType?: string;
}

export interface TimeLogResponse {
  id: string; // Changed from logId to match backend
  employeeId: string;
  serviceId?: string;
  projectId?: string;
  hours: number;
  date: string;
  description?: string;
  workType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeLogSummaryItem {
  date: string;
  totalHours: number;
  serviceHours: number;
  projectHours: number;
  logCount: number;
}

export interface TimeLogSummaryResponse {
  employeeId: string;
  period: 'daily' | 'weekly';
  startDate: string;
  endDate: string;
  totalHours: number;
  totalServiceHours: number;
  totalProjectHours: number;
  totalLogs: number;
  dailyBreakdown: TimeLogSummaryItem[];
}
