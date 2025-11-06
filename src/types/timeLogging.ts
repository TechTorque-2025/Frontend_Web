// Time Logging TypeScript Interfaces

export interface TimeLogRequest {
  serviceId?: string;
  projectId?: string;
  hoursWorked: number;
  workDate: string; // YYYY-MM-DD
  description?: string;
  taskType?: string;
}

export interface TimeLogUpdateRequest {
  hoursWorked?: number;
  workDate?: string;
  description?: string;
  taskType?: string;
}

export interface TimeLogResponse {
  logId: string;
  employeeId: string;
  serviceId?: string;
  projectId?: string;
  hoursWorked: number;
  workDate: string;
  description?: string;
  taskType?: string;
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
