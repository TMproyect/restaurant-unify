import React from 'react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/contexts/auth/types';

// Role-specific colors
const roleColors: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  waiter: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  kitchen: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  manager: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  owner: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
};

interface AvatarProps {
  name: string;
  role?: UserRole;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  role,
  src,
  size = 'md',
  className,
}) => {
  // Get initials from name
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };
  
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-medium',
        sizeClasses[size],
        role && roleColors[role],
        !role && 'bg-primary/10 text-primary dark:bg-primary/20',
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        initials
      )}
    </div>
  );
};

interface AvatarGroupProps {
  users: { name: string; role?: UserRole; src?: string }[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 5,
  size = 'md',
}) => {
  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;
  
  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user, index) => (
        <Avatar
          key={index}
          name={user.name}
          role={user.role}
          src={user.src}
          size={size}
          className="border-2 border-background"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-medium border-2 border-background bg-muted text-muted-foreground',
            size === 'sm' && 'w-8 h-8 text-xs',
            size === 'md' && 'w-10 h-10 text-sm',
            size === 'lg' && 'w-14 h-14 text-lg'
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};
