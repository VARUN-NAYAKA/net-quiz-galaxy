
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://naibtnyrrakpbssoeubl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5haWJ0bnlycmFrcGJzc29ldWJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNDcxNDQsImV4cCI6MjA2MDcyMzE0NH0.MpTWhbnsJLx5ArvzPqgOYVEFPB9Yz4d_mApxt9bEhLk";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY
);
