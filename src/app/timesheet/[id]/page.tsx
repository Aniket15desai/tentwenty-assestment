'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { EllipsisHorizontalIcon, PlusIcon } from '@heroicons/react/24/outline'
import TaskForm from '@/components/TaskForm'
import { timesheetApi, dateUtils, ApiError } from '@/lib/api'
import { ApiTimesheet } from '@/types'
import LoadingScreen from '@/components/LoadingScreen'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import ErrorComponent from '@/components/ErrorComponent'
import toast from 'react-hot-toast'

interface TaskEntry {
  id: string
  taskName: string
  hours: number
  projectName: string
  workType: string
  taskDescription: string
}

interface DayData {
  date: string
  tasks: TaskEntry[]
}

export default function TimesheetDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [activeTaskMenu, setActiveTaskMenu] = useState<string | null>(null)
  const [timesheet, setTimesheet] = useState<ApiTimesheet | null>(null)
  const [timesheetData, setTimesheetData] = useState<DayData[]>([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [editingTask, setEditingTask] = useState<TaskEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  const loadTimesheet = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const timesheetData = await timesheetApi.getTimesheet(params.id as string)
      setTimesheet(timesheetData)

      const formattedDayData = formatTimesheetForDisplay(timesheetData)
      setTimesheetData(formattedDayData)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Failed to load timesheet')
      }
      console.error('Error loading timesheet:', err)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      loadTimesheet()
    }
  }, [status, params.id, loadTimesheet])

  const formatTimesheetForDisplay = (timesheet: ApiTimesheet): DayData[] => {
    const startDate = new Date(timesheet.weekStartDate)
    const days: DayData[] = []

    // Create 7 days (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)

      const dateStr = currentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })

      const dayTasks = timesheet.tasks
        .filter(task => {
          const taskDate = new Date(task.date)
          return taskDate.toDateString() === currentDate.toDateString()
        })
        .map(task => ({
          id: task._id || '',
          taskName: task.taskName,
          hours: task.hours,
          projectName: task.projectName,
          workType: task.workType,
          taskDescription: task.taskDescription
        }))

      days.push({
        date: dateStr,
        tasks: dayTasks
      })
    }

    return days
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <ErrorComponent
        title="Error Loading Timesheet"
        message={error || 'An unexpected error occurred'}
        type="error"
        onRetry={loadTimesheet}
        retryLabel="Try Again"
        onDismiss={() => router.push('/dashboard')}
        dismissLabel="Back to Dashboard"
        fullScreen={true}
      />
    )
  }

  const totalHours = timesheetData.reduce((total, day) =>
    total + day.tasks.reduce((dayTotal, task) => dayTotal + task.hours, 0), 0
  )

  const handleTaskMenuClick = (taskId: string) => {
    setActiveTaskMenu(activeTaskMenu === taskId ? null : taskId)
  }

  const handleAddNewTask = (date: string) => {
    setSelectedDate(date)
    setEditingTask(null)
    setShowTaskForm(true)
  }

  const handleEditTask = (task: TaskEntry) => {
    setEditingTask(task)
    setShowTaskForm(true)
    setActiveTaskMenu(null)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!timesheet) return

    try {
      setActiveTaskMenu(null)
      const updatedTimesheet = await timesheetApi.deleteTask(timesheet._id, taskId)
      setTimesheet(updatedTimesheet)

      const formattedDayData = formatTimesheetForDisplay(updatedTimesheet)
      setTimesheetData(formattedDayData)
    } catch (err) {
      console.error('Error deleting task:', err)
      toast.error('Failed to delete task. Please try again.')
    }
  }

  const handleSaveTask = async (taskData: { projectName: string; workType: string; taskDescription: string; hours: number }) => {
    if (!timesheet) return

    try {
      // Find the date for the selected day or editing task
      let taskDate = selectedDate
      if (editingTask) {
        // Find the date for the editing task
        const dayWithTask = timesheetData.find(day =>
          day.tasks.some(task => task.id === editingTask.id)
        )
        taskDate = dayWithTask?.date || selectedDate
      }

      let isoDate: string
      if (editingTask) {
        // For editing, find the original task's date
        const originalTask = timesheet.tasks.find(t => t._id === editingTask.id)
        isoDate = originalTask?.date || timesheet.weekStartDate
      } else {
        // For new tasks, calculate the date based on selected day
        const weekStart = new Date(timesheet.weekStartDate)
        const dayIndex = timesheetData.findIndex(day => day.date === taskDate)
        const taskDateObj = new Date(weekStart)
        taskDateObj.setDate(weekStart.getDate() + dayIndex)
        isoDate = taskDateObj.toISOString().split('T')[0]
      }

      const apiTaskData = {
        taskName: taskData.taskDescription.substring(0, 50) + (taskData.taskDescription.length > 50 ? '...' : ''),
        projectName: taskData.projectName,
        workType: taskData.workType,
        taskDescription: taskData.taskDescription,
        hours: taskData.hours,
        date: isoDate
      }

      let updatedTimesheet: ApiTimesheet

      if (editingTask) {
        // Update existing task
        updatedTimesheet = await timesheetApi.updateTask(timesheet._id, editingTask.id, apiTaskData)
      } else {
        // Add new task
        updatedTimesheet = await timesheetApi.addTask(timesheet._id, apiTaskData)
      }

      setTimesheet(updatedTimesheet)
      const formattedDayData = formatTimesheetForDisplay(updatedTimesheet)
      setTimesheetData(formattedDayData)

      setShowTaskForm(false)
      setEditingTask(null)
    } catch (err) {
      console.error('Error saving task:', err)
      toast.error('Failed to save task. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <LoadingScreen isVisible={loading} />
      <Navbar currentPage="timesheet" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow">
            {/* Header Section */}
            <div className="px-6 py-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">This week&apos;s timesheet</h1>
                  <p className="text-sm text-gray-500">
                    {dateUtils.formatDateRange(timesheet?.weekStartDate || '', timesheet?.weekEndDate || '')}
                  </p>
                </div>
                <div className="text-right mt-4 sm:mt-0">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">{totalHours}/40 hrs</span>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${Math.min((totalHours / 40) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500">{Math.round((totalHours / 40) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timesheet Content */}
            <div className="px-6 py-4">
              {timesheetData.map((day, dayIndex) => (
                <div key={dayIndex} className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{day.date}</h3>

                  {/* Task Entries */}
                  <div className="space-y-3 mb-4">
                    {day.tasks.map((task) => (
                      <div key={task.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 px-4 bg-gray-50 rounded-lg">
                        <div className="flex-1 mb-2 sm:mb-0">
                          <span className="text-sm font-medium text-gray-900">{task.taskName}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">{task.hours} hrs</span>
                          <button className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            {task.projectName}
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => handleTaskMenuClick(task.id)}
                              className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                              <EllipsisHorizontalIcon className="h-5 w-5" />
                            </button>

                            {activeTaskMenu === task.id && (
                              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg py-1 z-10">
                                <button
                                  onClick={() => handleEditTask(task)}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Task Button */}
                  <button
                    onClick={() => handleAddNewTask(day.date)}
                    className="flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-500 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add new task
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>

      {/* Task Form Modal */}
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        initialTask={editingTask ? {
          projectName: editingTask.projectName,
          workType: editingTask.workType,
          taskDescription: editingTask.taskDescription,
          hours: editingTask.hours
        } : undefined}
      />
    </div>
  )
}