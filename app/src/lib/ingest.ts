import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import pdfParse from 'pdf-parse';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function ingestDocument(filePath: string, domain: string, filename: string) {
  try {
    console.log(`\n📄 Ingesting: ${filename}`);
    
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    let fullText = pdfData.text;
    
    if (!fullText || fullText.trim().length === 0) {
      return { error: 'No text content found' };
    }
    
    console.log(`Extracted ${fullText.length} characters`);
    
    // Simple chunking - just split into 2000 character chunks with overlap
    const chunkSize = 2000;
    const overlap = 200;
    const chunks: string[] = [];
    
    for (let i = 0; i < fullText.length; i += chunkSize - overlap) {
      const chunk = fullText.substring(i, i + chunkSize);
      if (chunk.trim().length > 100) {
        chunks.push(chunk.trim());
      }
    }
    
    console.log(`Created ${chunks.length} chunks`);
    
    // Determine table name
    let tableName = '';
    switch(domain) {
      case 'hr_law':
        tableName = 'hr_law_chunks';
        break;
      case 'citizen_law':
        tableName = 'citizen_law_chunks';
        break;
      case 'company_law':
        tableName = 'company_law_chunks';
        break;
      default:
        return { error: 'Unknown domain' };
    }
    
    // Clear old chunks for this file
    await supabase.from(tableName).delete().eq('metadata->>filename', filename);
    
    // Insert all chunks
    let inserted = 0;
    for (let i = 0; i < chunks.length; i++) {
      const { error } = await supabase.from(tableName).insert({
        content: chunks[i],
        metadata: { filename: filename, domain: domain, index: i }
      });
      if (!error) inserted++;
    }
    
    await supabase.from('document_uploads')
      .update({ status: 'ingested', chunks_count: inserted })
      .eq('filename', filename);
    
    console.log(`✅ Ingested ${inserted}/${chunks.length} chunks`);
    return { success: true, chunks: inserted };
    
  } catch (error) {
    console.error('Ingestion error:', error);
    return { error: error.message };
  }
}