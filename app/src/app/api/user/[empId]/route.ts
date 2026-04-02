import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ empId: string }> }
) {
  try {
    // Unwrap the params Promise
    const { empId } = await params;
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, domain, employee_id')
      .eq('employee_id', empId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(profile);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}