import os
import pickle
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from supabase import create_client
from dotenv import load_dotenv
import re

load_dotenv('app/.env')

# Initialize model
model = SentenceTransformer('all-MiniLM-L6-v2')

def preprocess_text(text):
    """Clean text"""
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def build_index(domain, table_name):
    """Build FAISS index from Supabase"""
    supabase = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_SERVICE_ROLE_KEY')
    )
    
    print(f"\n=== Building index for {domain} ===")
    
    # Fetch all chunks
    response = supabase.table(table_name).select('content, metadata').execute()
    
    if not response.data:
        print(f"No data found for {domain}")
        return
    
    print(f"Found {len(response.data)} chunks")
    
    # Prepare texts
    texts = []
    metas = []
    for item in response.data:
        processed = preprocess_text(item['content'])
        texts.append(processed)
        metas.append(item.get('metadata', {}))
    
    # Create embeddings
    print(f"Creating embeddings for {len(texts)} chunks...")
    embeddings = model.encode(texts, show_progress_bar=True)
    
    # Create FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatIP(dimension)  # Inner product for cosine similarity
    faiss.normalize_L2(embeddings)
    index.add(embeddings.astype(np.float32))
    
    # Save to disk
    os.makedirs(f'vector_db/{domain}', exist_ok=True)
    faiss.write_index(index, f'vector_db/{domain}/index.faiss')
    with open(f'vector_db/{domain}/chunks.pkl', 'wb') as f:
        pickle.dump({'texts': texts, 'metadata': metas}, f)
    
    print(f"✅ Built index for {domain}: {len(texts)} chunks")
    print(f"   Saved to: vector_db/{domain}/")

# Build all indices
build_index('hr_law', 'hr_law_chunks')
build_index('citizen_law', 'citizen_law_chunks')
build_index('company_law', 'company_law_chunks')

print("\n=== All indices built successfully ===")