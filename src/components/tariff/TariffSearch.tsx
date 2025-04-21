
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface TariffSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const TariffSearch = ({ searchTerm, onSearchChange }: TariffSearchProps) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <Search className="h-5 w-5 text-gray-500" />
      <Input 
        placeholder="Search tariff items..." 
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-grow"
      />
    </div>
  );
};

export default TariffSearch;
