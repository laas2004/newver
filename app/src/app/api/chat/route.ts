import { NextResponse } from 'next/server';
import { routeQuestionToDomain } from '@/lib/router';
import { supabaseServer } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get domain
    const userRole = req.headers.get('x-user-role');
    const userDomain = req.headers.get('x-user-domain');
    let domain;
    if (userRole === 'sme' && userDomain) {
      domain = userDomain;
    } else {
      domain = await routeQuestionToDomain(message);
    }
    
    let tableName = '';
    let domainDisplay = '';
    switch(domain) {
      case 'hr_law':
        tableName = 'hr_law_chunks';
        domainDisplay = 'HR Law';
        break;
      case 'citizen_law':
        tableName = 'citizen_law_chunks';
        domainDisplay = 'Citizen Law';
        break;
      case 'company_law':
        tableName = 'company_law_chunks';
        domainDisplay = 'Company Law';
        break;
      default:
        tableName = 'hr_law_chunks';
        domainDisplay = 'HR Law';
    }
    
    // Search for relevant chunks
    const keywords = message.toLowerCase().split(' ').filter(w => w.length > 3);
    let allChunks: any[] = [];
    
    for (const keyword of keywords) {
      const { data } = await supabaseServer
        .from(tableName)
        .select('content, metadata')
        .ilike('content', `%${keyword}%`)
        .limit(5);
      if (data) allChunks = [...allChunks, ...data];
    }
    
    // Remove duplicates
    const uniqueChunks = allChunks.filter((c, i, arr) => 
      i === arr.findIndex(x => x.content === c.content)
    );
    
    if (uniqueChunks.length === 0) {
      return NextResponse.json({
        answer: `No information found in ${domainDisplay} documents.`,
        domain: domainDisplay,
        citations: []
      });
    }
    
    // Find the best chunk (longest, most relevant)
    let bestChunk = uniqueChunks[0];
    let bestScore = 0;
    
    for (const chunk of uniqueChunks) {
      let score = chunk.content.length; // Longer chunks have more info
      const content = chunk.content.toLowerCase();
      
      for (const kw of keywords) {
        if (content.includes(kw)) score += 50;
      }
      
      if (content.includes('means')) score += 100;
      if (content.includes('includes')) score += 100;
      if (content.includes('entitled')) score += 80;
      if (content.includes('eligible')) score += 80;
      if (content.match(/\d+\.\d+\.\d+/)) score += 50;
      
      if (score > bestScore) {
        bestScore = score;
        bestChunk = chunk;
      }
    }
    
    const source = bestChunk.metadata?.filename || 'Document';
    let answer = bestChunk.content;
    
    // Clean up answer
    answer = answer.replace(/\s+/g, ' ').trim();
    
    // Return FULL answer (no truncation)
    return NextResponse.json({
      answer: answer,
      domain: domainDisplay,
      citations: [source]
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}