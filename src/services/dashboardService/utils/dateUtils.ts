
export const getYesterdayDateRange = (todayStart: Date): { start: Date; end: Date } => {
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  
  const yesterdayEnd = new Date(todayStart);
  
  return {
    start: yesterdayStart,
    end: yesterdayEnd
  };
};

export const getTodayDateRange = (): { start: Date; end: Date } => {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  
  return {
    start: todayStart,
    end: tomorrowStart
  };
};
