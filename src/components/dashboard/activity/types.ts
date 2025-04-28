
import { ActivityMonitorItem } from '@/types/dashboard.types';

export interface ActivityHeaderProps {
  activeFilter: string | null;
  setActiveFilter: (filter: string | null) => void;
  filters: { id: string; label: string; icon: JSX.Element }[];
}

export interface ActivityTabsProps {
  itemsCount: Record<string, number>;
}

export interface ActivityContentProps {
  isLoading: boolean;
  items: ActivityMonitorItem[];
  filteredItems: ActivityMonitorItem[];
  onActionClick?: (action: string) => void;
  activeFilter?: string | null;
}

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

export interface ActivityMonitorProps {
  items: ActivityMonitorItem[];
  isLoading: boolean;
  onActionClick?: (action: string) => void;
}

export interface ActivityPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface DateRangeFilterProps {
  onRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}
