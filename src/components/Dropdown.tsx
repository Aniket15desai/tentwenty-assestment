'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

export interface DropdownOption {
  value: string;
  label: string;
  onClick?: () => void;
}

interface DropdownProps {
  // Content props
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  
  // Behavior props
  onChange?: (value: string) => void;
  onSelect?: (option: DropdownOption) => void;
  
  // Styling props
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
  
  // Layout props
  type?: 'select' | 'menu';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
  
  // Custom trigger
  trigger?: React.ReactNode;
  
  // Position
  position?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value = '',
  placeholder = 'Select an option',
  onChange,
  onSelect,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  optionClassName = '',
  type = 'select',
  size = 'md',
  disabled = false,
  trigger,
  position = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selectedValue when value prop changes
  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  const handleSelect = (option: DropdownOption) => {
    if (type === 'select') {
      setSelectedValue(option.value);
      onChange?.(option.value);
    }
    
    if (option.onClick) {
      option.onClick();
    }
    
    onSelect?.(option);
    setIsOpen(false);
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-sm'
      case 'lg':
        return 'px-4 py-3 text-base'
      default:
        return 'px-3 py-2 text-sm'
    }
  }

  const getSelectedLabel = () => {
    const selectedOption = options.find(option => option.value === selectedValue);
    return selectedOption ? selectedOption.label : placeholder
  }

  const getPositionClasses = () => {
    return position === 'right' ? 'right-0' : 'left-0'
  }

  // Default button for select type
  const defaultButton = (
    <button
      type="button"
      onClick={() => !disabled && setIsOpen(!isOpen)}
      disabled={disabled}
      className={`
        relative w-full bg-white border border-gray-300 rounded-md 
        ${getSizeClasses()} pr-8
        text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}
        appearance-none
        ${buttonClassName}
      `}
    >
      <span className={selectedValue ? 'text-gray-900' : 'text-gray-500'}>
        {getSelectedLabel()}
      </span>
      <ChevronDownIcon 
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} 
      />
    </button>
  );

  const renderTrigger = () => {
    if (trigger) {
      // Clone the trigger and add onClick handler
      return React.cloneElement(trigger as React.ReactElement<{onClick?: (e: React.MouseEvent) => void}>, {
        onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          if (!disabled) setIsOpen(!isOpen);
        }
      });
    }
    return defaultButton
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      {renderTrigger()}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`
          absolute ${getPositionClasses()} mt-1 w-full bg-white rounded-md shadow-lg py-1 z-50
          border border-gray-200 max-h-60 overflow-auto
          ${type === 'menu' ? '' : 'w-full'}
          ${menuClassName}
        `}>
          {options.map((option, index) => (
            <button
              key={`${option.value}-${index}`}
              onClick={() => handleSelect(option)}
              className={`
                w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 
                focus:outline-none focus:bg-gray-100 transition-colors
                ${selectedValue === option.value ? 'bg-blue-50 text-blue-700' : ''}
                ${optionClassName}
              `}
            >
              {option.label}
            </button>
          ))}
          
          {options.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500 italic">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dropdown
