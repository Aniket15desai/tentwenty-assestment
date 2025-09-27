import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Timesheet from "@/models/Timesheet";
import { authOptions } from "../../../auth/[...nextauth]/route";

// POST /api/timesheets/:id/tasks
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

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

    const newTask = {
      taskName,
      projectName,
      workType,
      taskDescription,
      hours: Number(hours),
      date,
    };

    timesheet.tasks.push(newTask);
    await timesheet.save();

    return NextResponse.json({ timesheet }, { status: 201 });
  } catch (error) {
    console.error("Error adding task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
