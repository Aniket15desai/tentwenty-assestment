// Timesheet model returned by API
export interface ApiTimesheet {
  _id: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  weekNumber: number;
  year: number;
  status: "COMPLETED" | "INCOMPLETE" | "MISSING";
  tasks: ApiTask[];
  totalHours: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiTask {
  _id?: string;
  taskName: string;
  projectName: string;
  workType: string;
  taskDescription: string;
  hours: number;
  date: string;
}

// Filters for fetching timesheets
export interface TimesheetFilters {
  page: number;
  limit: number;
  status?: string;
  dateRange?: string;
  sortField?: string;
  sortDirection?: "asc" | "desc";
}

// Pagination metadata from API
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// Local table-ready data
export interface TimesheetData {
  id: string;
  week: number;
  dateRange: string;
  status: "COMPLETED" | "INCOMPLETE" | "MISSING";
  action: string;
  year: number;
  weekStartDate: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Sorting types
export type SortField = "week" | "date" | "status";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}
