import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
import { Plus, Search, Loader2 } from "lucide-react";
import ClientForm from "@/components/ClientForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotifications } from "@/contexts/NotificationsContext";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast.error("Failed to load clients");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClient = async (clientData: Omit<Client, "id" | "created_at">) => {
    setIsAddingClient(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;

      setClients(prev => [data, ...prev]);
      setShowAddForm(false);
      toast.success("Client added successfully");
      
      // Add notification
      addNotification({
        title: "New Client Added",
        description: `Client "${clientData.name}" has been added successfully.`,
        type: "success"
      });
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Failed to add client");
    } finally {
      setIsAddingClient(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm md:text-base text-muted-foreground">Manage your client list and their information</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </div>

      {showAddForm && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Add New Client</CardTitle>
            <CardDescription>Enter the client's information below</CardDescription>
          </CardHeader>
          <CardContent>
            <ClientForm
              onSubmit={handleAddClient}
              onCancel={() => setShowAddForm(false)}
              isSubmitting={isAddingClient}
            />
          </CardContent>
        </Card>
      )}

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
        <Input
          placeholder="Search clients by name or email..."
          className="pl-8 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800">
                  <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300">Name</TableHead>
                  <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 hidden sm:table-cell">Email</TableHead>
                  <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 hidden md:table-cell">Phone</TableHead>
                  <TableHead className="text-xs md:text-sm font-semibold text-slate-700 dark:text-slate-300 hidden lg:table-cell">Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow 
                      key={client.id} 
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <TableCell className="text-xs md:text-sm font-medium">
                        <Link 
                          to={`/clients/${client.id}`} 
                          className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
                        >
                          {client.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
                        {client.email}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
                        {client.phone}
                      </TableCell>
                      <TableCell className="text-xs md:text-sm max-w-[200px] truncate text-slate-600 dark:text-slate-400 hidden lg:table-cell">
                        {client.address}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={4} 
                      className="text-center py-8 text-slate-500 dark:text-slate-400"
                    >
                      No clients found. Add a new client to get started.
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

export default Clients;
