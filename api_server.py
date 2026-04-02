import os
import pickle
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import re

load_dotenv('app/.env')

app = Flask(__name__)
CORS(app)

# Initialize model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Store indices
indices = {}
chunks = {}

def load_index(domain):
    """Load FAISS index from disk"""
    index_path = f'vector_db/{domain}/index.faiss'
    chunks_path = f'vector_db/{domain}/chunks.pkl'
    
    if not os.path.exists(index_path) or not os.path.exists(chunks_path):
        print(f"Index files not found for {domain}. Run rebuild_indices.py first.")
        return False
    
    try:
        indices[domain] = faiss.read_index(index_path)
        with open(chunks_path, 'rb') as f:
            chunks[domain] = pickle.load(f)
        print(f"Loaded {domain}: {len(chunks[domain]['texts'])} chunks")
        return True
    except Exception as e:
        print(f"Error loading {domain}: {e}")
        return False

@app.route('/search/<domain>', methods=['POST', 'OPTIONS'])
def search(domain):
    if request.method == 'OPTIONS':
        return jsonify({})
    
    try:
        data = request.get_json()
        query = data.get('query', '')
        top_k = data.get('top_k', 5)
        
        if domain not in indices:
            return jsonify({'error': f'Domain {domain} not loaded'}), 404
        
        # Process query
        query_embedding = model.encode([query])
        faiss.normalize_L2(query_embedding)
        
        # Search
        scores, indices_result = indices[domain].search(query_embedding.astype(np.float32), top_k)
        
        results = []
        for i, idx in enumerate(indices_result[0]):
            if idx >= 0:
                results.append({
                    'content': chunks[domain]['texts'][idx],
                    'metadata': chunks[domain]['metadata'][idx],
                    'score': float(scores[0][i])
                })
        
        return jsonify({'results': results})
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'domains': list(indices.keys()),
        'chunk_counts': {d: len(chunks[d]['texts']) for d in chunks}
    })

if __name__ == '__main__':
    # Load all domains
    for domain in ['hr_law', 'citizen_law', 'company_law']:
        load_index(domain)
    
    print(f"\nServer ready on port 5001")
    app.run(host='0.0.0.0', port=5001, debug=False)