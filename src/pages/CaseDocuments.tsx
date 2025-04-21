import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import DocumentList from "@/components/DocumentList";
import DocumentUpload from "@/components/DocumentUpload";
import { supabase } from "@/integrations/supabase/client";

const CaseDocuments = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<any>(null);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch the case data
        const { data: caseResult, error: caseError } = await supabase
          .from('cases')
          .select('*, clients(name)')
          .eq('id', id)
          .maybeSingle();
        
        if (caseError) {
          throw caseError;
        }
        
        if (!caseResult) {
          toast.error("Case not found");
          navigate('/cases');
          return;
        }
        
        setCaseData(caseResult);
        
        // Fetch documents for this case
        const { data: docsResult, error: docsError } = await supabase
          .from('documents')
          .select('*')
          .eq('case_id', id)
          .order('upload_date', { ascending: false });
        
        if (docsError) {
          throw docsError;
        }
        
        setDocuments(docsResult || []);
      } catch (error) {
        console.error("Error fetching case data:", error);
        toast.error("Error loading case documents");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleDocumentAction = async (action: string, doc: any) => {
    if (action === "delete") {
      try {
        // Delete from the database
        const { error } = await supabase
          .from('documents')
          .delete()
          .eq('id', doc.id);
        
        if (error) throw error;
        
        // Update the UI
        setDocuments(prev => prev.filter(d => d.id !== doc.id));
        toast.success(`Document "${doc.name}" deleted`);
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error("Failed to delete document");
      }
    } else if (action === "download") {
      toast.info(`Downloading "${doc.name}"...`);
      // In a real app, you would implement actual file download here
    } else if (action === "view") {
      // View action is handled by the Dialog component
    }
  };

  const handleUploadComplete = (newDocuments: any[]) => {
    // In a real app, we would insert these documents into the database
    setDocuments(prev => [...newDocuments, ...prev]);
    setIsUploaderOpen(false);
    
    // For each new document, insert into the database
    newDocuments.forEach(async (doc) => {
      try {
        const { error } = await supabase
          .from('documents')
          .insert({
            case_id: id as string,
            name: doc.name,
            size: doc.size,
            pages: doc.pages,
            type: doc.type,
            storage_path: doc.storage_path // Use the actual storage path from the uploaded document
          });
        
        if (error) throw error;
      } catch (error) {
        console.error("Error saving document:", error);
        // We don't show an error toast here to avoid multiple toasts
      }
    });
    
    if (newDocuments.length > 0) {
      toast.success(`${newDocuments.length} document(s) uploaded successfully`);
    }
  };

  const goToCaseDetails = () => {
    navigate(`/cases/${id}`);
  };
  
  const goToInvoiceGenerator = () => {
    // Navigate to invoice generator with case data
    navigate("/invoice-generator", { 
      state: { 
        caseId: id,
        documents: documents
      } 
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p>Loading case documents...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <p className="text-xl font-semibold mb-4">Case not found</p>
          <Button onClick={() => navigate("/cases")}>Back to Cases</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={goToCaseDetails}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Case
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{caseData.title} - Documents</h1>
        </div>
        <Button onClick={goToInvoiceGenerator}>
          Generate Invoice
        </Button>
      </div>
      
      <DocumentList 
        documents={documents} 
        caseId={id || ''}
        onDocumentAction={handleDocumentAction}
        onAddDocuments={() => setIsUploaderOpen(true)}
      />

      {/* Document upload sheet */}
      <Sheet open={isUploaderOpen} onOpenChange={setIsUploaderOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Upload Documents</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <DocumentUpload 
              caseId={id || ''} 
              onUploadComplete={handleUploadComplete} 
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CaseDocuments;
