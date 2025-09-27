import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectDB from "@/lib/mongodb";
import Timesheet from "@/models/Timesheet";
import authOptions from "../../auth/[...nextauth]/authOptions";

// GET /api/timesheets/:id
export async function GET(
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

    return NextResponse.json({ timesheet });
  } catch (error) {
    console.error("Error fetching timesheet:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/timesheets/:id
export async function PUT(
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
    const { tasks } = body;

    const timesheet = await Timesheet.findOneAndUpdate(
      {
        _id: id,
        $or: [{ userId: session.user.id }, { userId: session.user.email }],
      },
      { tasks },
      { new: true, runValidators: true }
    );

    if (!timesheet) {
      return NextResponse.json(
        { error: "Timesheet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ timesheet });
  } catch (error) {
    console.error("Error updating timesheet:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/timesheets/:id
export async function DELETE(
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

    const timesheet = await Timesheet.findOneAndDelete({
      _id: id,
      $or: [{ userId: session.user.id }, { userId: session.user.email }],
    });

    if (!timesheet) {
      return NextResponse.json(
        { error: "Timesheet not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Timesheet deleted successfully" });
  } catch (error) {
    console.error("Error deleting timesheet:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
