import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Upload, 
  FileText, 
  Download, 
  Trash, 
  Loader2,
  Eye
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DocumentPreview from "@/components/DocumentPreview";

interface Document {
  id: string;
  name: string;
  storage_path: string;
  size: number;
  pages: number;
  type: string | null;
  upload_date: string;
  case_id: string;
}

interface ClientDocumentsProps {
  clientId: string;
}

const ClientDocuments = ({ clientId }: ClientDocumentsProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [clientId]);

  const fetchDocuments = async () => {
    try {
      // First get all cases for this client
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')
        .eq('client_id', clientId);

      if (casesError) throw casesError;

      if (!cases || cases.length === 0) {
        setDocuments([]);
        setIsLoading(false);
        return;
      }

      // Then get all documents for these cases
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .in('case_id', cases.map(c => c.id))
        .order('upload_date', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !clientId) return;

    setIsUploading(true);
    try {
      // First get a case for this client
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('id')
        .eq('client_id', clientId)
        .limit(1);

      if (casesError) throw casesError;

      if (!cases || cases.length === 0) {
        toast.error('No case found for this client');
        return;
      }

      const caseId = cases[0].id;

      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${caseId}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Create document record
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          case_id: caseId,
          name: selectedFile.name,
          storage_path: fileName,
          size: selectedFile.size,
          type: selectedFile.type,
          pages: 1, // Default to 1 page, can be updated later if needed
        });

      if (dbError) throw dbError;

      toast.success('Document uploaded successfully');
      setSelectedFile(null);
      fetchDocuments();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (documentId: string, storagePath: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    setIsDeleting(true);
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([storagePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileUrl = async (storagePath: string) => {
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(storagePath);
    return data.publicUrl;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Documents</CardTitle>
          <CardDescription>Manage client documents</CardDescription>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Upload className="mr-2 h-4 w-4" /> Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Document</DialogTitle>
              <DialogDescription>
                Select a file to upload for this client
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              />
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Pages</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : documents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                  No documents found
                </TableCell>
              </TableRow>
            ) : (
              documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-gray-500" />
                      {doc.name}
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(doc.size)}</TableCell>
                  <TableCell>{doc.pages}</TableCell>
                  <TableCell>
                    {new Date(doc.upload_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedDoc(doc)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>{selectedDoc?.name}</DialogTitle>
                          </DialogHeader>
                          <div className="h-[70vh]">
                            {selectedDoc && (
                              <DocumentPreview docData={selectedDoc} />
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={async () => {
                          const url = await getFileUrl(doc.storage_path);
                          window.open(url, '_blank');
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id, doc.storage_path)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ClientDocuments; 