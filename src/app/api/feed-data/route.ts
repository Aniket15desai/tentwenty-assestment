import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import connectDB from '@/lib/mongodb'
import Timesheet from '@/models/Timesheet'
import { generateSampleTimesheets } from '@/lib/feedData'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const userId = session.user.id || session.user.email
    const body = await request.json().catch(() => ({}))
    const { clearExisting = false } = body

    // Check if user already has timesheets
    const existingCount = await Timesheet.countDocuments({ userId })

    if (existingCount > 0 && !clearExisting) {
      return NextResponse.json({
        message: 'Sample data already exists. Send { "clearExisting": true } to replace existing data.',
        count: existingCount
      })
    }

    // Clear existing data if requested
    if (clearExisting && existingCount > 0) {
      await Timesheet.deleteMany({ userId })
      console.log(`Cleared ${existingCount} existing timesheets for user ${userId}`)
    }

    // Generate 40 weeks of sample data with random status distribution
    const sampleTimesheets = generateSampleTimesheets(userId, 40)

    // Insert all timesheets
    const createdTimesheets = await Timesheet.insertMany(sampleTimesheets)

    // Count status distribution for logging
    const statusCounts = createdTimesheets.reduce((acc: Record<string, number>, timesheet) => {
      acc[timesheet.status] = (acc[timesheet.status] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      message: clearExisting ? 'Sample data replaced successfully' : 'Sample data created successfully',
      count: createdTimesheets.length,
      statusDistribution: statusCounts,
      timesheets: createdTimesheets
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading sample data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}