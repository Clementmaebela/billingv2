import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CaseForm from "@/components/CaseForm";
import { createCase } from "@/services/caseService";
import { useToast } from "@/hooks/use-toast";
import type { CaseFormData } from "@/services/caseService";
import DocumentUpload from "@/components/DocumentUpload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationsContext";

export default function NewCase() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCaseId, setNewCaseId] = useState<string | null>(null);

  const handleSubmit = async (formData: CaseFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Starting case submission with data:", formData);

      // Create the case using our service
      const newCase = await createCase(formData);
      console.log("Case created successfully:", newCase);
      
      // Store the new case ID for document upload
      setNewCaseId(newCase.id);

      // Add notification
      addNotification({
        title: "New Case Created",
        description: `Case "${formData.title}" has been created successfully.`,
        type: "success"
      });

      // Show success message
      toast({
        title: "Success",
        description: "Case created successfully. You can now upload documents.",
      });
    } catch (error) {
      console.error("Error creating case:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create case",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadComplete = (documents: any[]) => {
    toast({
      title: "Success",
      description: `${documents.length} document(s) uploaded successfully`,
    });
    // Navigate to the cases list after successful upload
    navigate("/cases");
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">New Case</h1>
        <div className="flex gap-2">
          <Button
            variant="default"
            onClick={() => navigate("/cases")}
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90"
          >
            Bill Existing Case
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/cases")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <CaseForm 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting}
            onCancel={() => navigate("/cases")}
          />
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {newCaseId ? (
                <DocumentUpload 
                  caseId={newCaseId} 
                  onUploadComplete={handleUploadComplete}
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Create the case first to upload documents.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
