'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import Dropdown, { DropdownOption } from './Dropdown'

interface NavigationProps {
  currentPage?: 'dashboard' | 'timesheet'
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ 
  className = ""
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const userMenuOptions: DropdownOption[] = [
    {
      value: 'signout',
      label: 'Sign out',
      onClick: () => signOut()
    }
  ]

  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-xl font-medium text-gray-900 hover:text-blue-600 cursor-pointer"
              >
                Ticktock
              </button>
            </div>
            <nav className="hidden sm:flex space-x-8">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-900 font-medium"
              >
                Timesheets
              </button>
            </nav>
          </div>

          <Dropdown
            options={userMenuOptions}
            type="menu"
            position="right"
            trigger={
              <button className="flex w-38 items-center justify-end space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none cursor-pointer">
                <span className="font-medium">{session?.user?.name || session?.user?.email || 'User'}</span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            }
          />
        </div>
      </div>
    </nav>
  );
}

export default Navigation
