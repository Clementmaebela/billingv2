import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, File, FileText, User, Upload, Loader2, Trash2, Calendar, Scale, Hash } from "lucide-react";
import DocumentUpload from "@/components/DocumentUpload";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getCaseById, updateCase, deleteCase } from "@/services/caseService";
import { useToast } from "@/hooks/use-toast";
import type { CaseRow } from "@/services/caseService";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const CaseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [caseData, setCaseData] = useState<CaseRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await getCaseById(id);
        if (!data) {
          toast({
            title: "Error",
            description: "Case not found",
            variant: "destructive",
          });
          navigate("/cases");
          return;
        }
        setCaseData(data);
        
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
        console.error("Error fetching case:", error);
        toast({
          title: "Error",
          description: "Failed to load case details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCase();
  }, [id, navigate, toast]);

  const handleBack = () => {
    navigate("/cases");
  };

  const handleEdit = () => {
    navigate(`/cases/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      // First, delete all associated documents from storage
      const documentPaths = documents.map(doc => doc.storage_path);
      if (documentPaths.length > 0) {
        const { error: storageError } = await supabase
          .storage
          .from('documents')
          .remove(documentPaths);
        
        if (storageError) throw storageError;
      }
      
      // Then delete the documents from the database
      const { error: docsError } = await supabase
        .from('documents')
        .delete()
        .eq('case_id', id);
      
      if (docsError) throw docsError;
      
      // Finally, delete the case
      await deleteCase(id);
      
      toast({
        title: "Success",
        description: "Case deleted successfully",
      });
      
      navigate("/cases");
    } catch (error) {
      console.error("Error deleting case:", error);
      toast({
        title: "Error",
        description: "Failed to delete case",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const goToInvoiceGenerator = () => {
    navigate("/invoice-generator", { 
      state: { 
        caseId: id,
        clientId: caseData?.client_id 
      } 
    });
  };

  const goToDocuments = () => {
    navigate(`/cases/${id}/documents`);
  };

  const updateFilePagesCount = async (totalPages: number) => {
    if (!id || !caseData) return;
    
    try {
      // Update the case's file_pages field in the database
      await updateCase(id, { filePages: totalPages });
      
      // Update the local state
      setCaseData(prev => prev ? {
        ...prev,
        file_pages: totalPages
      } : null);
      
      toast({
        title: "Success",
        description: "File pages count updated",
      });
    } catch (error) {
      console.error("Error updating file pages count:", error);
      toast({
        title: "Error",
        description: "Failed to update file pages count",
        variant: "destructive",
      });
    }
  };

  const handleUploadComplete = async (newDocuments: any[]) => {
    // Update the documents state
    setDocuments(prev => [...newDocuments, ...prev]);
    setIsUploaderOpen(false);
    
    // Calculate total pages from all documents
    const totalPages = [...documents, ...newDocuments].reduce((sum, doc) => sum + doc.pages, 0);
    
    // Update the case's file_pages field in the database
    await updateFilePagesCount(totalPages);
    
    toast({
      title: "Success",
      description: `${newDocuments.length} document(s) uploaded successfully`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-4">Case Not Found</h2>
        <p className="mb-4 text-muted-foreground">The case you are looking for does not exist.</p>
        <Button onClick={handleBack}>Back to Cases</Button>
      </div>
    );
  }

  // Calculate total pages from documents
  const totalPages = documents.reduce((sum, doc) => sum + doc.pages, 0);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{caseData.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">Case #{caseData.case_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Case
          </Button>
          <Button 
            variant="default" 
            onClick={goToInvoiceGenerator}
            className="bg-primary hover:bg-primary/90"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Invoice
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Case
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this case?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the case
                  and all associated documents.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Case"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Case Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Case Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Court Type</h3>
                  <p className="mt-1">{caseData.court}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Scale</h3>
                  <p className="mt-1">{caseData.scale}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">File Pages</h3>
                  <p className="mt-1">{totalPages} pages</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                  <p className="mt-1">
                    {new Date(caseData.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client Information Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{caseData.clients?.name}</p>
                <Link 
                  to={`/clients/${caseData.client_id}`} 
                  className="text-sm text-blue-600 hover:underline inline-flex items-center"
                >
                  View Client Details
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Documents Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {documents.length || 0} document(s) attached to this case
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => setIsUploaderOpen(true)} variant="secondary">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                  <Button onClick={goToDocuments}>
                    <File className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Document Upload Sheet */}
      <Sheet open={isUploaderOpen} onOpenChange={setIsUploaderOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Upload Documents</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
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

export default CaseDetail;
