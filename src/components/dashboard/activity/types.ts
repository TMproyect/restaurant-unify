
import { ReactNode } from 'react';

export interface FilterType {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface FilterDropdownProps {
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
  filters: FilterType[];
}

export interface StatusBadgeProps {
  status: string;
  isDelayed?: boolean;
}

export interface ActionButtonsProps {
  actions: string[];
  onActionClick?: (action: string) => void;
}

export interface ActivityTableProps {
  filteredItems: any[];
  onActionClick?: (action: string) => void;
}

export interface ActivityMonitorProps {
  items: any[];
  isLoading: boolean;
  onActionClick?: (action: string) => void;
}

export interface EmptyStateProps {
  filter: string | null;
}
