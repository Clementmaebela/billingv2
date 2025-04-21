export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  case_id: string;
  date: string;
  amount: number;
  status: "Pending" | "Paid" | "Overdue";
  invoice_items: InvoiceItem[];
  created_at?: string;
  updated_at?: string;
} 