import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ClientInsert = Database["public"]["Tables"]["clients"]["Insert"];
export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

/**
 * Creates a new client in the database
 */
export const createClient = async (formData: ClientFormData): Promise<ClientRow> => {
  const { data, error } = await supabase
    .from('clients')
    .insert([formData])
    .select()
    .single();

  if (error) {
    console.error("Error creating client:", error);
    throw new Error(`Error creating client: ${error.message}`);
  }

  return data;
};

/**
 * Retrieves a client by ID
 */
export const getClientById = async (id: string): Promise<ClientRow | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching client:", error);
    throw new Error(`Error fetching client: ${error.message}`);
  }
  
  return data;
};

/**
 * Retrieves all clients
 */
export const getAllClients = async (): Promise<ClientRow[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching clients:", error);
    throw new Error(`Error fetching clients: ${error.message}`);
  }
  
  return data || [];
};

/**
 * Updates an existing client
 */
export const updateClient = async (id: string, formData: Partial<ClientFormData>): Promise<ClientRow> => {
  const { data, error } = await supabase
    .from('clients')
    .update(formData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating client:", error);
    throw new Error(`Error updating client: ${error.message}`);
  }
  
  return data;
};

/**
 * Deletes a client
 */
export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error("Error deleting client:", error);
    throw new Error(`Error deleting client: ${error.message}`);
  }
};

/**
 * Gets all cases for a specific client
 */
export const getClientCases = async (clientId: string) => {
  const { data, error } = await supabase
    .from('cases')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching client cases:", error);
    throw new Error(`Error fetching client cases: ${error.message}`);
  }
  
  return data || [];
}; 