import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface CreateInvoiceData {
  case_id: string;
  invoice_number: string;
  date: string;
  amount: number;
  status: "Pending" | "Paid" | "Overdue";
  invoice_items: InvoiceItem[];
}

export const createInvoice = async (data: CreateInvoiceData) => {
  try {
    // Start a transaction
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        case_id: data.case_id,
        invoice_number: data.invoice_number,
        date: data.date,
        amount: data.amount,
        status: data.status,
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Insert invoice items
    const invoiceItems = data.invoice_items.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
    }));

    const { error: itemsError } = await supabase
      .from('invoice_items')
      .insert(invoiceItems);

    if (itemsError) throw itemsError;

    return invoice;
  } catch (error) {
    console.error('Error creating invoice:', error);
    toast.error('Failed to create invoice');
    throw error;
  }
};

export const updateInvoiceStatus = async (invoiceId: string, status: "Pending" | "Paid" | "Overdue") => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating invoice status:', error);
    toast.error('Failed to update invoice status');
    throw error;
  }
};

export const getInvoicesByCase = async (caseId: string) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*)
      `)
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    toast.error('Failed to fetch invoices');
    throw error;
  }
};

export const getRecentInvoices = async (limit: number = 5) => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        cases (
          title,
          clients (
            id,
            name
          )
        ),
        invoice_items (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching recent invoices:', error);
    toast.error('Failed to fetch recent invoices');
    throw error;
  }
};

export const deleteInvoice = async (invoiceId: string) => {
  try {
    // First delete invoice items
    const { error: itemsError } = await supabase
      .from('invoice_items')
      .delete()
      .eq('invoice_id', invoiceId);

    if (itemsError) throw itemsError;

    // Then delete the invoice
    const { error: invoiceError } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId);

    if (invoiceError) throw invoiceError;

    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    toast.error('Failed to delete invoice');
    throw error;
  }
};

export interface Invoice {
  id: string;
  invoice_number: string;
  date: string;
  amount: number;
  status: "Pending" | "Paid" | "Overdue";
  case_id: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }[];
}

export const getInvoices = async () => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
};

export const getInvoiceById = async (id: string) => {
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      invoice_items (*)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const updateInvoice = async (id: string, invoice: Partial<Invoice>) => {
  const { data, error } = await supabase
    .from("invoices")
    .update(invoice)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}; 