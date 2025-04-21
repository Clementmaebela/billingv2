import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash, ArrowLeft, FileText, Loader2 } from "lucide-react";
import ClientForm from "@/components/ClientForm";
import { toast } from "sonner";
import { getClientById, getClientCases, updateClient, deleteClient } from "@/services/clientService";
import type { ClientRow } from "@/services/clientService";
import type { CaseRow } from "@/services/caseService";
import ClientDocuments from "@/components/ClientDocuments";

const ClientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [client, setClient] = useState<ClientRow | null>(null);
  const [clientCases, setClientCases] = useState<CaseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Fetch client data
        const clientData = await getClientById(id);
        if (!clientData) {
          toast.error("Client not found");
          navigate("/clients");
          return;
        }
        setClient(clientData);
        
        // Fetch client cases
        const casesData = await getClientCases(id);
        setClientCases(casesData);
      } catch (error) {
        console.error("Error fetching client data:", error);
        toast.error("Failed to load client data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleUpdateClient = async (updatedData: any) => {
    if (!id) return;
    
    setIsUpdating(true);
    try {
      const updatedClient = await updateClient(id, updatedData);
      setClient(updatedClient);
      setEditing(false);
      toast.success("Client updated successfully");
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Failed to update client");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!id) return;
    
    if (confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        await deleteClient(id);
        navigate("/clients");
        toast.success("Client deleted successfully");
      } catch (error) {
        console.error("Error deleting client:", error);
        toast.error("Failed to delete client");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!client) {
    return <div className="p-8 text-center">Client not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Client Details</h1>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>View and manage client details</CardDescription>
          </div>
          <div className="flex gap-2">
            {!editing && (
              <>
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleDeleteClient}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash className="mr-2 h-4 w-4" /> Delete
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <ClientForm 
              initialData={client} 
              onSubmit={handleUpdateClient} 
              onCancel={() => setEditing(false)}
              isSubmitting={isUpdating}
            />
          ) : (
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="mt-1">{client.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1">{client.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="mt-1">{client.phone}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
                <p className="mt-1">{client.address}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {id && <ClientDocuments clientId={id} />}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Cases</CardTitle>
            <CardDescription>Cases associated with this client</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link to="/cases/new" state={{ clientId: id }}>
              <Plus className="mr-2 h-4 w-4" /> Add Case
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Number</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Court</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>File Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientCases.length > 0 ? (
                clientCases.map((caseItem) => (
                  <TableRow key={caseItem.id}>
                    <TableCell className="font-medium">
                      <Link to={`/cases/${caseItem.id}`} className="text-blue-600 hover:underline">
                        {caseItem.case_number}
                      </Link>
                    </TableCell>
                    <TableCell>{caseItem.title}</TableCell>
                    <TableCell>{caseItem.court} Court</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium
                        ${caseItem.status === 'Active' ? 'bg-green-100 text-green-800' : 
                          caseItem.status === 'Closed' ? 'bg-gray-100 text-gray-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {caseItem.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(caseItem.file_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                    No cases found for this client.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDetail;
