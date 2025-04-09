
import { ActivityMonitorItem } from '@/types/dashboard.types';

export interface ActionButtonsProps {
  actions: string[];
  onActionClick?: (action: string) => void;
}

export interface ActivityMonitorProps {
  items: ActivityMonitorItem[];
  isLoading: boolean;
  onRefresh?: () => void;
  onActionClick?: (action: string) => void;
}

export interface FilterProps {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

export interface FilterDropdownProps {
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
  filters: FilterProps[];
}

export interface ActivityTableProps {
  filteredItems: ActivityMonitorItem[];
  onActionClick?: (action: string) => void;
}

// Add the missing interfaces
export interface EmptyStateProps {
  message?: string;
}

export interface StatusBadgeProps {
  status: string;
  isDelayed?: boolean;
}
