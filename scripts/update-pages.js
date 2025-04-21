import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Load environment variables from .env file
const envPath = resolve(rootDir, '.env');
const envContent = readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Initialize Supabase client with service role key
const supabaseUrl = "https://knufcrejuzwetgstjpzp.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudWZjcmVqdXp3ZXRnc3RqcHpwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzc3Mjc0MiwiZXhwIjoyMDU5MzQ4NzQyfQ.2XUz8kGxI7zXm8vI4R4xtI8RV3g2HLi8RkZJqKJF0Eo";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL and service role key are required.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureStorageBucket() {
  try {
    // Try to get the bucket
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) throw listError;
    
    const documentsBucket = buckets.find(b => b.name === 'documents');
    
    if (!documentsBucket) {
      // Create the bucket if it doesn't exist
      const { data, error: createError } = await supabase.storage.createBucket('documents', {
        public: false,
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        fileSizeLimit: '10MB'
      });
      
      if (createError) throw createError;
      console.log('Created documents storage bucket');
    }
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
    process.exit(1);
  }
}

/**
 * This script updates the file_pages field in the cases table
 * based on the sum of pages from all associated documents.
 */
async function updatePageCounts() {
  try {
    // Ensure storage bucket exists
    await ensureStorageBucket();

    // Get all cases
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('id');

    if (casesError) throw casesError;

    console.log(`Found ${cases.length} cases to process`);

    // Process each case
    for (const caseItem of cases) {
      // Get all documents for this case
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('pages')
        .eq('case_id', caseItem.id);

      if (documentsError) throw documentsError;

      // Calculate total pages
      const totalPages = documents.reduce((sum, doc) => sum + (doc.pages || 0), 0);

      // Update the case with the total pages
      const { error: updateError } = await supabase
        .from('cases')
        .update({ file_pages: totalPages })
        .eq('id', caseItem.id);

      if (updateError) throw updateError;

      console.log(`Updated case ${caseItem.id} with ${totalPages} pages`);
    }

    console.log('Successfully updated all case page counts');
  } catch (error) {
    console.error('Error updating page counts:', error);
    process.exit(1);
  }
}

// Run the update
updatePageCounts(); 