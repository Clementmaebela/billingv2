import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TariffCalculator from "@/components/TariffCalculator";
import InvoicePreview from "@/components/InvoicePreview";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { getInvoiceById } from "@/services/invoiceService";
import { getCaseById } from "@/services/caseService";
import { useNotifications } from "@/contexts/NotificationsContext";
import { Invoice } from "@/types/invoice";
import { Case } from "@/types/case";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"calculate" | "preview">("calculate");
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [existingInvoice, setExistingInvoice] = useState<Invoice | null>(null);
  const [caseInfo, setCaseInfo] = useState<any>(null);
  
  const [selectedTariffs, setSelectedTariffs] = useState<any[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [hasCaseData, setHasCaseData] = useState(false);
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (location.state?.caseId) {
          const caseData = await getCaseById(location.state.caseId);
          if (caseData) {
            setCaseData(caseData);
            setCaseInfo({
              caseNumber: caseData.case_number,
              caseTitle: caseData.title,
              clientName: caseData.clients.name,
              court: caseData.court,
              scale: caseData.scale,
              filePages: caseData.file_pages,
              lawyer: {
                name: user?.user_metadata?.full_name || user?.email || "",
                firm: user?.user_metadata?.firm || "",
                address: user?.user_metadata?.address || "",
                email: user?.email || "",
                phone: user?.user_metadata?.phone || "",
              }
            });
            setHasCaseData(true);
          }
        }

        if (location.state?.invoiceId) {
          const invoiceData = await getInvoiceById(location.state.invoiceId);
          if (invoiceData) {
            setExistingInvoice(invoiceData);
            setIsEditing(true);
            setSelectedTariffs(invoiceData.invoice_items.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.unit_price,
              totalAmount: item.total
            })));
            setTotalAmount(invoiceData.amount);
            // If we have an existing invoice, start in preview mode
            setActiveTab("preview");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.state, user, navigate]);
  
  const handleTariffCalculation = (tariffs: any[], total: number) => {
    setSelectedTariffs(tariffs);
    setTotalAmount(total);
    setActiveTab("preview");
  };
  
  const goToTab = (tab: string) => {
    setActiveTab(tab as "calculate" | "preview");
  };

  const handleSelectCase = () => {
    navigate("/cases");
  };

  const handleSaveInvoice = async (invoice: Invoice) => {
    try {
      if (isEditing && existingInvoice) {
        const { error } = await supabase
          .from("invoices")
          .update({
            invoice_items: invoice.invoice_items,
            amount: invoice.amount,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingInvoice.id);

        if (error) throw error;

        toast.success("Invoice updated successfully");
        addNotification({
          title: "Invoice Updated",
          description: `Invoice #${existingInvoice.invoice_number} has been updated successfully.`,
          type: "success"
        });
      } else {
        const { data, error } = await supabase
          .from("invoices")
          .insert([{
            case_id: caseData?.id,
            invoice_items: invoice.invoice_items,
            amount: invoice.amount,
            status: "Pending",
            created_at: new Date().toISOString(),
            date: new Date().toISOString(),
            invoice_number: `INV-${Date.now()}`
          }])
          .select()
          .single();

        if (error) throw error;

        toast.success("Invoice created successfully");
        addNotification({
          title: "New Invoice Created",
          description: `Invoice #${data.invoice_number} has been created successfully.`,
          type: "success"
        });
      }
      navigate(-1);
    } catch (error) {
      console.error("Error saving invoice:", error);
      toast.error("Failed to save invoice");
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">
          {isEditing ? "Edit Invoice" : "Invoice Generator"}
        </h1>
      </div>
      
      {loading && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4 flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            <p>Loading information...</p>
          </CardContent>
        </Card>
      )}
      
      {!loading && !hasCaseData && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">No case selected for invoice generation.</p>
              <Button onClick={handleSelectCase}>
                Select a Case
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {!loading && hasCaseData && (
        <>
          {activeTab === "calculate" && (
            <TariffCalculator
              caseInfo={caseInfo}
              onCalculate={handleTariffCalculation}
              onBack={() => navigate(-1)}
              isEditing={isEditing}
              existingInvoice={existingInvoice}
            />
          )}
          
          {activeTab === "preview" && (
            <InvoicePreview
              caseInfo={caseInfo}
              selectedTariffs={selectedTariffs}
              totalAmount={totalAmount}
              onBack={() => goToTab("calculate")}
              isEditing={isEditing}
              invoiceId={location.state?.invoiceId}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Index;
