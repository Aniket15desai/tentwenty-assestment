import React from 'react'

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string;
  showProgress?: boolean
}

const LoadingScreen: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
}) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4 ">
        <div className="relative">
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-white border-r-white/50 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
