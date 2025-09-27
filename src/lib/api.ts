import { ApiError, ApiTask, ApiTimesheet } from "../types";

// API utility functions for timesheet operations
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new ApiError(response.status, errorData.error || "Request failed");
  }

  return response.json();
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export interface TimesheetFilters {
  page?: number;
  limit?: number;
  status?: string;
  year?: number;
  month?: number;
  dateRange?: string;
  sortField?: "week" | "date" | "status";
  sortDirection?: "asc" | "desc";
}

export interface TimesheetResponse {
  timesheets: ApiTimesheet[];
  pagination: PaginationInfo;
}

export const timesheetApi = {
  // Get all timesheets for the current user with pagination and filtering
  async getTimesheets(filters?: TimesheetFilters): Promise<TimesheetResponse> {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.status) params.append("status", filters.status);
      if (filters.year) params.append("year", filters.year.toString());
      if (filters.month) params.append("month", filters.month.toString());
      if (filters.dateRange) params.append("dateRange", filters.dateRange);
      if (filters.sortField) params.append("sortField", filters.sortField);
      if (filters.sortDirection)
        params.append("sortDirection", filters.sortDirection);
    }

    const url = params.toString()
      ? `/api/timesheets?${params.toString()}`
      : "/api/timesheets";
    const data = await fetchWithAuth(url);
    return {
      timesheets: data.timesheets,
      pagination: data.pagination,
    };
  },

  // Dummy sample data
  async dummySampleData(): Promise<{ message: string; count: number }> {
    const data = await fetchWithAuth('/api/feed-data', { method: 'POST' })
    return data
  },

  // Get a specific timesheet by ID
  async getTimesheet(id: string): Promise<ApiTimesheet> {
    const data = await fetchWithAuth(`/api/timesheets/${id}`);
    return data.timesheet;
  },

  // Create a new timesheet
  async createTimesheet(timesheetData: {
    weekStartDate: string;
    weekEndDate: string;
    weekNumber: number;
    year: number;
  }): Promise<ApiTimesheet> {
    const data = await fetchWithAuth("/api/timesheets", {
      method: "POST",
      body: JSON.stringify(timesheetData),
    });
    return data.timesheet;
  },

  // Update timesheet tasks
  async updateTimesheet(id: string, tasks: ApiTask[]): Promise<ApiTimesheet> {
    const data = await fetchWithAuth(`/api/timesheets/${id}`, {
      method: "PUT",
      body: JSON.stringify({ tasks }),
    });
    return data.timesheet;
  },

  // Add a task to a timesheet
  async addTask(
    timesheetId: string,
    task: Omit<ApiTask, "_id">
  ): Promise<ApiTimesheet> {
    const data = await fetchWithAuth(`/api/timesheets/${timesheetId}/tasks`, {
      method: "POST",
      body: JSON.stringify(task),
    });
    return data.timesheet;
  },

  // Update a specific task
  async updateTask(
    timesheetId: string,
    taskId: string,
    task: Omit<ApiTask, "_id">
  ): Promise<ApiTimesheet> {
    const data = await fetchWithAuth(
      `/api/timesheets/${timesheetId}/tasks/${taskId}`,
      {
        method: "PUT",
        body: JSON.stringify(task),
      }
    );
    return data.timesheet;
  },

  // Delete a specific task
  async deleteTask(timesheetId: string, taskId: string): Promise<ApiTimesheet> {
    const data = await fetchWithAuth(
      `/api/timesheets/${timesheetId}/tasks/${taskId}`,
      {
        method: "DELETE",
      }
    );
    return data.timesheet;
  },

  // Delete a timesheet
  async deleteTimesheet(id: string): Promise<void> {
    await fetchWithAuth(`/api/timesheets/${id}`, {
      method: "DELETE",
    });
  },
};

// Utility functions for date handling
export const dateUtils = {
  getWeekNumber(date: Date): number {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  },

  getWeekRange(
    year: number,
    weekNumber: number
  ): { start: string; end: string } {
    const simple = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4) {
      ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
      ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }
    const ISOweekEnd = new Date(ISOweekStart);
    ISOweekEnd.setDate(ISOweekStart.getDate() + 6);

    return {
      start: ISOweekStart.toISOString().split("T")[0],
      end: ISOweekEnd.toISOString().split("T")[0],
    };
  },

  formatDateRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startStr = start.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    });
    const endStr = end.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return `${startStr} - ${endStr}`;
  },
};

export { ApiError };
