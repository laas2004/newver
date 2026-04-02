import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const employeeId = formData.get('employeeId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Get user ID from employee ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('employee_id', employeeId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Here you would process the PDF and create chunks
    // For now, just record the upload
    const { error } = await supabase
      .from('document_uploads')
      .insert({
        user_id: profile.id,
        filename: file.name,
        chunks_count: 0,
        status: 'pending'
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, filename: file.name });
    
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET() {
  // This would return all uploads - implement if needed
  return NextResponse.json([]);
}