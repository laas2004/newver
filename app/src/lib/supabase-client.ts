import { createClient } from '@supabase/supabase-js';

// HARDCODE your values here temporarily
const supabaseUrl = "https://tdaueyovkerhmujkwgjl.supabase.co";
const supabaseKey = "sb_secret_x8ZqXYu7Yiwo22kWPKuRiA_oRTAn1Pg";

export const supabase = createClient(supabaseUrl, supabaseKey);