import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // Get all upload logs with user info
  const { data } = await supabase
    .from('document_uploads')
    .select(`
      *,
      profiles:user_id (
        employee_id,
        full_name
      )
    `)
    .order('uploaded_at', { ascending: false })
    .limit(100);
  
  return NextResponse.json(data || []);
}