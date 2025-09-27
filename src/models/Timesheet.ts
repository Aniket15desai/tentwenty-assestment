import mongoose from "mongoose";

export interface ITask {
  _id?: string;
  taskName: string;
  projectName: string;
  workType: string;
  taskDescription: string;
  hours: number;
  date: string;
}

export interface ITimesheet {
  _id?: string;
  userId: string;
  weekStartDate: string;
  weekEndDate: string;
  weekNumber: number;
  year: number;
  status: "COMPLETED" | "INCOMPLETE" | "MISSING";
  tasks: ITask[];
  totalHours: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TaskSchema = new mongoose.Schema<ITask>({
  taskName: {
    type: String,
    required: [true, "Please provide a task name"],
    maxlength: [200, "Task name cannot be more than 200 characters"],
  },
  projectName: {
    type: String,
    required: [true, "Please provide a project name"],
    maxlength: [100, "Project name cannot be more than 100 characters"],
  },
  workType: {
    type: String,
    required: [true, "Please provide a work type"],
    enum: [
      "Development",
      "Bug Fix",
      "Design",
      "Testing & QA",
      "Documentation",
      "Research",
      "Client Meeting",
      "Code Review",
      "API Integration"
    ],
  },
  taskDescription: {
    type: String,
    required: [true, "Please provide a task description"],
    maxlength: [1000, "Task description cannot be more than 1000 characters"],
  },
  hours: {
    type: Number,
    required: [true, "Please provide hours"],
    min: [0, "Hours cannot be negative"],
    max: [24, "Hours cannot exceed 24 per day"],
  },
  date: {
    type: String,
    required: [true, "Please provide a date"],
  },
});

const TimesheetSchema = new mongoose.Schema<ITimesheet>(
  {
    userId: {
      type: String,
      required: [true, "Please provide a user ID"],
    },
    weekStartDate: {
      type: String,
      required: [true, "Please provide a week start date"],
    },
    weekEndDate: {
      type: String,
      required: [true, "Please provide a week end date"],
    },
    weekNumber: {
      type: Number,
      required: [true, "Please provide a week number"],
      min: [1, "Week number must be between 1 and 53"],
      max: [53, "Week number must be between 1 and 53"],
    },
    year: {
      type: Number,
      required: [true, "Please provide a year"],
      min: [2020, "Year must be 2020 or later"],
    },
    status: {
      type: String,
      enum: ["COMPLETED", "INCOMPLETE", "MISSING"],
      default: "INCOMPLETE",
    },
    tasks: [TaskSchema],
    totalHours: {
      type: Number,
      default: 0,
      min: [0, "Total hours cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total hours before saving
TimesheetSchema.pre("save", function (next) {
  this.totalHours = this.tasks.reduce((total, task) => total + task.hours, 0);

  // Update status based on total hours
  if (this.totalHours === 0) {
    this.status = "MISSING";
  } else if (this.totalHours >= 40) {
    this.status = "COMPLETED";
  } else {
    this.status = "INCOMPLETE";
  }

  next();
});

export default mongoose.models.Timesheet ||
  mongoose.model<ITimesheet>("Timesheet", TimesheetSchema);
