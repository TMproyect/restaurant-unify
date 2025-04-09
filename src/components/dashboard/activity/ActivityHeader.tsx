
import React from 'react';
import { CardTitle } from '@/components/ui/card';
import FilterDropdown from './FilterDropdown';
import { FilterType } from './types';

interface ActivityHeaderProps {
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
  filters: FilterType[];
}

const ActivityHeader: React.FC<ActivityHeaderProps> = ({ 
  activeFilter, 
  setActiveFilter, 
  filters 
}) => {
  console.log('🔄 [ActivityHeader] Rendering with filter:', activeFilter);
  
  return (
    <div className="flex justify-between items-center mb-2">
      <CardTitle className="text-xl font-semibold">Monitor de Actividad</CardTitle>
      <div className="flex items-center gap-2">
        <FilterDropdown 
          activeFilter={activeFilter} 
          setActiveFilter={setActiveFilter} 
          filters={filters}
        />
      </div>
    </div>
  );
};

export default ActivityHeader;
