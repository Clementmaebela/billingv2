import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type CourtType = Database["public"]["Enums"]["court_type"];
type CaseStatus = Database["public"]["Enums"]["case_status"];

interface CaseFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CaseForm = ({ initialData = {}, onSubmit, onCancel, isSubmitting = false }: CaseFormProps) => {
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    caseNumber: initialData.caseNumber || "",
    court: (initialData.court || "Magistrate") as CourtType,
    status: (initialData.status || "Active") as CaseStatus,
    fileDate: initialData.fileDate || new Date().toISOString().split('T')[0],
    scale: initialData.scale || (initialData.court === "High" ? "General" : "A"),
    description: initialData.description || "",
    clientId: initialData.clientId || "",
    clientName: initialData.clientName || "",
  });
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch clients from Supabase
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, name');
        
        if (error) throw error;
        setClients(data || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Case title is required";
    }
    
    if (!formData.caseNumber.trim()) {
      newErrors.caseNumber = "Case number is required";
    }
    
    if (!formData.clientId) {
      newErrors.clientId = "Client is required";
    }
    
    if (!formData.fileDate) {
      newErrors.fileDate = "File date is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle special case for court type change
    if (name === "court") {
      setFormData(prev => ({ 
        ...prev, 
        [name]: value as CourtType,
        // Reset scale when court type changes
        scale: value === "Magistrate" ? "A" : "General"
      }));
    } else if (name === "clientId" && value) {
      // When client is selected, update both clientId and clientName
      const selectedClient = clients.find(client => client.id === value);
      setFormData(prev => ({ 
        ...prev, 
        clientId: value,
        clientName: selectedClient ? selectedClient.name : ""
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm md:text-base">Case Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Smith vs. Jones"
            value={formData.title}
            onChange={handleChange}
            required
            className={cn("h-10 md:h-11", errors.title ? "border-red-500" : "")}
          />
          {errors.title && <p className="text-xs md:text-sm text-red-500">{errors.title}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="caseNumber" className="text-sm md:text-base">Case Number</Label>
          <Input
            id="caseNumber"
            name="caseNumber"
            placeholder="CV-2024-1234"
            value={formData.caseNumber}
            onChange={handleChange}
            required
            className={cn("h-10 md:h-11", errors.caseNumber ? "border-red-500" : "")}
          />
          {errors.caseNumber && <p className="text-xs md:text-sm text-red-500">{errors.caseNumber}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="court" className="text-sm md:text-base">Court</Label>
          <Select
            value={formData.court}
            onValueChange={(value) => handleChange({ target: { name: "court", value } } as any)}
          >
            <SelectTrigger className={cn("h-10 md:h-11", errors.court ? "border-red-500" : "")}>
              <SelectValue placeholder="Select court type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Magistrate">Magistrate Court</SelectItem>
              <SelectItem value="High">High Court</SelectItem>
            </SelectContent>
          </Select>
          {errors.court && <p className="text-xs md:text-sm text-red-500">{errors.court}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="scale" className="text-sm md:text-base">Scale</Label>
          <Select
            value={formData.scale}
            onValueChange={(value) => handleChange({ target: { name: "scale", value } } as any)}
          >
            <SelectTrigger className={cn("h-10 md:h-11", errors.scale ? "border-red-500" : "")}>
              <SelectValue placeholder="Select scale" />
            </SelectTrigger>
            <SelectContent>
              {formData.court === "Magistrate" ? (
                <>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Attorney">Attorney</SelectItem>
                  <SelectItem value="Candidate">Candidate Attorney</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          {errors.scale && <p className="text-xs md:text-sm text-red-500">{errors.scale}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm md:text-base">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange({ target: { name: "status", value } } as any)}
          >
            <SelectTrigger className={cn("h-10 md:h-11", errors.status ? "border-red-500" : "")}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          {errors.status && <p className="text-xs md:text-sm text-red-500">{errors.status}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="fileDate" className="text-sm md:text-base">File Date</Label>
          <Input
            id="fileDate"
            name="fileDate"
            type="date"
            value={formData.fileDate}
            onChange={handleChange}
            required
            className={cn("h-10 md:h-11", errors.fileDate ? "border-red-500" : "")}
          />
          {errors.fileDate && <p className="text-xs md:text-sm text-red-500">{errors.fileDate}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientId" className="text-sm md:text-base">Client</Label>
          <Select
            value={formData.clientId}
            onValueChange={(value) => {
              const selectedClient = clients.find(client => client.id === value);
              setFormData(prev => ({ 
                ...prev, 
                clientId: value,
                clientName: selectedClient ? selectedClient.name : ""
              }));
              if (errors.clientId) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.clientId;
                  return newErrors;
                });
              }
            }}
          >
            <SelectTrigger className={cn("h-10 md:h-11", errors.clientId ? "border-red-500" : "")}>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map(client => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.clientId && <p className="text-xs md:text-sm text-red-500">{errors.clientId}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm md:text-base">Description</Label>
        <textarea
          id="description"
          name="description"
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter case description..."
        />
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel} 
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? "Saving..." : "Save Case"}
        </Button>
      </div>
    </form>
  );
};

export default CaseForm;
