// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://pvsfzmyqgwwkgbnlxreu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2c2Z6bXlxZ3d3a2dibmx4cmV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQyNzU5MTIsImV4cCI6MjA0OTg1MTkxMn0.8pa4BitHp1thXAxGJrbRof6LZjFuZrU81H9jZP1SbFM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);