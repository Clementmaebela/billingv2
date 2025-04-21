import { useState, useEffect } from "react";
import { FileText, Loader2, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import * as pdfjs from 'pdfjs-dist';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentPreviewProps {
  docData: {
    id: string;
    name: string;
    type: string;
    storage_path: string;
  };
}

const DocumentPreview = ({ docData }: DocumentPreviewProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfPages, setPdfPages] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [scale, setScale] = useState(0.75);
  const [rotation, setRotation] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      if (!docData?.storage_path) {
        setError("No storage path provided for document");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get a signed URL for the document
        const { data, error: signedUrlError } = await supabase
          .storage
          .from('documents')
          .createSignedUrl(docData.storage_path, 3600); // URL valid for 1 hour

        if (signedUrlError) {
          throw signedUrlError;
        }

        if (docData.type === 'application/pdf') {
          // Load PDF document
          const loadingTask = pdfjs.getDocument(data.signedUrl);
          const pdf = await loadingTask.promise;
          setPdfDoc(pdf);
          setCurrentPage(1);
        } else if (docData.type.startsWith('image/')) {
          // Handle image files
          setPreviewUrl(data.signedUrl);
        } else if (docData.type === 'text/plain') {
          // Handle text files
          const response = await fetch(data.signedUrl);
          const text = await response.text();
          setPreviewContent(text);
        } else {
          setError(`Unsupported file type: ${docData.type}`);
        }
      } catch (err) {
        console.error('Error loading document:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document preview');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();

    // Cleanup function to revoke object URLs
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [docData]);

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc) return;
    
    try {
      const page = await pdfDoc.getPage(pageNum);
      const canvas = document.getElementById('pdf-canvas') as HTMLCanvasElement;
      const context = canvas.getContext('2d');
      
      const viewport = page.getViewport({ scale, rotation });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context!,
        viewport: viewport
      }).promise;
      
      setCurrentPage(pageNum);
    } catch (err) {
      console.error("Error rendering PDF page:", err);
      setError("Failed to render PDF page");
    }
  };

  const handlePageChange = async (pageNum: number) => {
    await renderPage(pageNum);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
    renderPage(currentPage);
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
    renderPage(currentPage);
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
    renderPage(currentPage);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (docData.type.includes('pdf')) {
    return (
      <div className="h-full flex flex-col items-center">
        <div className="mb-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {currentPage} of {pdfPages.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pdfPages.length}
          >
            Next
          </Button>
          <div className="ml-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              disabled={scale >= 3}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRotate}
            >
              <RotateCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          <canvas id="pdf-canvas" className="mx-auto" />
        </div>
      </div>
    );
  }

  if (docData.type.includes('image') && previewUrl) {
    return (
      <div className="h-full flex items-center justify-center">
        <img 
          src={previewUrl} 
          alt={docData.name}
          className="max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  if (docData.type.includes('text') && previewContent) {
    return (
      <div className="h-full overflow-auto p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {previewContent}
        </pre>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-4">
      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
      <p className="text-muted-foreground">Preview not available for this file type</p>
    </div>
  );
};

export default DocumentPreview; 