import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ingestDocument } from '@/lib/ingest';

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

    // Get user info with domain
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, domain')
      .eq('employee_id', employeeId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine save folder
    let saveFolder = '';
    switch (profile.domain) {
      case 'hr_law':
        saveFolder = 'hr_law_data';
        break;
      case 'citizen_law':
        saveFolder = 'citizen_law_data';
        break;
      case 'company_law':
        saveFolder = 'company_law_data';
        break;
      default:
        saveFolder = 'uploads';
    }

    // Create directory if not exists
    const baseDir = path.join(process.cwd(), '..');
    const dirPath = path.join(baseDir, saveFolder);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = path.join(dirPath, file.name);
    fs.writeFileSync(filePath, buffer);

    // Record upload (initial state)
    const { data: upload, error } = await supabase
      .from('document_uploads')
      .insert({
        user_id: profile.id,
        filename: file.name,
        domain: profile.domain,
        chunks_count: 0,
        status: 'processing'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 🔥 INGEST DOCUMENT
    const ingestionResult = await ingestDocument(
      filePath,
      profile.domain,
      file.name
    );

    if (ingestionResult.error) {
      return NextResponse.json(
        {
          success: false,
          error: ingestionResult.error,
          saved: true,
          folder: saveFolder
        },
        { status: 500 }
      );
    }

    // ✅ Update upload record with chunk count
    await supabase
      .from('document_uploads')
      .update({
        chunks_count: ingestionResult.totalChunks || ingestionResult.chunks,
        status: 'completed'
      })
      .eq('id', upload.id);

    // ✅ Log user activity: document ingestion/upload
    await supabase
      .from('user_activity_logs')
      .insert({
        user_id: profile.id,
        employee_id: employeeId,
        action: 'document_upload',
        details: {
          filename: file.name,
          domain: profile.domain,
          chunks: ingestionResult.chunks,
          totalChunks: ingestionResult.totalChunks
        }
      });

    // ✅ Final response
    return NextResponse.json({
      success: true,
      filename: file.name,
      domain: profile.domain,
      folder: saveFolder,
      chunks: ingestionResult.chunks,
      totalChunks: ingestionResult.totalChunks
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed: ' + error.message },
      { status: 500 }
    );
  }
}