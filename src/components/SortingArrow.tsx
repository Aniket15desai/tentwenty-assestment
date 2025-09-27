import React from 'react'

interface SortingArrowProps {
  direction?: 'asc' | 'desc' | 'none'
}

const SortingArrow: React.FC<SortingArrowProps> = ({ 
  direction = 'none', 
}) => {

  if (direction === 'asc') {
    return (
        <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            data-name="Line Color" 
            xmlns="http://www.w3.org/2000/svg" 
            className="icon line-color">
            <path 
                style={{fill: 'none', stroke: '#1C64F2', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2'}} 
                d="m5 17 3 3 3-3"
            />
            <path 
                data-name="primary" 
                style={{fill: 'none', stroke: '#1C64F2', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2'}} 
                d="M8 20V4"
            />
        </svg>
    );
  }

  if (direction === 'desc') {
    return (
        <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            data-name="Line Color" 
            xmlns="http://www.w3.org/2000/svg" 
            className="icon line-color">
            <path 
                style={{fill: 'none', stroke: '#1C64F2', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2'}} 
                d="M16 4v16"
            />
            <path 
                data-name="secondary" 
                style={{fill: 'none', stroke: '#1C64F2', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2'}} 
                d="m19 7-3-3-3 3"
            />
        </svg>
    );
  }
  return (
    <svg 
        width="16" 
        height="16" 
        viewBox="0 0 24 24" 
        data-name="Line Color" 
        xmlns="http://www.w3.org/2000/svg" 
        className="icon line-color">
        <path 
            style={{fill: 'none', stroke: 'gray', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2'}} 
            d="m5 17 3 3 3-3"
        />
        <path 
            data-name="primary" 
            style={{fill: 'none', stroke: 'gray', strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: '2'}} 
            d="M8 20V4"
        />
    </svg>
);
}

export default SortingArrow
