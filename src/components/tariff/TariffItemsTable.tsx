import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, Edit2 } from "lucide-react";
import { TariffItem } from "@/utils/tariffData";

interface TariffItemsTableProps {
  items: TariffItem[];
  onToggleItem: (id: string) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onRateChange: (id: string, rate: number) => void;
}

const TariffItemsTable = ({ 
  items, 
  onToggleItem, 
  onQuantityChange, 
  onRateChange 
}: TariffItemsTableProps) => {
  return (
    <ScrollArea className="h-[400px] border rounded-md">
      <div className="p-2 md:p-4 space-y-4 md:space-y-6">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-muted-foreground border-b">
              <th className="pb-2 text-left">Select</th>
              <th className="pb-2 text-left hidden sm:table-cell">ID</th>
              <th className="pb-2 text-left">Description</th>
              <th className="pb-2 text-left hidden md:table-cell">Unit</th>
              <th className="pb-2 text-left">Rate (R)</th>
              <th className="pb-2 text-left">Qty</th>
              <th className="pb-2 text-left">Total (R)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className={`hover:bg-muted/50 ${item.selected ? "bg-muted/30" : ""}`}>
                <td className="py-2 md:py-3">
                  <Checkbox 
                    checked={item.selected} 
                    onCheckedChange={() => onToggleItem(item.id)}
                  />
                </td>
                <td className="py-2 md:py-3 text-sm font-medium hidden sm:table-cell">{item.id}</td>
                <td className="py-2 md:py-3 text-sm">{item.description}</td>
                <td className="py-2 md:py-3 text-sm hidden md:table-cell">{item.unit}</td>
                <td className="py-2 md:py-3 text-sm">
                  <div className="flex items-center space-x-1">
                    <Input 
                      type="number" 
                      value={item.rate.toFixed(2)} 
                      onChange={(e) => item.selected && onRateChange(item.id, parseFloat(e.target.value) || 0)}
                      disabled={!item.selected}
                      className="w-16 md:w-20 h-7 text-sm"
                      step="0.01"
                    />
                    <Edit2 className={`h-3 w-3 ${item.selected ? 'text-muted-foreground' : 'text-muted-foreground/30'}`} />
                  </div>
                </td>
                <td className="py-2 md:py-3 text-sm">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => item.selected && onQuantityChange(item.id, item.quantity - 1)}
                      disabled={!item.selected || item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <Input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => item.selected && onQuantityChange(item.id, parseInt(e.target.value) || 1)}
                      disabled={!item.selected}
                      className="w-12 md:w-16 h-7 text-sm"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => item.selected && onQuantityChange(item.id, item.quantity + 1)}
                      disabled={!item.selected}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
                <td className="py-2 md:py-3 text-sm">
                  {item.selected ? item.totalAmount.toFixed(2) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ScrollArea>
  );
};

export default TariffItemsTable;
