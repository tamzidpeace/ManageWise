// LoadingSpinner.tsx
// A reusable loading spinner component that displays a centered spinner animation
// Used to indicate loading states in the application

import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-gray-900"></div>
    </div>
  );
};

export default LoadingSpinner;