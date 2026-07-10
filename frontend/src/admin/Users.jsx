import { useState, useEffect } from 'react';
import { Download, Trash2 } from 'lucide-react';
import AdminSidebar from './components/AdminSidebar';
import Pagination from './components/Pagination';
import { api } from '../services/api';
import { exportToCsv } from '../utils/csv';

const PAGE_SIZE = 10;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/admin/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Could not load users. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      (user.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.patch(`/api/admin/users/${userId}/role`, { role });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
    } catch (err) {
      console.error('Error updating role:', err);
      setError(err.response?.data?.error || 'Could not update the user role.');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.full_name || user.email}" and all their data? This cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/api/admin/users/${user.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.error || 'Could not delete the user.');
    }
  };

  const handleExport = () => {
    exportToCsv('users.csv', filteredUsers, [
      { label: 'Name', value: 'full_name' },
      { label: 'Email', value: 'email' },
      { label: 'Role', value: 'role' },
      { label: 'Joined', value: (u) => new Date(u.created_at).toLocaleDateString() },
      { label: 'Conversations', value: 'conversation_count' },
    ]);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-300">
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-4 pt-16 md:p-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold ml-4">✕</button>
          </div>
        )}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-gray-900 dark:text-gray-100">
            <thead>
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Email</th>
                <th className="text-left p-2">Role</th>
                <th className="text-left p-2">Joined</th>
                <th className="text-left p-2">Conversations</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedUsers.map((user) => (
                <tr key={user.id} className="border-t dark:border-gray-700">
                  <td className="p-2">{user.full_name}</td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-2">{user.conversation_count}</td>
                  <td className="p-2">
                    <button
                      onClick={() => handleDelete(user)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete user"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {pagedUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalItems={filteredUsers.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
