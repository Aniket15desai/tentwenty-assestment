'use client'

import { useState } from 'react'
import { XMarkIcon, InformationCircleIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline'
import Dropdown, { DropdownOption } from './Dropdown'

interface TaskFormProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: { projectName: string; workType: string; taskDescription: string; hours: number }) => void
  initialTask?: {
    projectName: string
    workType: string
    taskDescription: string
    hours: number
  }
}

const projectOptions: DropdownOption[] = [
  { value: 'Project Name', label: 'Project Name' },
  { value: 'Homepage Development', label: 'Homepage Development' },
  { value: 'Mobile App Development', label: 'Mobile App Development' },
  { value: 'API Development', label: 'API Development' },
  { value: 'Database Design', label: 'Database Design' }
]

const workTypeOptions: DropdownOption[] = [
  { value: 'Bug fixes', label: 'Bug fixes' },
  { value: 'Feature Development', label: 'Feature Development' },
  { value: 'Code Review', label: 'Code Review' },
  { value: 'Testing', label: 'Testing' },
  { value: 'Documentation', label: 'Documentation' },
  { value: 'Meeting', label: 'Meeting' }
]

export default function TaskForm({ isOpen, onClose, onSave, initialTask }: TaskFormProps) {
  const [projectName, setProjectName] = useState(initialTask?.projectName || 'Project Name');
  const [workType, setWorkType] = useState(initialTask?.workType || 'Bug fixes');
  const [taskDescription, setTaskDescription] = useState(initialTask?.taskDescription || '');
  const [hours, setHours] = useState(initialTask?.hours || 12);

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ projectName, workType, taskDescription, hours });
    onClose();
  }

  const handleClose = () => {
    setProjectName('Project Name');
    setWorkType('Bug fixes');
    setTaskDescription('');
    setHours(12);
    onClose();
  }

  const incrementHours = () => {
    setHours(prev => prev + 1);
  }

  const decrementHours = () => {
    setHours(prev => Math.max(0, prev - 1));
  }

  return (
    <div className="fixed inset-0 bg-black/60 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
      <div className="relative p-6 w-full max-w-md sm:max-w-lg md:max-w-xl shadow-xl rounded-lg bg-white mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Add New Entry
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Project */}
          <div>
            <div className="flex items-center mb-3">
              <label className="block text-sm font-medium text-gray-900">
                Select Project
              </label>
              <span className="text-red-500 ml-1">*</span>
              <InformationCircleIcon className="h-4 w-4 text-gray-400 ml-2" />
            </div>
            <Dropdown
              options={projectOptions}
              value={projectName}
              onChange={setProjectName}
              size="lg"
              required
            />
          </div>

          {/* Type of Work */}
          <div>
            <div className="flex items-center mb-3">
              <label className="block text-sm font-medium text-gray-900">
                Type of Work
              </label>
              <span className="text-red-500 ml-1">*</span>
              <InformationCircleIcon className="h-4 w-4 text-gray-400 ml-2" />
            </div>
            <Dropdown
              options={workTypeOptions}
              value={workType}
              onChange={setWorkType}
              size="lg"
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <div className="flex items-center mb-3">
              <label className="block text-sm font-medium text-gray-900">
                Task description
              </label>
              <span className="text-red-500 ml-1">*</span>
            </div>
            <textarea
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Write text here ..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">A note for extra info</p>
          </div>

          {/* Hours */}
          <div>
            <div className="flex items-center mb-3">
              <label className="block text-sm font-medium text-gray-900">
                Hours
              </label>
              <span className="text-red-500 ml-1">*</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={decrementHours}
                className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <MinusIcon className="h-4 w-4 text-gray-600" />
              </button>
              <input
                type="number"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="w-16 px-3 py-2 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="0"
                required
              />
              <button
                type="button"
                onClick={incrementHours}
                className="w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <PlusIcon className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row justify-between pt-6 gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-3 w-full sm:w-1/2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-3 w-full sm:w-1/2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              Add entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}