import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { employeeId, newPassword } = await req.json();
    
    // Get user by employee ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('employee_id', employeeId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update password in Supabase Auth
    const { error } = await supabase.auth.admin.updateUserById(profile.id, {
      password: newPassword
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}