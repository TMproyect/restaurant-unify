
import React from 'react';

const ActivityLoading: React.FC = () => {
  return (
    <div className="animate-pulse space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-12 bg-gray-100 rounded-md"></div>
      ))}
    </div>
  );
};

export default ActivityLoading;
