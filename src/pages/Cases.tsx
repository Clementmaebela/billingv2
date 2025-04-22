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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import CaseForm from '@/components/CaseForm';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type CaseStatus = "Active" | "Closed" | "Pending";

const statusOptions = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Closed', label: 'Closed' },
  { value: 'Pending', label: 'Pending' }
] as const;

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [isAddingCase, setIsAddingCase] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.clients?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || case_.status === (statusFilter as CaseStatus);
    return matchesSearch && matchesStatus;
  });

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

  const handleAddCase = async (formData: any) => {
    try {
      setIsSubmitting(true);
      const { data, error } = await supabase
        .from('cases')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      setCases(prev => [...prev, data]);
      setShowAddForm(false);
      toast({
        title: "Success",
        description: "Case added successfully",
      });
    } catch (error) {
      console.error('Error adding case:', error);
      toast({
        title: "Error",
        description: "Failed to add case",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Cases</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your cases and their details</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Case
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Add New Case</CardTitle>
            <CardDescription>Enter the case details below</CardDescription>
          </CardHeader>
          <CardContent>
            <CaseForm
              onSubmit={handleAddCase}
              onCancel={() => setShowAddForm(false)}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
          <Input
            placeholder="Search cases by title or number..."
            className="pl-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800">
                  <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Case Number</TableHead>
                  <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Title</TableHead>
                  <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">Client</TableHead>
                  <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">Court</TableHead>
                  <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">Status</TableHead>
                  <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 hidden lg:table-cell">Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length > 0 ? (
                  filteredCases.map((caseItem) => (
                    <TableRow 
                      key={caseItem.id} 
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <TableCell className="text-xs md:text-sm font-medium">
                        <Link 
                          to={`/cases/${caseItem.id}`} 
                          className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                        >
                          {caseItem.case_number}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                        {caseItem.title}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                        {caseItem.clients?.name}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                        {caseItem.court}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                        <Badge variant={caseItem.status === 'Active' ? 'default' : 'secondary'}>
                          {caseItem.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                        {new Date(caseItem.updated_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={5} 
                      className="text-center py-8 text-slate-500 dark:text-slate-400"
                    >
                      No cases found. Add a new case to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cases;
