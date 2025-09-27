import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Timesheet from '@/models/Timesheet'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit

    const status = searchParams.get('status');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const dateRange = searchParams.get('dateRange');
    
    const sortField = searchParams.get('sortField');
    const sortDirection = searchParams.get('sortDirection') || 'desc'

    console.log('Session user:', {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name
    });

    const userId = session.user.id || session.user.email
    console.log('Querying with userId:', userId);
    
    const query: Record<string, unknown> = {
      $or: [
        { userId: session.user.id },
        { userId: session.user.email }
      ]
    }

    if (status && status !== 'all') {
      query.status = status
    }

    if (year) {
      query.year = parseInt(year);
    }

    if (month && year) {
      const monthNum = parseInt(month);
      const startDate = new Date(parseInt(year), monthNum - 1, 1);
      const endDate = new Date(parseInt(year), monthNum, 0);

      query.weekStartDate = {
        $gte: startDate.toISOString().split('T')[0],
        $lte: endDate.toISOString().split('T')[0]
      } as Record<string, string>
    }

    if (dateRange) {
      const now = new Date();
      let startDate: Date

      switch (dateRange) {
        case 'thisWeek':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - now.getDay() + 1) // Monday
          break
        case 'lastWeek':
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 7);
          break
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break
        case 'lastMonth':
          startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          query.weekStartDate = {
            $gte: startDate.toISOString().split('T')[0],
            $lte: endOfLastMonth.toISOString().split('T')[0]
          } as Record<string, string>
          break
        case 'last3Months':
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          break
        default:
          startDate = now
      }

      if (dateRange !== 'lastMonth') {
        query.weekStartDate = { $gte: startDate.toISOString().split('T')[0] } as Record<string, string>
      }
    }

    const totalCount = await Timesheet.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Build sort object based on parameters
    let sortObject: Record<string, 1 | -1> = {}
    
    if (sortField && ['week', 'date', 'status'].includes(sortField)) {
      const direction: 1 | -1 = sortDirection === 'asc' ? 1 : -1
      
      switch (sortField) {
        case 'week':
          sortObject = { year: direction, weekNumber: direction }
          break
        case 'date':
          sortObject = { weekStartDate: direction }
          break
        case 'status':
          sortObject = { status: direction }
          break
      }
    } else {
      sortObject = { year: -1, weekNumber: -1 }
    }

    console.log('Sort parameters:', { sortField, sortDirection, sortObject });

    // Get timesheets with pagination and sorting
    const timesheets = await Timesheet.find(query)
      .sort(sortObject)
      .skip(skip)
      .limit(limit)

    console.log('Query result:', {
      totalCount,
      foundTimesheets: timesheets.length,
      firstTimesheet: timesheets[0] ? {
        id: timesheets[0]._id,
        userId: timesheets[0].userId,
        week: timesheets[0].weekNumber,
        year: timesheets[0].year,
        status: timesheets[0].status
      } : null
    });

    return NextResponse.json({
      timesheets,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching timesheets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { weekStartDate, weekEndDate, weekNumber, year } = body

    const timesheet = new Timesheet({
      userId: session.user.id || session.user.email,
      weekStartDate,
      weekEndDate,
      weekNumber,
      year,
      tasks: [],
      totalHours: 0,
      status: 'MISSING'
    });

    await timesheet.save();

    return NextResponse.json({ timesheet }, { status: 201 });
  } catch (error) {
    console.error('Error creating timesheet:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}