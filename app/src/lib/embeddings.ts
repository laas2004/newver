import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

const supabase = createClient(
  env.supabaseUrl,
  env.supabaseServiceRoleKey
);

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Call Ollama embeddings API
    const response = await fetch(`${env.ollamaBaseUrl}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: env.ollamaEmbeddingModel || 'qwen3-embedding:0.6b',
        prompt: text
      })
    });
    
    const data = await response.json();
    return data.embedding;
  } catch (error) {
    console.error('Embedding error:', error);
    // Return zero vector as fallback
    return Array(768).fill(0);
  }
}

export async function updateChunkEmbeddings(tableName: string, chunkId: number, text: string) {
  const embedding = await generateEmbedding(text);
  await supabase
    .from(tableName)
    .update({ embedding })
    .eq('id', chunkId);
}