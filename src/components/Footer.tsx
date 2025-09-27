import React from 'react'

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  return (
    <div className={`text-center py-8 bg-white rounded-lg shadow mt-4 ${className}`}>
      <p className="text-sm text-gray-500">
        © 2024 tentwenty. All rights reserved.
      </p>
    </div>
  );
}

export default Footer
