import { createClient } from '@supabase/supabase-js';

// HARDCODE your values here temporarily
const supabaseUrl = "keep your own ";
const supabaseKey = "keep your own";

export const supabase = createClient(supabaseUrl, supabaseKey);
