import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentUpload from "@/components/DocumentUpload";
import type { ClientRow } from "@/services/clientService";

export interface ClientFormProps {
  onSubmit: (client: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<ClientRow>;
}

const ClientForm = ({ onSubmit, onCancel, isSubmitting = false, initialData = {} }: ClientFormProps) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    address: initialData.address || ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>Client Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUpload 
            caseId={initialData.id || ''} 
            onUploadComplete={(documents) => {
              // Handle document upload completion
              console.log('Documents uploaded:', documents);
            }}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {initialData.id ? "Updating..." : "Adding..."}
            </>
          ) : (
            initialData.id ? "Update Client" : "Add Client"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ClientForm;
