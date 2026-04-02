import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Unwrap the params Promise
    const { userId } = await params;
    
    console.log('Delete API called with userId:', userId);
    
    if (!userId || userId === 'undefined') {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    // Verify user exists in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Delete from auth
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    console.log('Successfully deleted user:', userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}