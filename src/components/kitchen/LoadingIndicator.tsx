
import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="mt-8 flex justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default LoadingIndicator;
