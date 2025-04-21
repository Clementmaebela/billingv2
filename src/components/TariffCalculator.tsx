import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { TariffItem, getMagistrateTariffs, getHighCourtTariffs } from "@/utils/tariffData";
import CaseSummary from "@/components/tariff/CaseSummary";
import TariffItemsTable from "@/components/tariff/TariffItemsTable";
import TariffSearch from "@/components/tariff/TariffSearch";

interface TariffCalculatorProps {
  caseInfo: any;
  onCalculate: (tariffs: any[], total: number) => void;
  onBack: () => void;
  isEditing?: boolean;
  existingInvoice?: {
    id: string;
    items: {
      description: string;
      quantity: number;
      unit_price: number;
      total: number;
    }[];
  };
}

const TariffCalculator = ({ 
  caseInfo, 
  onCalculate, 
  onBack,
  isEditing = false,
  existingInvoice 
}: TariffCalculatorProps) => {
  const [tariffItems, setTariffItems] = useState<TariffItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<TariffItem[]>([]);
  const navigate = useNavigate();

  // Initialize tariff items based on court type and scale
  useEffect(() => {
    let items: TariffItem[] = [];
    
    if (caseInfo.court === "magistrate") {
      items = getMagistrateTariffs(caseInfo.scale, caseInfo.filePages);
    } else {
      items = getHighCourtTariffs(caseInfo.scale, caseInfo.filePages);
    }
    
    // If editing an existing invoice, update the items with the existing data
    if (isEditing && existingInvoice) {
      items = items.map(item => {
        const existingItem = existingInvoice.items.find(
          existing => existing.description === item.description
        );
        if (existingItem) {
          return {
            ...item,
            selected: true,
            quantity: existingItem.quantity,
            rate: existingItem.unit_price,
            totalAmount: existingItem.total
          };
        }
        return item;
      });
    }
    
    setTariffItems(items);
    setFilteredItems(items);
  }, [caseInfo.court, caseInfo.scale, caseInfo.filePages, isEditing, existingInvoice]);

  // Filter items when search term changes
  useEffect(() => {
    const filtered = tariffItems.filter(item => 
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, tariffItems]);

  const handleToggleItem = (id: string) => {
    setTariffItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, selected: !item.selected } 
          : item
      )
    );
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) quantity = 1;
    
    setTariffItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { 
              ...item, 
              quantity, 
              totalAmount: Number((quantity * item.rate).toFixed(2)) 
            } 
          : item
      )
    );
  };

  const handleRateChange = (id: string, newRate: number) => {
    if (newRate < 0) newRate = 0;
    
    setTariffItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { 
              ...item, 
              rate: newRate, 
              totalAmount: Number((item.quantity * newRate).toFixed(2)) 
            } 
          : item
      )
    );
  };

  const handleCalculate = () => {
    const selectedItems = tariffItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      toast.error("Please select at least one tariff item");
      return;
    }
    
    const total = selectedItems.reduce((sum, item) => sum + item.totalAmount, 0);
    
    if (isEditing) {
      // Redirect to invoice generator with the updated items
      navigate('/invoice-generator', {
        state: {
          caseId: caseInfo.caseId,
          invoiceId: existingInvoice?.id,
          tariffs: selectedItems,
          total
        }
      });
    } else {
      onCalculate(selectedItems, total);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {isEditing ? "Edit Invoice" : "Generate Invoice"}
        </h2>
        <TariffSearch 
          searchTerm={searchTerm} 
          onSearchChange={setSearchTerm} 
        />
      </div>
      
      <CaseSummary caseInfo={caseInfo} />
      
      <TariffItemsTable 
        items={filteredItems}
        onToggleItem={handleToggleItem}
        onQuantityChange={handleQuantityChange}
        onRateChange={handleRateChange}
      />
      
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={handleCalculate}>
          {isEditing ? "Update Invoice" : "Generate Invoice"}
        </Button>
      </div>
    </div>
  );
};

export default TariffCalculator;
