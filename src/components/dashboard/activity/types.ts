
import { ActivityMonitorItem } from '@/types/dashboard.types';

export interface StatusBadgeProps {
  status: string;
}

export interface ActionButtonsProps {
  actions: ActivityMonitorItem['actions'];
  onActionClick: (action: string) => void;
}

export interface FilterDropdownProps {
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
  filters: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }[];
}

export interface ActivityTableProps {
  filteredItems: ActivityMonitorItem[];
  onActionClick: (action: string) => void;
}

export interface EmptyStateProps {
  message?: string;
}

export interface ActivityMonitorProps {
  items: ActivityMonitorItem[];
  isLoading: boolean;
  onRefresh: () => void;
  onActionClick: (action: string) => void;
}
