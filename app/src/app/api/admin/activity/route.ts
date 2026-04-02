import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: activities, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json(activities || []);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}