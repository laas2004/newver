'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Upload {
  id: number;
  filename: string;
  domain: string;
  chunks_count: number;
  status: string;
  uploaded_at: string;
  file_path?: string;
}

export default function SMEPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userDomain, setUserDomain] = useState('');
  const [userEmpId, setUserEmpId] = useState('');
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const empId = localStorage.getItem('userEmployeeId');
    const storedDomain = localStorage.getItem('userDomain'); // ✅ NEW

    if (!empId || role !== 'sme') {
      router.push('/');
      return;
    }

    setUserEmpId(empId);

    // ✅ Load domain instantly from localStorage (fast UI)
    if (storedDomain) {
      setUserDomain(storedDomain);
    }

    fetchUserInfo(empId);
    fetchUploads(empId);
  }, [router]);

  // ✅ Fetch latest user info (source of truth)
  const fetchUserInfo = async (empId: string) => {
    try {
      const response = await fetch(`/api/user/${empId}`);
      const data = await response.json();

      setUserName(data.full_name || empId);

      if (data.domain) {
        setUserDomain(data.domain);

        // ✅ Keep localStorage updated
        localStorage.setItem('userDomain', data.domain);
      }

      console.log('User domain from DB:', data.domain);
    } catch (err) {
      console.error('Failed to fetch user info');
    }
  };

  const fetchUploads = async (empId: string) => {
    try {
      const response = await fetch(`/api/uploads?employeeId=${empId}`);
      const data = await response.json();
      setUploads(data || []);
    } catch (err) {
      console.error('Failed to fetch uploads');
    }
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('employeeId', userEmpId);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const result = await res.json();

      if (res.ok) {
        alert(`✅ Upload successful! File saved to ${result.domain || userDomain} folder`);
        setFile(null);
        fetchUploads(userEmpId);

        const input = document.getElementById('file-input') as HTMLInputElement;
        if (input) input.value = '';
      } else {
        alert(`❌ Upload failed: ${result.error}`);
      }
    } catch (err) {
      alert('❌ Upload failed');
    }

    setUploading(false);
  };

  const logout = () => {
    localStorage.removeItem('userEmployeeId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userDomain'); // ✅ cleanup
    router.push('/');
  };

  // ✅ Domain mapping
  const domainNames: Record<string, string> = {
    hr_law: 'HR Law',
    citizen_law: 'Citizen Law',
    company_law: 'Company Law'
  };

  // ✅ Final display logic
  const displayDomain =
    domainNames[userDomain] || userDomain || 'Not Assigned';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Pragya - AI Assistant
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome, {userName} | Domain:
              <span className="font-semibold text-blue-600 ml-1">
                {displayDomain}
              </span>
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Ingest Documents to {displayDomain}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload PDF documents. They will be processed and added to the
            knowledge base for {displayDomain}.
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            <input
              id="file-input"
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 border rounded-lg"
              required
            />

            <button
              type="submit"
              disabled={uploading || !file}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Ingesting...' : 'Ingest Document'}
            </button>
          </form>
        </div>

        {/* Upload History */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            Ingested Documents
          </h2>

          {uploads.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No documents ingested yet.
            </p>
          ) : (
            <div className="space-y-3">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="border rounded-lg p-3 hover:bg-gray-50"
                >
                  <div className="font-medium text-gray-900">
                    {upload.filename}
                  </div>

                  <div className="text-sm text-gray-500">
                    Status:
                    <span className="ml-1 font-medium">{upload.status}</span>
                    {' | '}
                    Chunks:
                    <span className="ml-1 font-medium">
                      {upload.chunks_count || 0}
                    </span>
                  </div>

                  <div className="text-xs text-gray-400">
                    Ingested: {new Date(upload.uploaded_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}