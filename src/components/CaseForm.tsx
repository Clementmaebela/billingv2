import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title">Case Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Smith vs. Jones"
            value={formData.title}
            onChange={handleChange}
            required
            className={errors.title ? "border-red-500" : ""}
          />
          {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="caseNumber">Case Number</Label>
          <Input
            id="caseNumber"
            name="caseNumber"
            placeholder="CV-2024-1234"
            value={formData.caseNumber}
            onChange={handleChange}
            required
            className={errors.caseNumber ? "border-red-500" : ""}
          />
          {errors.caseNumber && <p className="text-sm text-red-500">{errors.caseNumber}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="court">Court</Label>
          <select
            id="court"
            name="court"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.court}
            onChange={handleChange}
            required
          >
            <option value="Magistrate">Magistrate Court</option>
            <option value="High">High Court</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="scale">Scale</Label>
          <select
            id="scale"
            name="scale"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.scale}
            onChange={handleChange}
            required
          >
            {formData.court === "Magistrate" ? (
              <>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </>
            ) : (
              <>
                <option value="General">General</option>
                <option value="Attorney">Attorney</option>
                <option value="Candidate">Candidate Attorney</option>
              </>
            )}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fileDate">File Date</Label>
          <Input
            id="fileDate"
            name="fileDate"
            type="date"
            value={formData.fileDate}
            onChange={handleChange}
            required
            className={errors.fileDate ? "border-red-500" : ""}
          />
          {errors.fileDate && <p className="text-sm text-red-500">{errors.fileDate}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientId">Client</Label>
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
            <SelectTrigger className={errors.clientId ? "border-red-500" : ""}>
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
          {errors.clientId && <p className="text-sm text-red-500">{errors.clientId}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter case description..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Case"}
        </Button>
      </div>
    </form>
  );
};

export default CaseForm;
