
import { ActivityMonitorItem } from '@/types/dashboard.types';
import { ReactNode } from 'react';

export interface ActivityMonitorProps {
  items: ActivityMonitorItem[];
  isLoading: boolean;
  onActionClick?: (action: string) => void;
}

export interface ActivityTableProps {
  filteredItems: ActivityMonitorItem[];
  onActionClick?: (action: string) => void;
}

export interface ActivityHeaderProps {
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
  filters: FilterType[];
}

export interface ActionButtonsProps {
  actions: string[];
  onActionClick?: (action: string) => void;
}

export interface StatusBadgeProps {
  status: string;
  isDelayed?: boolean;
}

export interface EmptyStateProps {
  filter: string | null;
}

export interface FilterDropdownProps {
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
  filters: FilterType[];
}

export interface FilterType {
  id: string;
  label: string;
  icon: ReactNode;
}
