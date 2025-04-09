
import React, { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO, differenceInMinutes, differenceInSeconds } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, Flame } from 'lucide-react';

interface OrderTimerProps {
  createdAt: string;
  urgencyThresholdMinutes: number;
}

const OrderTimer: React.FC<OrderTimerProps> = ({ 
  createdAt, 
  urgencyThresholdMinutes 
}) => {
  const [elapsedTime, setElapsedTime] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  
  useEffect(() => {
    const calculateTime = () => {
      try {
        const createdDate = parseISO(createdAt);
        const now = new Date();
        
        // Calculate minutes and seconds for display
        const totalSeconds = differenceInSeconds(now, createdDate);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        
        setMinutes(mins);
        setSeconds(secs);
        setElapsedTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        
        // Check if urgent based on threshold
        const minutesPassed = differenceInMinutes(now, createdDate);
        setIsUrgent(minutesPassed >= urgencyThresholdMinutes);
        
      } catch (error) {
        console.error('Error calculating order time:', error);
        setElapsedTime('--:--');
      }
    };
    
    // Calculate immediately
    calculateTime();
    
    // Update every 30 seconds
    const interval = setInterval(calculateTime, 30000);
    
    return () => clearInterval(interval);
  }, [createdAt, urgencyThresholdMinutes]);
  
  // Determine styling based on urgency
  const getTimerStyles = () => {
    if (isUrgent) {
      return {
        containerClass: 'flex items-center gap-1 text-red-600 font-medium',
        iconClass: 'text-red-600'
      };
    }
    
    // Warning state (more than 75% of threshold)
    if (minutes >= urgencyThresholdMinutes * 0.75) {
      return {
        containerClass: 'flex items-center gap-1 text-yellow-600 font-medium',
        iconClass: 'text-yellow-600'
      };
    }
    
    // Normal state
    return {
      containerClass: 'flex items-center gap-1 text-gray-600',
      iconClass: 'text-gray-600'
    };
  };
  
  const styles = getTimerStyles();
  
  return (
    <div className={styles.containerClass}>
      {isUrgent ? (
        <Flame size={16} className="text-red-600 animate-pulse" />
      ) : (
        <Clock size={16} className={styles.iconClass} />
      )}
      <span>{elapsedTime}</span>
    </div>
  );
};

export default OrderTimer;
