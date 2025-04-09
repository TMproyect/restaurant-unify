
import { ActivityMonitorItem } from '@/types/dashboard.types';

export interface ActivityTableProps {
  filteredItems: ActivityMonitorItem[];
  onActionClick?: (action: string) => void;
}

export interface StatusBadgeProps {
  status: string;
  isDelayed?: boolean;
}

export interface ActionButtonsProps {
  actions: string[];
  onActionClick?: (action: string) => void;
}

export interface FilterDropdownProps {
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
  filters: FilterType[];
}

export interface FilterType {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface EmptyStateProps {
  message?: string;
}

export interface ActivityMonitorProps {
  items: ActivityMonitorItem[];
  isLoading: boolean;
  onRefresh?: () => void;
  onActionClick?: (action: string) => void;
}
