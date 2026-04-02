'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  employee_id: string;
  full_name: string;
  role: string;
  domain: string | null;
  created_at: string;
}

interface Activity {
  id: number;
  employee_id: string;
  action: string;
  details: any;
  created_at: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState('users');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({
    employee_id: '',
    full_name: '',
    role: 'user',
    domain: '',
    password: ''
  });
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    const empId = localStorage.getItem('userEmployeeId');

    if (!empId || role !== 'admin') {
      router.push('/');
      return;
    }

    fetchUsers();
    fetchActivities();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
    setLoading(false);
  };

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/admin/activity');
      const data = await response.json();
      setActivities(data);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    }
  };

  // ✅ Add new user
  const addUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`User ${newUser.employee_id} created successfully!`);
        setShowAddForm(false);
        setNewUser({ employee_id: '', full_name: '', role: 'user', domain: '', password: '' });
        fetchUsers();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add user');
      }
    } catch (err) {
      alert('Failed to add user');
    }
    setLoading(false);
  };

  const updateUserRole = async (userId: string, newRole: string, domain?: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole, domain: domain || null })
      });

      if (response.ok) {
        alert('User role updated successfully');
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Failed to update: ${error.error}`);
      }
    } catch (err) {
      alert('Failed to update user');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!userId) {
      alert('Invalid user ID');
      return;
    }

    if (!confirm('Delete this user permanently? This cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        alert('User deleted successfully');
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Failed to delete: ${error.error}`);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete user');
    }
  };

  const changePassword = async (employeeId: string) => {
    const newPassword = prompt(`Enter new password for ${employeeId}:`);
    if (!newPassword || newPassword.length < 4) {
      alert('Password must be at least 4 characters');
      return;
    }

    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, newPassword })
      });

      if (response.ok) {
        alert('Password changed successfully!');
      } else {
        const error = await response.json();
        alert(`Failed: ${error.error}`);
      }
    } catch (err) {
      alert('Failed to change password');
    }
  };

  const logout = () => {
    localStorage.removeItem('userEmployeeId');
    localStorage.removeItem('userRole');
    router.push('/');
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-6 border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 mr-4 ${activeTab === 'users' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 ${activeTab === 'activity' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
          >
            User Activity Logs
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">User Management</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add Employee
              </button>
            </div>

            {showAddForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-semibold mb-3">Add New Employee</h3>
                <form onSubmit={addUser} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Employee ID (e.g., EMP123)"
                    value={newUser.employee_id}
                    onChange={(e) => setNewUser({ ...newUser, employee_id: e.target.value.toUpperCase() })}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="user">Regular User (no password)</option>
                    <option value="sme">SME (requires password)</option>
                    <option value="admin">Admin (requires password)</option>
                  </select>

                  {newUser.role !== 'user' && (
                    <input
                      type="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    />
                  )}

                  {newUser.role === 'sme' && (
                    <select
                      value={newUser.domain}
                      onChange={(e) => setNewUser({ ...newUser, domain: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select Domain</option>
                      <option value="hr_law">HR Law</option>
                      <option value="citizen_law">Citizen Law</option>
                      <option value="company_law">Company Law</option>
                    </select>
                  )}

                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
                    <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
                  </div>
                </form>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border text-left">Employee ID</th>
                    <th className="p-3 border text-left">Name</th>
                    <th className="p-3 border text-left">Role</th>
                    <th className="p-3 border text-left">Domain</th>
                    <th className="p-3 border text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="p-3 border">{user.employee_id}</td>
                      <td className="p-3 border">{user.full_name}</td>
                      <td className="p-3 border">
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value, user.domain)}
                          className="border rounded p-1"
                        >
                          <option value="user">User</option>
                          <option value="sme">SME</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="p-3 border">
                        {user.role === 'sme' && (
                          <select
                            value={user.domain || ''}
                            onChange={(e) => updateUserRole(user.id, user.role, e.target.value)}
                            className="border rounded p-1"
                          >
                            <option value="hr_law">HR Law</option>
                            <option value="citizen_law">Citizen Law</option>
                            <option value="company_law">Company Law</option>
                          </select>
                        )}
                      </td>
                      <td className="p-3 border">
                        <button
                          onClick={() => changePassword(user.employee_id)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm mr-2"
                          title="Change Password"
                        >
                          Change Password
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                          title="Delete User"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'activity' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">User Activity Logs</h2>
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 border text-left">Date & Time</th>
                    <th className="p-3 border text-left">Employee ID</th>
                    <th className="p-3 border text-left">Action</th>
                    <th className="p-3 border text-left">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="p-3 border">{new Date(activity.created_at).toLocaleString()}</td>
                      <td className="p-3 border">{activity.employee_id}</td>
                      <td className="p-3 border">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                          {activity.action}
                        </span>
                      </td>
                      <td className="p-3 border">
                        <pre className="text-xs">{JSON.stringify(activity.details, null, 2)}</pre>
                      </td>
                    </tr>
                  ))}
                  {activities.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-3 border text-center text-gray-500">
                        No activity logs yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}