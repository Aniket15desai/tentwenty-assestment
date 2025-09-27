'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { timesheetApi, dateUtils, ApiError, TimesheetFilters, PaginationInfo } from '@/lib/api'
import { ApiTimesheet, TimesheetData, SortConfig, SortField } from '@/types'
import LoadingScreen from '@/components/LoadingScreen'
import SortingArrow from '@/components/SortingArrow'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Dropdown, { DropdownOption } from '@/components/Dropdown'
import Table, { TableColumn } from '@/components/Table'
import Pagination from '@/components/Pagination'
import ErrorComponent from '@/components/ErrorComponent'
import TimesheetCreateModal from '@/components/TimesheetCreateModal'

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [timesheetData, setTimesheetData] = useState<TimesheetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [filters, setFilters] = useState<TimesheetFilters>({
    page: 1,
    limit: 10,
    status: '',
    dateRange: ''
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: null,
    direction: 'desc'
  });

  // Dropdown options
  const dateRangeOptions: DropdownOption[] = [
    { value: '', label: 'Date Range' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' }
  ]

  const statusOptions: DropdownOption[] = [
    { value: '', label: 'Status' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'INCOMPLETE', label: 'Incomplete' },
    { value: 'MISSING', label: 'Missing' }
  ]

  const itemsPerPageOptions: DropdownOption[] = [
    { value: '5', label: '5 per page' },
    { value: '10', label: '10 per page' },
    { value: '25', label: '25 per page' }
  ]

  // Table columns config
  const tableColumns: TableColumn[] = [
    {
      key: 'week',
      label: 'WEEK #',
      sortable: true,
      width: '120px',
      render: (value) => String(value),
    },
    {
      key: 'dateRange',
      label: 'DATE',
      sortable: true,
      width: '36%'
    },
    {
      key: 'status',
      label: 'STATUS',
      sortable: true,
      width: '36%',
      render: (value) => (
        <span className={getStatusBadge(String(value))}>
          {String(value)}
        </span>
      )
    },
    {
      key: 'action',
      label: 'ACTIONS',
      width: '120px',
      align: 'center',
      render: (value, row) => (
        <button
          onClick={() => {
            if (String(value) === 'View' || String(value) === 'Update' || String(value) === 'Create') {
              router.push(`/timesheet/${row.id}`);
            }
          }}
          className={getActionButton(String(value))}
        >
          {String(value)}
        </button>
      )
    }
  ]

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const formatTimesheetData = useCallback((timesheets: ApiTimesheet[]): TimesheetData[] => {
    return timesheets.map(timesheet => ({
      id: timesheet._id,
      week: timesheet.weekNumber,
      dateRange: dateUtils.formatDateRange(timesheet.weekStartDate, timesheet.weekEndDate),
      status: timesheet.status,
      action: getActionForStatus(timesheet.status),
      year: timesheet.year,
      weekStartDate: timesheet.weekStartDate
    }));
  }, []);

  const loadTimesheets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const requestFilters = {
        ...filters,
        ...(sortConfig.field && {
          sortField: sortConfig.field,
          sortDirection: sortConfig.direction
        })
      }

      const response = await timesheetApi.getTimesheets(requestFilters);
      // If no timesheets exist, dummy sample data
      const formattedData = formatTimesheetData(response.timesheets)
      setTimesheetData(formattedData)
      setPagination(response.pagination)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to load timesheets');
      }
      console.error('Error loading timesheets:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortConfig, formatTimesheetData]);

  useEffect(() => {
    if (status === 'authenticated') {
      loadTimesheets();
    }
  }, [status, loadTimesheets]);

  const handleFilterChange = (newFilters: Partial<TimesheetFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1
    }));
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }

  const handleItemsPerPageChange = (limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  }

  const handleSort = (field: string) => {
    const sortField = field as SortField
    setSortConfig(prev => ({
      field: sortField,
      direction: prev.field === sortField && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    
    setFilters(prev => ({ ...prev, page: 1 }));
  }

  const getSortIcon = (field: string) => {
    const sortField = field as SortField
    if (sortConfig.field !== sortField) {
      return <SortingArrow direction="none" />
    }
    return <SortingArrow 
      direction={sortConfig.direction} 
    />
  }

  const getActionForStatus = (status: string): string => {
    switch (status) {
      case 'COMPLETED':
        return 'View'
      case 'INCOMPLETE':
        return 'Update'
      case 'MISSING':
        return 'Create'
      default:
        return 'View'
    }
  }

  if (error && !loading) {
    return (
      <ErrorComponent
        title="Error Loading Timesheets"
        message={error || 'An unexpected error occurred'}
        type="error"
        onRetry={loadTimesheets}
        retryLabel="Try Again"
        fullScreen={true}
      />
    );
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-lg text-xs font-medium'
    switch (status) {
      case 'COMPLETED':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'INCOMPLETE':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'MISSING':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getActionButton = (action: string) => {
    const baseClasses = 'text-sm font-medium hover:underline cursor-pointer'
    if (action === 'View') {
      return `${baseClasses} text-blue-600`
    } else if (action === 'Update') {
      return `${baseClasses} text-blue-600`
    } else if (action === 'Create') {
      return `${baseClasses} text-blue-600`
    }
    return `${baseClasses} text-blue-600`
  }

  const handleOpenModel = () => {
    setIsModelOpen(true);
  }

  const handleCloseModel = () => {
    setIsModelOpen(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LoadingScreen isVisible={loading} />
      
      {/* Top Navbar */}
      <Navbar currentPage="dashboard" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow">
            {/* Header Section */}
            <div className="px-6 py-6 border-b border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Your Timesheets</h2>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:justify-between">
                <div className="flex justify-between lg:space-x-4 mb-4 sm:mb-0">
                  <Dropdown
                    options={dateRangeOptions}
                    value={filters.dateRange || ''}
                    onChange={(value) => handleFilterChange({ dateRange: value || undefined })}
                    className="sm:w-48"
                  />

                  <Dropdown
                    options={statusOptions}
                    value={filters.status || ''}
                    onChange={(value) => handleFilterChange({ status: value || undefined })}
                    className="sm:w-48"
                  />
                </div>
                <div>
                  <button onClick={handleOpenModel} className='w-full sm:w-48 px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700'>
                    Create New Timesheet
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <Table
              columns={tableColumns}
              data={timesheetData}
              loading={loading}
              emptyMessage="No timesheets found. Click 'Sample Data' to generate sample data."
              onSort={handleSort}
              sortConfig={sortConfig}
              getSortIcon={getSortIcon}
            />

            {/* Pagination */}
            {pagination && (
              <Pagination
                pagination={pagination}
                onPageChange={handlePageChange}
                onLimitChange={handleItemsPerPageChange}
                itemsPerPageOptions={itemsPerPageOptions}
              />
            )}
          </div>
        </div>
        {isModelOpen && (
          <TimesheetCreateModal 
            onClose={handleCloseModel} 
            onSuccess={loadTimesheets}
          />
        )}

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}