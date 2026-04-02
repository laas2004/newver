'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://tdaueyovkerhmujkwgjl.supabase.co",
  "YOUR_SERVICE_ROLE_KEY_HERE" // Replace this
);

export default function LoginPage() {
  const [empId, setEmpId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Find user by employee ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('employee_id', empId)
      .single();

    if (!profile) {
      setError('Employee ID not found');
      return;
    }

    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
    
    // Login
    const { error } = await supabase.auth.signInWithPassword({
      email: userData.user!.email!,
      password,
    });

    if (error) {
      setError('Invalid password');
      return;
    }

    // Redirect
    if (profile.role === 'admin') router.push('/admin');
    else if (profile.role === 'sme') router.push('/sme');
    else router.push('/chat');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded shadow">
        <h2 className="text-2xl font-bold text-center mb-6">AI Assistant</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Employee ID"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
            className="w-full p-2 border rounded mb-3"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-3"
            required
          />
          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
            Login
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-4 text-center">
          IDs: ADMIN001, SME_HR001, USER001<br/>
          Passwords: admin123, sme123, user123
        </p>
      </div>
    </div>
  );
}