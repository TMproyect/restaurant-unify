
import React from 'react';
import { cn } from "@/lib/utils";

interface NavListProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const NavList = ({ title, children, className }: NavListProps) => {
  return (
    <div className={cn("px-3 py-2", className)}>
      {title && (
        <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
          {title}
        </h2>
      )}
      <nav className="space-y-1">
        {children}
      </nav>
    </div>
  );
};
