
import React from 'react';
import DateRangeFilter from './DateRangeFilter';

interface DateFilterSectionProps {
  onRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

const DateFilterSection: React.FC<DateFilterSectionProps> = ({ onRangeChange }) => {
  return (
    <div className="flex justify-end">
      <DateRangeFilter onRangeChange={onRangeChange} />
    </div>
  );
};

export default DateFilterSection;
