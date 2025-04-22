import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ArrowLeft, FileText, Save, CheckCircle, Edit2, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from 'html2pdf.js';
import { createInvoice, updateInvoice } from "@/services/invoiceService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import TariffCalculator from "./TariffCalculator";
import { Badge } from "@/components/ui/badge";

interface InvoicePreviewProps {
  caseInfo: any;
  selectedTariffs: any[];
  totalAmount: number;
  onBack: () => void;
  isEditing?: boolean;
  invoiceId?: string;
}

const InvoicePreview = ({ 
  caseInfo, 
  selectedTariffs, 
  totalAmount, 
  onBack, 
  isEditing = false,
  invoiceId 
}: InvoicePreviewProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<"Pending" | "Paid" | "Overdue">("Pending");
  const [isEditingMode, setIsEditingMode] = useState(isEditing);
  const [editedCaseInfo, setEditedCaseInfo] = useState(caseInfo);
  const [editedTariffs, setEditedTariffs] = useState(selectedTariffs);
  const [editedTotalAmount, setEditedTotalAmount] = useState(totalAmount);
  const [showCalculator, setShowCalculator] = useState(isEditing);
  const [invoiceNumber, setInvoiceNumber] = useState<string>("");
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const currentDate = format(new Date(), "dd MMMM yyyy");
  
  // Generate a stable invoice number when component mounts
  useEffect(() => {
    if (!isEditing) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setInvoiceNumber(`INV-${year}${month}-${random}`);
    }
  }, [isEditing]);

  // Use user profile data for lawyer information
  useEffect(() => {
    if (user && caseInfo) {
      // Update lawyer information from user profile
      caseInfo.lawyer = {
        name: user.user_metadata?.full_name || user.email || "",
        firm: user.user_metadata?.firm || caseInfo.lawyer?.firm || "",
        address: user.user_metadata?.address || caseInfo.lawyer?.address || "",
        email: user.email || caseInfo.lawyer?.email || "",
        phone: user.user_metadata?.phone || caseInfo.lawyer?.phone || "",
      };
    }
  }, [user, caseInfo]);

  const handleEditToggle = () => {
    setIsEditingMode(!isEditingMode);
  };

  const handleCaseInfoChange = (field: string, value: string) => {
    setEditedCaseInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLawyerInfoChange = (field: string, value: string) => {
    setEditedCaseInfo(prev => ({
      ...prev,
      lawyer: {
        ...prev.lawyer,
        [field]: value
      }
    }));
  };

  const handleTariffChange = (index: number, field: string, value: string | number) => {
    setEditedTariffs(prev => {
      const newTariffs = [...prev];
      newTariffs[index] = {
        ...newTariffs[index],
        [field]: value,
        totalAmount: field === 'rate' || field === 'quantity' 
          ? Number((newTariffs[index].quantity * newTariffs[index].rate).toFixed(2))
          : newTariffs[index].totalAmount
      };
      return newTariffs;
    });
    
    // Recalculate total amount
    const newTotal = editedTariffs.reduce((sum, item) => sum + item.totalAmount, 0);
    setEditedTotalAmount(newTotal);
  };

  const handleAddTariff = () => {
    setEditedTariffs(prev => [
      ...prev,
      {
        description: '',
        quantity: 1,
        rate: 0,
        totalAmount: 0
      }
    ]);
  };

  const handleRemoveTariff = (index: number) => {
    setEditedTariffs(prev => {
      const newTariffs = [...prev];
      newTariffs.splice(index, 1);
      return newTariffs;
    });
    
    // Recalculate total amount
    const newTotal = editedTariffs.reduce((sum, item) => sum + item.totalAmount, 0);
    setEditedTotalAmount(newTotal);
  };

  const handleCalculate = (tariffs: any[], total: number) => {
    setEditedTariffs(tariffs);
    setEditedTotalAmount(total);
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    
    setIsGenerating(true);
    try {
      const element = invoiceRef.current;
      const opt = {
        margin: 10,
        filename: `invoice-${invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generate PDF and get the blob URL
      const pdf = await html2pdf().set(opt).from(element).outputPdf('blob');
      const url = URL.createObjectURL(pdf);
      setPdfUrl(url);
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = async () => {
    if (!pdfUrl) {
      await generatePDF();
      return;
    }
    
    // Create a temporary link to download the PDF
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `invoice-${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveInvoice = async () => {
    if (!location.state?.caseId && !invoiceId) {
      toast.error("Case information is missing");
      return;
    }

    setIsSaving(true);
    try {
      const invoiceData = {
        case_id: location.state?.caseId || invoiceId,
        invoice_number: invoiceNumber,
        date: currentDate,
        amount: editedTotalAmount * 1.15, // Including VAT
        status: paymentStatus,
        invoice_items: editedTariffs.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.rate,
          total: item.totalAmount,
        })),
      };

      if (invoiceId) {
        await updateInvoice(invoiceId, invoiceData);
        toast.success("Invoice updated successfully");
      } else {
        await createInvoice(invoiceData);
        toast.success("Invoice saved successfully");
      }
      navigate('/invoices'); // Redirect to invoices page after saving
    } catch (error) {
      console.error('Error saving invoice:', error);
      toast.error("Failed to save invoice");
    } finally {
      setIsSaving(false);
    }
  };

  // Cleanup PDF URL when component unmounts
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);
  
  if (showCalculator) {
    return (
      <TariffCalculator
        caseInfo={editedCaseInfo}
        onCalculate={handleCalculate}
        onBack={() => setShowCalculator(false)}
        isEditing={isEditing}
        existingInvoice={{
          id: invoiceId || '',
          items: editedTariffs.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.rate,
            total: item.totalAmount,
          })),
        }}
      />
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <Button variant="outline" onClick={onBack} className="w-full md:w-auto">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Calculator
        </Button>
        <div className="flex gap-2">
          {isEditingMode && (
            <Button variant="outline" onClick={handleEditToggle} className="w-full md:w-auto">
              <X className="mr-2 h-4 w-4" /> Cancel Edit
            </Button>
          )}
          {!isEditingMode && (
            <Button variant="outline" onClick={handleEditToggle} className="w-full md:w-auto">
              <Edit2 className="mr-2 h-4 w-4" /> Edit Invoice
            </Button>
          )}
          <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Save className="mr-2 h-4 w-4" /> Save Invoice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Invoice</DialogTitle>
                <DialogDescription>
                  Set the payment status for this invoice before saving.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment Status</label>
                  <Select
                    value={paymentStatus}
                    onValueChange={(value: "Pending" | "Paid" | "Overdue") => setPaymentStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleSaveInvoice} 
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" /> Save Invoice
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button 
            onClick={handleDownload} 
            disabled={isGenerating} 
            className="w-full md:w-auto"
          >
            <FileText className="mr-2 h-4 w-4" /> 
            {isGenerating ? "Generating..." : "Export PDF"}
          </Button>
        </div>
      </div>
      
      {pdfUrl && (
        <div className="mb-6">
          <iframe 
            src={pdfUrl} 
            className="w-full h-[600px] border rounded-lg"
            title="PDF Preview"
          />
        </div>
      )}
      
      <Card 
        ref={invoiceRef}
        className={`p-4 md:p-8 border shadow-sm ${pdfUrl ? 'hidden' : ''}`} 
        id="invoice-preview"
      >
        <div className="flex flex-col gap-4 md:gap-8 max-w-[800px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between gap-4 border-b pb-4 md:pb-6">
            <div className="space-y-2">
              {isEditingMode ? (
                <div className="space-y-2">
                  <Input
                    value={editedCaseInfo.lawyer.firm}
                    onChange={(e) => handleLawyerInfoChange('firm', e.target.value)}
                    className="text-lg md:text-2xl font-bold"
                  />
                  <Textarea
                    value={editedCaseInfo.lawyer.address}
                    onChange={(e) => handleLawyerInfoChange('address', e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    value={editedCaseInfo.lawyer.email}
                    onChange={(e) => handleLawyerInfoChange('email', e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    value={editedCaseInfo.lawyer.phone}
                    onChange={(e) => handleLawyerInfoChange('phone', e.target.value)}
                    className="text-sm"
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-lg md:text-2xl font-bold text-[#1a365d]">{editedCaseInfo.lawyer.firm}</h2>
                  <p className="text-gray-600 whitespace-pre-line text-sm">{editedCaseInfo.lawyer.address}</p>
                  <p className="text-gray-600 text-sm">{editedCaseInfo.lawyer.email}</p>
                  <p className="text-gray-600 text-sm">{editedCaseInfo.lawyer.phone}</p>
                </>
              )}
            </div>
            <div className="text-left md:text-right mt-4 md:mt-0">
              <h1 className="text-xl md:text-3xl font-bold text-[#1a365d]">INVOICE</h1>
              <p className="text-gray-600 text-sm">Invoice #: {invoiceNumber}</p>
              <p className="text-gray-600 text-sm">Date: {currentDate}</p>
            </div>
          </div>
          
          {/* Client Information Section */}
          <div className="border-b py-4">
            <h3 className="font-semibold text-base mb-2 text-[#1a365d]">Bill To:</h3>
            {isEditingMode ? (
              <div className="space-y-4">
                <Input
                  value={editedCaseInfo.clientName}
                  onChange={(e) => handleCaseInfoChange('clientName', e.target.value)}
                  placeholder="Client Name"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    value={editedCaseInfo.caseNumber}
                    onChange={(e) => handleCaseInfoChange('caseNumber', e.target.value)}
                    placeholder="Case Number"
                  />
                  <Input
                    value={editedCaseInfo.caseTitle}
                    onChange={(e) => handleCaseInfoChange('caseTitle', e.target.value)}
                    placeholder="Case Title"
                  />
                  <Input
                    value={editedCaseInfo.court}
                    onChange={(e) => handleCaseInfoChange('court', e.target.value)}
                    placeholder="Court Type"
                  />
                  <Input
                    value={editedCaseInfo.scale}
                    onChange={(e) => handleCaseInfoChange('scale', e.target.value)}
                    placeholder="Scale"
                  />
                  <Input
                    value={editedCaseInfo.filePages}
                    onChange={(e) => handleCaseInfoChange('filePages', e.target.value)}
                    placeholder="File Pages"
                    type="number"
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="font-medium text-base">{editedCaseInfo.clientName}</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 text-sm">Case Number: {editedCaseInfo.caseNumber}</p>
                    <p className="text-gray-600 text-sm">Case Title: {editedCaseInfo.caseTitle}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Court: {editedCaseInfo.court === "magistrate" ? "Magistrate Court" : "High Court"}</p>
                    <p className="text-gray-600 text-sm">Scale: {editedCaseInfo.scale}</p>
                    <p className="text-gray-600 text-sm">File Pages: {editedCaseInfo.filePages}</p>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Items Table Section */}
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="min-w-[600px] px-4 md:px-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left bg-gray-50">
                    <th className="py-2 px-2 md:px-4 text-xs font-semibold text-[#1a365d]">Item</th>
                    <th className="py-2 px-2 md:px-4 text-xs font-semibold text-[#1a365d] hidden sm:table-cell">Description</th>
                    <th className="py-2 px-2 md:px-4 text-xs font-semibold text-[#1a365d] hidden md:table-cell">Unit</th>
                    <th className="py-2 px-2 md:px-4 text-right text-xs font-semibold text-[#1a365d]">Rate (R)</th>
                    <th className="py-2 px-2 md:px-4 text-right text-xs font-semibold text-[#1a365d]">Qty</th>
                    <th className="py-2 px-2 md:px-4 text-right text-xs font-semibold text-[#1a365d]">Amount (R)</th>
                    {isEditingMode && (
                      <th className="py-2 px-2 md:px-4 text-right text-xs font-semibold text-[#1a365d]">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {editedTariffs.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-2 px-2 md:px-4 text-xs">
                        {isEditingMode ? (
                          <Input
                            value={item.description}
                            onChange={(e) => handleTariffChange(index, 'description', e.target.value)}
                            placeholder="Item description"
                            className="text-xs"
                          />
                        ) : (
                          item.description
                        )}
                      </td>
                      <td className="py-2 px-2 md:px-4 text-xs hidden sm:table-cell">{item.unit}</td>
                      <td className="py-2 px-2 md:px-4 text-xs hidden md:table-cell">{item.unit}</td>
                      <td className="py-2 px-2 md:px-4 text-right text-xs">
                        {isEditingMode ? (
                          <Input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleTariffChange(index, 'rate', parseFloat(e.target.value))}
                            className="w-16 text-right text-xs"
                          />
                        ) : (
                          item.rate.toFixed(2)
                        )}
                      </td>
                      <td className="py-2 px-2 md:px-4 text-right text-xs">
                        {isEditingMode ? (
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleTariffChange(index, 'quantity', parseInt(e.target.value))}
                            className="w-16 text-right text-xs"
                          />
                        ) : (
                          item.quantity
                        )}
                      </td>
                      <td className="py-2 px-2 md:px-4 text-right text-xs">{item.totalAmount.toFixed(2)}</td>
                      {isEditingMode && (
                        <td className="py-2 px-2 md:px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveTariff(index)}
                            className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {isEditingMode && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={handleAddTariff}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            )}
            
            {/* Totals Section */}
            <div className="mt-4 flex justify-end">
              <div className="w-full md:w-1/2 lg:w-1/3">
                <div className="flex justify-between py-1">
                  <span className="font-medium text-sm">Subtotal:</span>
                  <span className="text-sm">R {editedTotalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium text-sm">VAT (15%):</span>
                  <span className="text-sm">R {(editedTotalAmount * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-b py-2 font-bold text-base">
                  <span>Total:</span>
                  <span>R {(editedTotalAmount * 1.15).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Details Section */}
          <div className="mt-4 border-t pt-4">
            <h4 className="font-semibold mb-2 text-base text-[#1a365d]">Payment Details:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 text-sm">Bank: [Bank Name]</p>
                <p className="text-gray-600 text-sm">Account Number: [Account Number]</p>
                <p className="text-gray-600 text-sm">Reference: {invoiceNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Due Date: {format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "dd MMMM yyyy")}</p>
                <p className="text-gray-600 text-sm">Payment Terms: 30 days</p>
              </div>
            </div>
          </div>
          
          {/* Footer Section */}
          <div className="mt-4 pt-4 border-t">
            <div className="text-center space-y-2">
              <p className="text-gray-600 text-sm">Thank you for your business</p>
              <p className="text-gray-500 text-xs">This invoice was generated based on published Government Gazette tariffs effective 12 April 2024</p>
              <p className="text-gray-400 text-xs mt-2">For any queries, please contact {editedCaseInfo.lawyer.email}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InvoicePreview;
