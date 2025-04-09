
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DeliverySearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const DeliverySearch = ({ searchQuery, setSearchQuery }: DeliverySearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Buscar por cliente o dirección..."
        className="pl-8 mb-4"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default DeliverySearch;
