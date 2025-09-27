import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Timesheet, { ITask } from "@/models/Timesheet";
import { authOptions } from "../../../../auth/[...nextauth]/route";

// PUT /api/timesheets/:id/tasks/:taskId
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id, taskId } = await params;

    const body = await request.json();
    const { taskName, projectName, workType, taskDescription, hours, date } =
      body;

    // Validate required fields
    if (
      !taskName ||
      !projectName ||
      !workType ||
      !taskDescription ||
      !hours ||
      !date
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate hours
    if (typeof hours !== "number" || hours < 0 || hours > 24) {
      return NextResponse.json(
        { error: "Hours must be between 0 and 24" },
        { status: 400 }
      );
    }

    const timesheet = await Timesheet.findOne({
      _id: id,
      $or: [{ userId: session.user.id }, { userId: session.user.email }],
    });

    if (!timesheet) {
      return NextResponse.json(
        { error: "Timesheet not found" },
        { status: 404 }
      );
    }

    const taskIndex = timesheet.tasks.findIndex(
      (task: ITask) => task._id?.toString() === taskId
    );

    if (taskIndex === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    timesheet.tasks[taskIndex] = {
      ...timesheet.tasks[taskIndex],
      taskName,
      projectName,
      workType,
      taskDescription,
      hours: Number(hours),
      date,
    };

    await timesheet.save();

    return NextResponse.json({ timesheet });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/timesheets/:id/tasks/:taskId
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id, taskId } = await params;

    const timesheet = await Timesheet.findOne({
      _id: id,
      $or: [{ userId: session.user.id }, { userId: session.user.email }],
    });

    if (!timesheet) {
      return NextResponse.json(
        { error: "Timesheet not found" },
        { status: 404 }
      );
    }

    const taskIndex = timesheet.tasks.findIndex(
      (task: ITask) => task._id?.toString() === taskId
    );

    if (taskIndex === -1) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    timesheet.tasks.splice(taskIndex, 1);
    await timesheet.save();

    return NextResponse.json({ timesheet });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
