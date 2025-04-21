export interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string;
  court: string;
  client_id: string;
  status: "Active" | "Closed" | "Pending";
  created_at?: string;
  updated_at?: string;
} 