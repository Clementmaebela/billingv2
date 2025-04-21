import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

/**
 * This script updates the file_pages field in the cases table
 * based on the sum of pages from all associated documents.
 */
async function updatePageCounts() {
  console.log("Starting page count update...");
  
  try {
    // Get all cases
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('id, title');
    
    if (casesError) {
      throw casesError;
    }
    
    if (!cases || cases.length === 0) {
      console.log("No cases found.");
      return;
    }
    
    console.log(`Found ${cases.length} cases to update.`);
    
    // Process each case
    for (const caseItem of cases) {
      // Get all documents for this case
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('pages')
        .eq('case_id', caseItem.id);
      
      if (docsError) {
        console.error(`Error fetching documents for case ${caseItem.id}:`, docsError);
        continue;
      }
      
      // Calculate total pages
      const totalPages = documents?.reduce((sum, doc) => sum + (doc.pages || 0), 0) || 0;
      
      // Update the case with the new page count
      try {
        const { error: updateError } = await supabase
          .from('cases')
          .update({ file_pages: totalPages })
          .eq('id', caseItem.id);
        
        if (updateError) {
          throw updateError;
        }
        
        console.log(`Updated case "${caseItem.title}" (${caseItem.id}): ${totalPages} pages`);
      } catch (updateError) {
        console.error(`Error updating case ${caseItem.id}:`, updateError);
      }
    }
    
    console.log("Page count update completed.");
  } catch (error) {
    console.error("Error updating page counts:", error);
  }
}

// Run the update
updatePageCounts(); 