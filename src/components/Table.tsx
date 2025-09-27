'use client'

import React from 'react'

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string;
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: Record<string, unknown>, index: number) => React.ReactNode
}

export interface TableProps {
  columns: TableColumn[]
  data: Record<string, unknown>[]
  loading?: boolean
  emptyMessage?: string;
  onSort?: (key: string) => void
  sortConfig?: {
    field: string | null
    direction: 'asc' | 'desc'
  }
  getSortIcon?: (field: string) => React.ReactNode
  onRowClick?: (row: Record<string, unknown>, index: number) => void
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  rowClassName?: string | ((row: Record<string, unknown>, index: number) => string);
}

const Table: React.FC<TableProps> = ({
  columns,
  data,
  emptyMessage = 'No data available',
  onSort,
  getSortIcon,
  onRowClick,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  rowClassName = ''
}) => {
  const handleHeaderClick = (column: TableColumn) => {
    if (column.sortable && onSort) {
      onSort(column.key);
    }
  }

  const getColumnWidth = (column: TableColumn) => {
    if (column.width) {
      return { width: column.width }
    }
    return {}
  }

  const getTextAlign = (align: string = 'left') => {
    switch (align) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left'
    }
  }

  const getRowClassName = (row: Record<string, unknown>, index: number) => {
    if (typeof rowClassName === 'function') {
      return rowClassName(row, index);
    }
    return rowClassName
  }

  const renderCellContent = (column: TableColumn, row: Record<string, unknown>, index: number): React.ReactNode => {
    if (column.render) {
      return column.render(row[column.key], row, index);
    }
    return String(row[column.key] ?? '');
  }

  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
        <thead className={`bg-gray-50 ${headerClassName}`}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                style={getColumnWidth(column)}
                className={`
                  px-6 py-3 ${getTextAlign(column.align)} text-xs font-medium text-gray-500 uppercase tracking-wider
                  ${column.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}
                `}
                onClick={() => handleHeaderClick(column)}
              >
                {column.sortable ? (
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {getSortIcon && getSortIcon(column.key)}
                  </div>
                ) : (
                  <span>{column.label}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`bg-white divide-y divide-gray-200 ${bodyClassName}`}>
          {data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={String(row.id) || index}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''} ${getRowClassName(row, index)}`}
                onClick={() => onRowClick && onRowClick(row, index)}
              >
                {columns.map((column) => (
                  <td
                    key={`${String(row.id) || index}-${column.key}`}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.key === 'week' ? 'bg-gray-50' : ''} ${getTextAlign(column.align)}`}
                  >
                    {renderCellContent(column, row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table
