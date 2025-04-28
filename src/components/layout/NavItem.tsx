
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { usePermissions } from '@/hooks/use-permissions';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface NavItemProps {
  href: string;
  icon?: React.ReactNode;
  permission?: string;
  className?: string;
  children?: React.ReactNode;
  items?: {
    title: string;
    href: string;
    icon?: React.ReactNode;
    permission?: string;
  }[];
}

export const NavItem = ({ href, icon, permission, className, children, items }: NavItemProps) => {
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = location.pathname === href || 
                  (items && items.some(item => location.pathname === item.href));

  // Si se requiere permiso y el usuario no lo tiene, no renderizar
  if (permission && !hasPermission(permission)) {
    return null;
  }

  // Si tiene sub-items, renderizar como menú desplegable
  if (items && items.length > 0) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
            isActive && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
            className
          )}
        >
          <div className="flex items-center gap-3">
            {icon && (
              <span className="h-4 w-4">
                {icon}
              </span>
            )}
            <span>{children}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        {isOpen && (
          <div className="pl-6 space-y-1">
            {items.filter(subItem => {
              if (subItem.permission && !hasPermission(subItem.permission)) {
                return false;
              }
              return true;
            }).map((subItem) => (
              <Link
                key={subItem.href}
                to={subItem.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                  location.pathname === subItem.href && "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                )}
              >
                {subItem.icon && (
                  <span className="h-4 w-4">
                    {subItem.icon}
                  </span>
                )}
                <span>{subItem.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Renderizar como enlace normal
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
        {children}
      </span>
    </Link>
  );
};
