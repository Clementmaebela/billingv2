import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, FileText, Loader2, Trash2 } from "lucide-react";
import { getAllCases, deleteCase, updateCase } from "@/services/caseService";
import { useToast } from "@/hooks/use-toast";
import type { CaseRow } from "@/services/caseService";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Closed", label: "Closed" },
  { value: "Pending", label: "Pending" },
];

const courtOptions = [
  { value: "all", label: "All Courts" },
  { value: "Magistrate", label: "Magistrate Court" },
  { value: "High", label: "High Court" },
];

const Cases = () => {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [courtFilter, setCourtFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoading(true);
        const data = await getAllCases();
        setCases(data);
      } catch (error) {
        console.error("Error fetching cases:", error);
        toast({
          title: "Error",
          description: "Failed to load cases. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, [toast]);

  const filteredCases = cases.filter(caseItem =>
    (caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     caseItem.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
     caseItem.clients?.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === "all" || caseItem.status === statusFilter) &&
    (courtFilter === "all" || caseItem.court === courtFilter)
  );

  const handleGenerateInvoice = (caseItem: CaseRow) => {
    navigate('/invoice-generator', { 
      state: { 
        caseId: caseItem.id,
        clientId: caseItem.client_id 
      } 
    });
  };

  const handleStatusChange = async (caseId: string, newStatus: "Active" | "Closed" | "Pending") => {
    setUpdatingStatus(caseId);
    try {
      await updateCase(caseId, { status: newStatus });
      setCases(cases.map(caseItem => 
        caseItem.id === caseId ? { ...caseItem, status: newStatus } : caseItem
      ));
      toast({
        title: "Success",
        description: "Case status updated successfully",
      });
    } catch (error) {
      console.error("Error updating case status:", error);
      toast({
        title: "Error",
        description: "Failed to update case status",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDelete = async (caseItem: CaseRow) => {
    if (!caseItem.id) return;
    
    setIsDeleting(true);
    try {
      await deleteCase(caseItem.id);
      setCases(prev => prev.filter(c => c.id !== caseItem.id));
      toast({
        title: "Success",
        description: "Case deleted successfully",
      });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Cases</h1>
        <Button asChild>
          <Link to="/cases/new" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" /> Add Case
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search cases by title, number, or client..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <select 
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={courtFilter}
            onChange={(e) => setCourtFilter(e.target.value)}
          >
            {courtOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Court</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>File Date</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length > 0 ? (
                  filteredCases.map((caseItem) => (
                    <TableRow key={caseItem.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <Link to={`/cases/${caseItem.id}`} className="text-blue-600 hover:underline">
                          {caseItem.case_number}
                        </Link>
                      </TableCell>
                      <TableCell>{caseItem.title}</TableCell>
                      <TableCell>
                        <Link to={`/clients/${caseItem.client_id}`} className="text-blue-600 hover:underline">
                          {caseItem.clients?.name}
                        </Link>
                      </TableCell>
                      <TableCell>{caseItem.court} Court</TableCell>
                      <TableCell>
                        <Select
                          value={caseItem.status}
                          onValueChange={(value: "Active" | "Closed" | "Pending") => handleStatusChange(caseItem.id, value)}
                          disabled={updatingStatus === caseItem.id}
                          className="status-select"
                        >
                          <SelectTrigger className={`w-[130px] ${
                            caseItem.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : caseItem.status === "Closed"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{new Date(caseItem.file_date).toLocaleDateString()}</TableCell>
                      <TableCell>{caseItem.file_pages}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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
                                  onClick={() => handleDelete(caseItem)}
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
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No cases found. Add a new case to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Cases;
