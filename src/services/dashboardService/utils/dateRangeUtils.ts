
export const getTodayRange = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return {
    start: today,
    end: tomorrow
  };
};

export const isWithinToday = (date: Date | string): boolean => {
  const { start, end } = getTodayRange();
  const checkDate = new Date(date);
  return checkDate >= start && checkDate < end;
};

