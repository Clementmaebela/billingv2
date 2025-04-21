import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, FolderOpen, Clock, DollarSign, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getRecentInvoices } from "@/services/invoiceService";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalClients: number;
  activeCases: number;
  pendingInvoices: number;
  totalBilled: number;
}

interface RecentCase {
  id: string;
  client: string;
  title: string;
  caseNumber: string;
  court: string;
  status: string;
}

interface RecentInvoice {
  id: string;
  client: string;
  caseTitle: string;
  amount: number;
  date: string;
  status: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalClients: 0,
    activeCases: 0,
    pendingInvoices: 0,
    totalBilled: 0,
  });
  const [recentCases, setRecentCases] = useState<RecentCase[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('id');

      if (clientsError) throw clientsError;

      // Fetch active cases
      const { data: casesData, error: casesError } = await supabase
        .from('cases')
        .select('id, status')
        .eq('status', 'Active');

      if (casesError) throw casesError;

      // Fetch invoices
      const { data: invoicesData, error: invoicesError } = await supabase
        .from('invoices')
        .select('id, amount, status');

      if (invoicesError) throw invoicesError;

      // Calculate stats
      const totalClients = clientsData?.length || 0;
      const activeCases = casesData?.length || 0;
      const pendingInvoices = invoicesData?.filter(inv => inv.status === 'Pending').length || 0;
      const totalBilled = invoicesData?.reduce((sum, inv) => sum + inv.amount, 0) || 0;

      setStats({
        totalClients,
        activeCases,
        pendingInvoices,
        totalBilled,
      });

      // Fetch recent cases with client names
      const { data: recentCasesData, error: recentCasesError } = await supabase
        .from('cases')
        .select(`
          id,
          title,
          case_number,
          court,
          status,
          clients (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentCasesError) throw recentCasesError;

      const formattedRecentCases = recentCasesData.map(case_ => ({
        id: case_.id,
        client: case_.clients?.name || 'Unknown Client',
        title: case_.title,
        caseNumber: case_.case_number,
        court: case_.court,
        status: case_.status,
      }));

      setRecentCases(formattedRecentCases);

      // Fetch recent invoices using the invoice service
      const recentInvoicesData = await getRecentInvoices(5);
      const formattedRecentInvoices = recentInvoicesData.map(invoice => ({
        id: invoice.id,
        client: invoice.cases?.clients?.name || 'Unknown Client',
        caseTitle: invoice.cases?.title || 'Unknown Case',
        amount: invoice.amount,
        date: invoice.date,
        status: invoice.status,
      }));

      setRecentInvoices(formattedRecentInvoices);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
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
    <div className="space-y-4 md:space-y-6 p-3 md:p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Welcome back! Here's what's happening with your practice.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size={isMobile ? "sm" : "default"} className="bg-primary hover:bg-primary/90">
            <Link to="/cases/new">Bill A Case</Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 md:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/clients" className="block">
          <Card className="h-full border-0 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/20 dark:hover:ring-1 dark:hover:ring-primary/20 transition-all duration-200 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-3 md:px-4">
              <CardTitle className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </CardHeader>
            <CardContent className="px-3 md:px-4">
              <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.totalClients}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active clients in your practice</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/cases" className="block">
          <Card className="h-full border-0 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/20 dark:hover:ring-1 dark:hover:ring-primary/20 transition-all duration-200 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4 md:px-6">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Active Cases</CardTitle>
              <FolderOpen className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.activeCases}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Currently active cases</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/invoices?status=Pending" className="block">
          <Card className="h-full border-0 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/20 dark:hover:ring-1 dark:hover:ring-primary/20 transition-all duration-200 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4 md:px-6">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Pending Invoices</CardTitle>
              <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">{stats.pendingInvoices}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Invoices awaiting payment</p>
            </CardContent>
          </Card>
        </Link>
        <Card className="h-full border-0 shadow-sm hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-primary/20 dark:hover:ring-1 dark:hover:ring-primary/20 transition-all duration-200 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-4 md:px-6">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Billed</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-200">R {stats.totalBilled.toFixed(2)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total revenue generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Cases & Invoices */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="border-0 shadow-sm">
          <CardHeader className="px-3 md:px-4">
            <CardTitle className="text-base md:text-lg">Recent Cases</CardTitle>
            <CardDescription className="text-xs md:text-sm">Your latest case updates</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800">
                    <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Client</TableHead>
                    <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">Case</TableHead>
                    <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCases.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => navigate(`/cases/${item.id}`)}
                    >
                      <TableCell className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">{item.client}</TableCell>
                      <TableCell className="text-xs md:text-sm max-w-[200px] truncate text-slate-600 dark:text-slate-400 hidden md:table-cell">{item.title}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "Active"
                              ? "success"
                              : item.status === "Pending"
                              ? "warning"
                              : "destructive"
                          }
                          className="text-xs md:text-sm font-medium"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
            <CardDescription>Latest billing activity</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800">
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Client</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Amount</TableHead>
                    <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentInvoices.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      onClick={() => navigate('/invoices')}
                    >
                      <TableCell className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">{item.client}</TableCell>
                      <TableCell className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">R {item.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "Paid"
                              ? "success"
                              : item.status === "Pending"
                              ? "warning"
                              : "destructive"
                          }
                          className="text-xs md:text-sm font-medium"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
