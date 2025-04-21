import { useState } from "react";
import { FileText, Download, Trash2, Eye, Plus, FilePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DocumentPreview from "@/components/DocumentPreview";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  pages: number;
  storage_path: string;
}

interface DocumentListProps {
  documents: Document[];
  caseId: string;
  onDocumentAction?: (action: "delete" | "view" | "download", doc: Document) => void;
  onAddDocuments?: () => void;
}

const DocumentList = ({ documents, caseId, onDocumentAction, onAddDocuments }: DocumentListProps) => {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  const getFileTypeColor = (type: string) => {
    if (type.includes('pdf')) return "bg-red-100 text-red-800";
    if (type.includes('doc')) return "bg-blue-100 text-blue-800";
    if (type.includes('txt')) return "bg-gray-100 text-gray-800";
    return "bg-purple-100 text-purple-800";
  };
  
  const handleAction = (action: "delete" | "view" | "download", doc: Document) => {
    if (onDocumentAction) {
      onDocumentAction(action, doc);
    }
  };

  const getTotalPages = () => {
    return documents.reduce((sum, doc) => sum + doc.pages, 0);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Documents ({documents.length})</CardTitle>
        <Button onClick={onAddDocuments} className="h-9">
          <FilePlus className="mr-2 h-4 w-4" />
          Add Documents
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-muted/80">
            Total: {documents.length} files
          </Badge>
          <Badge variant="outline" className="bg-muted/80">
            {getTotalPages()} pages
          </Badge>
          <Badge variant="outline" className="bg-muted/80">
            {formatFileSize(documents.reduce((sum, doc) => sum + doc.size, 0))}
          </Badge>
        </div>
        
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Pages</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[200px]">{doc.name}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getFileTypeColor(doc.type)} font-normal`}>
                        {doc.type.split("/").pop()?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatFileSize(doc.size)}</TableCell>
                    <TableCell>{doc.pages}</TableCell>
                    <TableCell>{formatDate(doc.uploadDate)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
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
                          onClick={() => handleAction("download", doc)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:text-destructive"
                          onClick={() => handleAction("delete", doc)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No documents uploaded yet
                    <div className="mt-2">
                      <Button variant="outline" onClick={onAddDocuments} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Documents
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentList;
