import { ApiTimesheet } from "@/types";

export interface Task {
  taskName: string;
  projectName: string;
  workType: string;
  taskDescription: string;
  hours: number;
  date: string;
}

// Example project names for sample data
export const projectNames = [
  "Website Redesign",
  "Mobile Banking App",
  "Healthcare Portal",
  "Cloud Migration",
  "Analytics Dashboard",
  "Learning Management System",
  "Chat Application",
  "IoT Device Integration",
  "Travel Booking Platform",
  "Retail POS System",
]

// Types of work commonly logged
export const workTypes = [
  "Development",
  "Bug Fix",
  "Design",
  "Testing & QA",
  "Documentation",
  "Research",
  "Client Meeting",
  "Code Review",
  "API Integration"
];

// Example task descriptions per work type
export const taskDescriptions: Record<string, string[]> = {
  "Development": [
    "Implemented new authentication flow with JWT",
    "Built reusable UI components with Tailwind CSS",
    "Integrated third-party payment API",
    "Developed RESTful API for reporting module",
    "Optimized backend queries for faster response",
    "Implemented role-based access control",
  ],
  "Bug Fix": [
    "Fixed layout issues on Safari browser",
    "Resolved caching issue in API responses",
    "Patched security vulnerability in login flow",
    "Fixed broken pagination on dashboard",
    "Corrected error handling in timesheet API",
    "Resolved duplicate entry issue in database",
  ],
  "Design": [
    "Created wireframes for new dashboard",
    "Redesigned login page for better UX",
    "Designed responsive mobile layouts",
    "Updated color palette for accessibility",
    "Created icons and illustrations for features",
    "Prepared design system documentation",
  ],
  "Testing & QA": [
    "Wrote unit tests for API routes",
    "Performed regression testing before release",
    "Tested responsive behavior across devices",
    "Validated form validations and error states",
    "Performed load testing with JMeter",
    "Reviewed test cases with QA team",
  ],
  "Documentation": [
    "Updated developer onboarding guide",
    "Documented database schema changes",
    "Added API usage examples to wiki",
    "Wrote deployment instructions",
    "Updated troubleshooting guide",
    "Created release notes for v1.2.0",
  ],
  "Research": [
    "Explored GraphQL for reporting APIs",
    "Benchmarked different caching strategies",
    "Investigated alternatives for file storage",
    "Studied authentication best practices",
    "Reviewed competitor SaaS products",
    "Analyzed frontend performance metrics",
  ],
  "Client Meeting": [
    "Discussed new feature requirements",
    "Reviewed progress with stakeholders",
    "Conducted demo of latest sprint",
    "Gathered feedback on mobile prototype",
    "Aligned priorities for next sprint",
    "Finalized project milestones",
  ],
  "Code Review": [
    "Reviewed PRs for code style compliance",
    "Suggested optimizations in API structure",
    "Ensured security best practices in auth flow",
    "Checked test coverage before merging",
    "Reviewed frontend performance improvements",
    "Collaborated on refactoring legacy code",
  ],
  "API Integration": [
    "Integrated Stripe for payment processing",
    "Connected to third-party CRM API",
    "Set up OAuth2 with Google and Facebook",
    "Implemented webhook handling for notifications",
    "Integrated analytics tracking API",
    "Connected to external data sources",
  ],
}


export function generateSampleTimesheets(
  userId: string,
  count: number = 40
): Partial<ApiTimesheet>[] {
  const timesheets: Partial<ApiTimesheet>[] = [];
  const currentDate = new Date();

  const statusTypes: ("COMPLETED" | "INCOMPLETE" | "MISSING")[] = [
    "COMPLETED",
    "INCOMPLETE",
    "MISSING",
  ];

  for (let i = 0; i < count; i++) {
    const weekOffset = i;
    const weekStart = new Date(currentDate);
    weekStart.setDate(
      currentDate.getDate() - (currentDate.getDay() - 1) - weekOffset * 7
    );

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const year = weekStart.getFullYear();
    const weekNumber = getWeekNumber(weekStart);

    const randomStatus =
      statusTypes[Math.floor(Math.random() * statusTypes.length)];

    const tasks = generateTasksForWeekWithStatus(
      weekStart,
      weekEnd,
      randomStatus
    );

    const totalHours = tasks.reduce((sum, task) => sum + task.hours, 0);

    timesheets.push({
      userId,
      weekStartDate: weekStart.toISOString().split("T")[0],
      weekEndDate: weekEnd.toISOString().split("T")[0],
      weekNumber,
      year,
      status: totalHours === 0 ? "MISSING" : totalHours >= 40 ? "COMPLETED" : "INCOMPLETE",
      tasks,
      totalHours,
    });
  }

  return timesheets;
}

function generateTasksForWeekWithStatus(
  weekStart: Date,
  weekEnd: Date,
  targetStatus: "COMPLETED" | "INCOMPLETE" | "MISSING"
): Task[] {
  const tasks: Task[] = [];
  const workDays = 5;

  let targetWeekHours: number;

  switch (targetStatus) {
    case "MISSING":
      targetWeekHours = 0;
      break;
    case "INCOMPLETE":
      targetWeekHours = Math.floor(Math.random() * 39) + 1; // 1–39 hours
      break;
    case "COMPLETED":
      targetWeekHours = Math.floor(Math.random() * 11) + 40; // 40–50 hours
      break;
    default:
      targetWeekHours = 0;
  }

  if (targetWeekHours === 0) return tasks;

  const hoursPerDay = Math.floor(targetWeekHours / workDays);
  const remainingHours = targetWeekHours % workDays;

  for (let day = 0; day < workDays; day++) {
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + day);

    let dayHours = hoursPerDay;
    if (day < remainingHours) dayHours += 1;

    if (dayHours > 0) {
      const tasksPerDay = Math.max(
        1,
        Math.min(Math.floor(Math.random() * 3) + 1, Math.ceil(dayHours / 2))
      );

      const baseHoursPerTask = Math.floor(dayHours / tasksPerDay);
      let remainingDayHours = dayHours;

      for (let taskIndex = 0; taskIndex < tasksPerDay; taskIndex++) {
        let taskHours = baseHoursPerTask;
        if (taskIndex === tasksPerDay - 1) taskHours = remainingDayHours;
        else remainingDayHours -= taskHours;

        if (taskHours > 0) {
          const projectName =
            projectNames[Math.floor(Math.random() * projectNames.length)];
          const workType =
            workTypes[Math.floor(Math.random() * workTypes.length)];

          const descriptions =
            taskDescriptions[workType] || ["No description available"];
          const taskDescription =
            descriptions[Math.floor(Math.random() * descriptions.length)];

          tasks.push({
            taskName: `${projectName} - ${workType}`,
            projectName,
            workType,
            taskDescription,
            hours: taskHours,
            date: currentDate.toISOString().split("T")[0],
          });
        }
      }
    }
  }

  return tasks;
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export { getWeekNumber };
