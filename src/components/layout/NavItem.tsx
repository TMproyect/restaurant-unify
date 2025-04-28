
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { usePermissions } from '@/hooks/use-permissions';

interface NavItemProps {
  href: string;
  icon?: React.ReactNode;
  permission?: string;
  className?: string;
}

export const NavItem = ({ href, icon, permission, className }: NavItemProps) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const isActive = location.pathname === href;

  // If permission is required and user doesn't have it, don't render
  if (permission && !hasPermission(permission)) {
    return null;
  }

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
        isActive && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
        className
      )}
    >
      {icon && (
        <span className="h-4 w-4">
          {icon}
        </span>
      )}
      <span>
        {href.split('/').pop()?.charAt(0).toUpperCase() + href.split('/').pop()?.slice(1)}
      </span>
    </Link>
  );
};
