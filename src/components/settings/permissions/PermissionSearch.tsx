
import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PermissionSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const PermissionSearch: React.FC<PermissionSearchProps> = ({
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div className="flex items-center space-x-2 border rounded-md p-2 bg-muted/20 w-full">
      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
      <Input
        placeholder="Buscar permisos por nombre o descripción..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-8 p-0"
      />
      {searchTerm && (
        <Button 
          variant="ghost" 
          size="sm"
          className="h-5 w-5 p-0 shrink-0"
          onClick={() => setSearchTerm('')}
        >
          ✕
        </Button>
      )}
    </div>
  );
};

export default PermissionSearch;
