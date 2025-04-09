
import React, { useState, useEffect } from 'react';
import { parseISO, differenceInSeconds } from 'date-fns';
import { Clock, Flame } from 'lucide-react';

interface OrderTimerProps {
  createdAt: string;
  urgencyThresholdMinutes: number;
}

const OrderTimer: React.FC<OrderTimerProps> = ({ 
  createdAt, 
  urgencyThresholdMinutes 
}) => {
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  
  useEffect(() => {
    const calculateTime = () => {
      try {
        const createdDate = parseISO(createdAt);
        const now = new Date();
        
        // Calculate total seconds elapsed
        const totalSeconds = differenceInSeconds(now, createdDate);
        setSecondsElapsed(totalSeconds);
        
        // Format as MM:SS
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        setElapsedTime(
          `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
        
        // Check urgency levels based on threshold
        const urgencyThresholdSeconds = urgencyThresholdMinutes * 60;
        const warningThresholdSeconds = urgencyThresholdSeconds * 0.7;
        
        setIsUrgent(totalSeconds >= urgencyThresholdSeconds);
        setIsWarning(totalSeconds >= warningThresholdSeconds && totalSeconds < urgencyThresholdSeconds);
        
      } catch (error) {
        console.error('Error calculating order time:', error);
        setElapsedTime('--:--');
      }
    };
    
    // Calculate immediately
    calculateTime();
    
    // Update every second for a smoother timer
    const interval = setInterval(calculateTime, 1000);
    
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
    
    // Warning state (more than 70% of threshold)
    if (isWarning) {
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
      <span className="font-mono">{elapsedTime}</span>
    </div>
  );
};

export default OrderTimer;
