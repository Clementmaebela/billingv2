import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type CaseInsert = Database["public"]["Tables"]["cases"]["Insert"];
export type CaseRow = Database["public"]["Tables"]["cases"]["Row"] & {
  clients?: {
    id: string;
    name: string;
  };
  documents?: Array<{
    id: string;
    name: string;
    pages: number;
    upload_date: string;
  }>;
};

export interface CaseFormData {
  title: string;
  caseNumber: string;
  court: Database["public"]["Enums"]["court_type"];
  status: Database["public"]["Enums"]["case_status"];
  fileDate: string;
  filePages: number;
  scale: string;
  description?: string;
  clientId: string;
  clientName?: string;
}

/**
 * Creates a new case in the database
 */
export const createCase = async (formData: CaseFormData): Promise<CaseRow> => {
  // Format the file date to ISO string
  const fileDate = new Date(formData.fileDate).toISOString();
  
  // Check if case number already exists
  const { data: existingCase, error: checkError } = await supabase
    .from('cases')
    .select('id')
    .eq('case_number', formData.caseNumber)
    .maybeSingle();
  
  if (checkError) {
    console.error("Error checking case number:", checkError);
    throw new Error(`Error checking case number: ${checkError.message}`);
  }
  
  if (existingCase) {
    throw new Error(`Case number "${formData.caseNumber}" already exists. Please use a different case number.`);
  }
  
  // Format the data according to the database schema
  const caseData: CaseInsert = {
    title: formData.title.trim(),
    case_number: formData.caseNumber.trim(),
    court: formData.court,
    status: formData.status || "Active",
    file_date: fileDate,
    file_pages: parseInt(String(formData.filePages)) || 0,
    scale: formData.scale,
    description: formData.description?.trim() || null,
    client_id: formData.clientId
  };
  
  // Insert data into the database
  const { data, error } = await supabase
    .from('cases')
    .insert(caseData)
    .select();

  if (error) {
    console.error("Database error details:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
    throw new Error(`Database error: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    throw new Error("No data returned after insertion");
  }
  
  return data[0];
};

/**
 * Retrieves a case by ID
 */
export const getCaseById = async (id: string): Promise<CaseRow | null> => {
  const { data, error } = await supabase
    .from('cases')
    .select('*, clients(*)')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error("Error fetching case:", error);
    throw new Error(`Error fetching case: ${error.message}`);
  }
  
  return data;
};

/**
 * Retrieves all cases
 */
export const getAllCases = async (): Promise<CaseRow[]> => {
  const { data, error } = await supabase
    .from('cases')
    .select('*, clients(*)')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error("Error fetching cases:", error);
    throw new Error(`Error fetching cases: ${error.message}`);
  }
  
  return data || [];
};

/**
 * Updates an existing case
 */
export const updateCase = async (id: string, formData: Partial<CaseFormData>): Promise<CaseRow> => {
  const updateData: Partial<CaseInsert> = {};
  
  if (formData.title) updateData.title = formData.title.trim();
  if (formData.caseNumber) updateData.case_number = formData.caseNumber.trim();
  if (formData.court) updateData.court = formData.court;
  if (formData.status) updateData.status = formData.status;
  if (formData.fileDate) updateData.file_date = new Date(formData.fileDate).toISOString();
  if (formData.filePages !== undefined) updateData.file_pages = parseInt(String(formData.filePages)) || 0;
  if (formData.scale) updateData.scale = formData.scale;
  if (formData.description !== undefined) updateData.description = formData.description?.trim() || null;
  if (formData.clientId) updateData.client_id = formData.clientId;
  
  const { data, error } = await supabase
    .from('cases')
    .update(updateData)
    .eq('id', id)
    .select();
  
  if (error) {
    console.error("Error updating case:", error);
    throw new Error(`Error updating case: ${error.message}`);
  }
  
  if (!data || data.length === 0) {
    throw new Error("No data returned after update");
  }
  
  return data[0];
};

/**
 * Deletes a case
 */
export const deleteCase = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('cases')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting case:', error);
    throw new Error('Failed to delete case');
  }
}; 