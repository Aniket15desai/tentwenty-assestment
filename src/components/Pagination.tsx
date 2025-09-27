'use client'

import React from 'react'
import Dropdown, { DropdownOption } from './Dropdown'

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  showItemsPerPage?: boolean
  itemsPerPageOptions?: DropdownOption[]
  showInfo?: boolean
  className?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  disabledButtonClassName?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  pagination,
  onPageChange,
  onLimitChange,
  showItemsPerPage = true,
  itemsPerPageOptions = [
    { value: '5', label: '5 per page' },
    { value: '10', label: '10 per page' },
    { value: '25', label: '25 per page' }
  ],
  showInfo = true,
  className = '',
  buttonClassName = 'px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
  activeButtonClassName = 'bg-blue-600 text-white',
  disabledButtonClassName = 'opacity-50 cursor-not-allowed'
}) => {
  const generatePageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5
    
    if (pagination.totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Complex logic for showing pages with ellipsis
      if (pagination.currentPage <= 3) {
        // Show first 5 pages
        for (let i = 1; i <= maxVisiblePages; i++) {
          pages.push(i);
        }
      } else if (pagination.currentPage >= pagination.totalPages - 2) {
        // Show last 5 pages
        for (let i = pagination.totalPages - 4; i <= pagination.totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show current page and 2 pages on each side
        for (let i = pagination.currentPage - 2; i <= pagination.currentPage + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages
  }

  const pageNumbers = generatePageNumbers();
  const showEllipsis = pagination.totalPages > 5 && pagination.currentPage < pagination.totalPages - 2

  const getButtonClasses = (pageNum: number, isActive: boolean = false, isDisabled: boolean = false) => {
    let classes = buttonClassName
    
    if (isActive) {
      classes += ` ${activeButtonClassName}`
    } else {
      classes += ' text-gray-700 hover:bg-gray-100'
    }
    
    if (isDisabled) {
      classes += ` ${disabledButtonClassName}`
    }
    
    return classes
  }

  return (
    <div className={`bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200 sm:px-6 ${className}`}>
      {/* Left side - Items per page and info */}
      <div className="flex items-center mb-4 sm:mb-0">
        {showItemsPerPage && onLimitChange && (
          <>
            <Dropdown
              options={itemsPerPageOptions}
              value={String(pagination.limit)}
              onChange={(value) => onLimitChange(Number(value))}
              size="sm"
              className="w-32"
            />
            {showInfo && (
              <span className="ml-4 text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} results
              </span>
            )}
          </>
        )}
        
        {!showItemsPerPage && showInfo && (
          <span className="text-sm text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalCount} total items);
          </span>
        )}
      </div>

      {/* Right side - Page navigation */}
      <div className="flex flex-wrap items-center border border-gray-300 rounded-md">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrev}
          className={`${getButtonClasses(0, false, !pagination.hasPrev)} border-r border-gray-300`}
        >
          Previous
        </button>

        {/* Page numbers */}
        {pageNumbers.map((pageNum) => (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`${getButtonClasses(pageNum, pageNum === pagination.currentPage)} border-r border-gray-300`}
          >
            {pageNum}
          </button>
        ))}

        {/* Ellipsis and last page */}
        {showEllipsis && (
          <>
            <span className="px-3 py-1 text-sm text-gray-500 border-r border-gray-300">...</span>
            <button
              onClick={() => onPageChange(pagination.totalPages)}
              className={`${getButtonClasses(pagination.totalPages)} border-r border-gray-300`}
            >
              {pagination.totalPages}
            </button>
          </>
        )}

        {/* Next button */}
        <button
          onClick={() => onPageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNext}
          className={getButtonClasses(0, false, !pagination.hasNext)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination
