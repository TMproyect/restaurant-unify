
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Check, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DateRangeFilterProps {
  onRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

type DatePreset = {
  label: string;
  range: { start: Date | null; end: Date | null };
};

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ onRangeChange }) => {
  const [open, setOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  // Get today with time set to beginning of day
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Get last 7 days
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 6);
  
  // Get last 30 days
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 29);
  
  // Create date presets
  const presets: DatePreset[] = [
    { label: 'Hoy', range: { start: today, end: null } },
    { label: 'Ayer', range: { start: yesterday, end: yesterday } },
    { label: 'Últimos 7 días', range: { start: last7Days, end: today } },
    { label: 'Últimos 30 días', range: { start: last30Days, end: today } },
    { label: 'Todos', range: { start: null, end: null } }
  ];
  
  const handlePresetSelect = (preset: DatePreset) => {
    setSelectedPreset(preset.label);
    setSelectedRange(preset.range);
    onRangeChange(preset.range);
    setOpen(false);
  };
  
  const handleCustomRangeSelect = (date: Date) => {
    // If no start date or there is already a full range, set start date
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: date, end: null });
      return;
    }
    
    // If start date is after the selected date, swap them
    if (selectedRange.start > date) {
      setSelectedRange({ start: date, end: selectedRange.start });
    } else {
      setSelectedRange({ start: selectedRange.start, end: date });
    }
  };
  
  const handleApplyCustomRange = () => {
    // Only apply if we have at least a start date
    if (selectedRange.start) {
      setSelectedPreset('Personalizado');
      onRangeChange(selectedRange);
      setOpen(false);
    }
  };
  
  const formatDateRange = () => {
    if (!selectedRange.start && !selectedRange.end) {
      return 'Todos';
    }
    
    if (selectedRange.start && !selectedRange.end) {
      return `Desde ${format(selectedRange.start, 'dd/MM/yyyy')}`;
    }
    
    if (selectedRange.start && selectedRange.end) {
      if (selectedRange.start.toDateString() === selectedRange.end.toDateString()) {
        return format(selectedRange.start, 'dd/MM/yyyy');
      }
      return `${format(selectedRange.start, 'dd/MM/yyyy')} - ${format(selectedRange.end, 'dd/MM/yyyy')}`;
    }
    
    return 'Seleccionar rango';
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-3 py-1.5 h-9 text-sm"
        >
          <CalendarIcon className="h-4 w-4" />
          <span className="max-w-[150px] truncate">{selectedPreset || formatDateRange()}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            <div className="flex">
              {/* Presets column */}
              <div className="border-r w-40">
                <div className="py-2 px-3 text-xs font-medium text-muted-foreground">
                  Rangos predefinidos
                </div>
                <div className="space-y-1 p-1">
                  {presets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm font-normal px-2 gap-2",
                        selectedPreset === preset.label && "bg-secondary"
                      )}
                      onClick={() => handlePresetSelect(preset)}
                    >
                      {selectedPreset === preset.label && (
                        <Check className="h-4 w-4" />
                      )}
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Calendar column */}
              <div className="p-1">
                <div className="py-2 px-3 text-xs font-medium text-muted-foreground">
                  Rango personalizado
                </div>
                <Calendar
                  mode="range"
                  selected={{
                    from: selectedRange.start || undefined,
                    to: selectedRange.end || undefined,
                  }}
                  onSelect={(range) => {
                    setSelectedRange({
                      start: range?.from || null,
                      end: range?.to || null,
                    });
                  }}
                  locale={es}
                  className="rounded-md border"
                />
                <div className="flex justify-end mt-2">
                  <Button 
                    size="sm" 
                    onClick={handleApplyCustomRange}
                    disabled={!selectedRange.start}
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangeFilter;
