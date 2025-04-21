import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Loader2, Search, Filter, Eye, Trash2, Plus, FileText, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getRecentInvoices, updateInvoiceStatus, getInvoicesByCase, deleteInvoice } from "@/services/invoiceService";

interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  amount: number;
  status: "Pending" | "Paid" | "Overdue";
  case_id: string;
  cases: {
    title: string;
    clients: {
      id: string;
      name: string;
    };
  };
  invoice_items: {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    // Update URL when status filter changes
    if (statusFilter === "all") {
      searchParams.delete("status");
    } else {
      searchParams.set("status", statusFilter);
    }
    setSearchParams(searchParams);
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      const data = await getRecentInvoices(100); // Fetch up to 100 invoices
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (invoiceId: string, newStatus: "Pending" | "Paid" | "Overdue") => {
    setUpdatingStatus(invoiceId);
    try {
      await updateInvoiceStatus(invoiceId, newStatus);
      setInvoices(invoices.map(invoice => 
        invoice.id === invoiceId ? { ...invoice, status: newStatus } : invoice
      ));
      toast.success('Invoice status updated successfully');
    } catch (error) {
      console.error('Error updating invoice status:', error);
      toast.error('Failed to update invoice status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handlePreviewInvoice = async (invoice: Invoice) => {
    try {
      // Fetch full invoice details including items
      const fullInvoiceData = await getInvoicesByCase(invoice.case_id);
      if (fullInvoiceData && fullInvoiceData.length > 0) {
        const fullInvoice = {
          ...fullInvoiceData[0],
          cases: invoice.cases, // Preserve the cases data from the original invoice
        };
        setSelectedInvoice(fullInvoice);
        setIsPreviewOpen(true);
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      toast.error('Failed to load invoice details');
    }
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedInvoice) return;
    
    setIsDeleting(true);
    try {
      await deleteInvoice(selectedInvoice.id);
      setInvoices(invoices.filter(inv => inv.id !== selectedInvoice.id));
      toast.success('Invoice deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice');
    } finally {
      setIsDeleting(false);
      setSelectedInvoice(null);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    navigate("/invoice-generator", {
      state: {
        caseId: invoice.case_id,
        invoiceId: invoice.id,
        isEditing: true,
        existingInvoice: {
          items: invoice.invoice_items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.total
          })),
          amount: invoice.amount,
          invoice_number: invoice.invoice_number,
          date: invoice.date,
          status: invoice.status
        }
      },
    });
  };

  const handleGenerateNew = () => {
    navigate("/cases/new");
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/clients/${clientId}`);
  };

  const handleCaseClick = (caseId: string) => {
    navigate(`/cases/${caseId}`);
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.cases?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.cases?.clients?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800";
      case "Overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage and track all your invoices
          </p>
        </div>
        <div className="flex gap-4">
          <Button onClick={handleGenerateNew}>
            <Plus className="mr-2 h-4 w-4" /> Bill A Case
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <CardDescription>
            View and manage all your invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Case</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal"
                      onClick={() => handleClientClick(invoice.cases.clients.id)}
                    >
                      {invoice.cases.clients.name}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-normal"
                      onClick={() => handleCaseClick(invoice.case_id)}
                    >
                      {invoice.cases.title}
                    </Button>
                  </TableCell>
                  <TableCell>{format(new Date(invoice.date), "dd MMM yyyy")}</TableCell>
                  <TableCell className="text-right">
                    R {invoice.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewInvoice(invoice)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No invoices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
            <DialogDescription>
              Invoice #{selectedInvoice?.invoice_number}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Client Information</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedInvoice.cases?.clients?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Case: {selectedInvoice.cases?.title}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    Date: {format(new Date(selectedInvoice.date), "dd MMMM yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Status: {selectedInvoice.status}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left text-sm font-medium">Description</th>
                      <th className="p-2 text-right text-sm font-medium">Quantity</th>
                      <th className="p-2 text-right text-sm font-medium">Unit Price</th>
                      <th className="p-2 text-right text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.invoice_items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 text-sm">{item.description}</td>
                        <td className="p-2 text-sm text-right">{item.quantity}</td>
                        <td className="p-2 text-sm text-right">R {item.unit_price.toFixed(2)}</td>
                        <td className="p-2 text-sm text-right">R {item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t">
                      <td colSpan={3} className="p-2 text-right font-medium">Subtotal:</td>
                      <td className="p-2 text-right">R {(selectedInvoice.amount / 1.15).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="p-2 text-right font-medium">VAT (15%):</td>
                      <td className="p-2 text-right">R {(selectedInvoice.amount * 0.15 / 1.15).toFixed(2)}</td>
                    </tr>
                    <tr className="border-t font-bold">
                      <td colSpan={3} className="p-2 text-right">Total:</td>
                      <td className="p-2 text-right">R {selectedInvoice.amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPreviewOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setIsPreviewOpen(false);
                    navigate(`/invoice-generator`, { 
                      state: { 
                        caseId: selectedInvoice.case_id,
                        invoiceId: selectedInvoice.id,
                        isEditing: true 
                      } 
                    });
                  }}
                >
                  Edit Invoice
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete invoice #{selectedInvoice?.invoice_number}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedInvoice(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Invoices; 