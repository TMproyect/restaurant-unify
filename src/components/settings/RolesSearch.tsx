
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface RolesSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const RolesSearch: React.FC<RolesSearchProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="flex items-center w-full sm:w-auto space-x-2 border rounded-md px-3 py-2 flex-1 max-w-sm">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Buscar roles..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-0"
      />
      {searchTerm && (
        <Button 
          variant="ghost" 
          size="sm"
          className="h-5 w-5 p-0"
          onClick={() => onSearchChange('')}
        >
          ✕
        </Button>
      )}
    </div>
  );
};

export default RolesSearch;
