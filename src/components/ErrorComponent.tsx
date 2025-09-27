'use client'

import React from 'react'
import { ExclamationTriangleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline'

export type ErrorType = 'error' | 'warning' | 'info'

export interface ErrorComponentProps {
  title?: string;
  message: string
  type?: ErrorType
  onRetry?: () => void
  retryLabel?: string;
  onDismiss?: () => void
  dismissLabel?: string;
  showIcon?: boolean
  fullScreen?: boolean
  className?: string;
  children?: React.ReactNode
}

const ErrorComponent: React.FC<ErrorComponentProps> = ({
  title,
  message,
  type = 'error',
  onRetry,
  retryLabel = 'Try Again',
  onDismiss,
  dismissLabel = 'Dismiss',
  showIcon = true,
  fullScreen = false,
  className = '',
  children
}) => {
  const getErrorStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          title: 'text-yellow-800',
          message: 'text-yellow-600',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          icon: 'text-yellow-400'
        }
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          title: 'text-blue-800',
          message: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700',
          icon: 'text-blue-400'
        }
      case 'error':
      default:
        return {
          container: 'bg-red-50 border-red-200',
          title: 'text-red-800',
          message: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700',
          icon: 'text-red-400'
        }
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <ExclamationTriangleIcon className="h-6 w-6" />
      case 'info':
        return <InformationCircleIcon className="h-6 w-6" />
      case 'error':
      default:
        return <XCircleIcon className="h-6 w-6" />
    }
  }

  const styles = getErrorStyles();
  const defaultTitle = type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Information'

  const errorContent = (
    <div className={`${styles.container} border rounded-md p-4 max-w-md ${className}`}>
      <div className="flex">
        {showIcon && (
          <div className="flex-shrink-0">
            <div className={styles.icon}>
              {getIcon()}
            </div>
          </div>
        )}
        <div className={showIcon ? 'ml-3' : ''}>
          {(title || defaultTitle) && (
            <h3 className={`${styles.title} font-medium mb-2`}>
              {title || defaultTitle}
            </h3>
          )}
          <div className={`${styles.message} text-sm mb-4`}>
            {message}
          </div>
          
          {children && (
            <div className="mb-4">
              {children}
            </div>
          )}
          
          {(onRetry || onDismiss) && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className={`${styles.button} text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors w-full sm:w-auto`}
                >
                  {retryLabel}
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 cursor-pointer transition-colors w-full sm:w-auto"
                >
                  {dismissLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {errorContent}
        </div>
      </div>
    );
  }

  return errorContent
}

export default ErrorComponent
