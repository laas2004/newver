import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    
    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
    }

    // Get user info
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, domain')
      .eq('employee_id', employeeId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get files from database
    const { data: uploads } = await supabase
      .from('document_uploads')
      .select('*')
      .eq('user_id', profile.id)
      .order('uploaded_at', { ascending: false });

    return NextResponse.json(uploads || []);
    
  } catch (error) {
    console.error('Fetch uploads error:', error);
    return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
  }
}