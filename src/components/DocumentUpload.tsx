import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Paperclip, FileText, X, Upload, File } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import * as pdfjs from 'pdfjs-dist';
import { supabase } from "@/integrations/supabase/client";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentUploadProps {
  caseId: string;
  onUploadComplete?: (documents: any[]) => void;
  compact?: boolean;
}

const DocumentUpload = ({ caseId, onUploadComplete, compact = false }: DocumentUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getPDFPageCount = async (file: File): Promise<number> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      return pdf.numPages;
    } catch (error) {
      console.error("Error counting PDF pages:", error);
      return 1; // Default to 1 page if there's an error
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Process each file and upload to storage
      const processedFiles = await Promise.all(
        files.map(async (file, index) => {
          const progress = Math.round((index / files.length) * 100);
          setProgress(progress);

          // Generate a unique storage path
          const fileExt = file.name.split('.').pop();
          const fileName = `${caseId}/${Date.now()}-${index}.${fileExt}`;
          
          // Upload file to Supabase storage
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('documents')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          let pages = 1;
          if (file.type === 'application/pdf') {
            pages = await getPDFPageCount(file);
          }

          return {
            id: `doc-${Date.now()}-${index}`,
            name: file.name,
            size: file.size,
            type: file.type,
            caseId,
            uploadDate: new Date().toISOString(),
            pages,
            storage_path: fileName,
          };
        })
      );

      setProgress(100);
      setFiles([]);
      
      toast.success(`${files.length} document(s) uploaded successfully`);
      
      if (onUploadComplete) {
        onUploadComplete(processedFiles);
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Error processing files");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
          <Paperclip className="mr-2 h-4 w-4" />
          Select Files
        </Button>
        <Input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
        />
        <Button 
          onClick={handleUpload} 
          disabled={files.length === 0 || uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
      
      {uploading && (
        <div className="space-y-2">
          <Label>Uploading...</Label>
          <Progress value={progress} />
        </div>
      )}
      
      {files.length > 0 && (
        <div>
          <Label>Selected Files ({files.length})</Label>
          <div className="mt-2 space-y-2">
            {files.map((file, index) => (
              <Card key={index} className="bg-muted/40">
                <CardContent className="p-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
