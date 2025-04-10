
import { ActivityMonitorItem } from '@/types/dashboard.types';

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
  filters: Array<{id: string; label: string; icon: React.ReactNode}>;
}

export interface ActionButtonsProps {
  actions: string[];
  onActionClick?: (action: string) => void;
}
