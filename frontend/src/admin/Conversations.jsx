import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Trash2 } from 'lucide-react';
import AdminSidebar from './components/AdminSidebar';
import Pagination from './components/Pagination';
import { api } from '../services/api';
import { exportToCsv } from '../utils/csv';

const PAGE_SIZE = 10;

export default function Conversations() {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/api/admin/conversations');
        setConversations(response.data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
        setError('Could not load conversations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(
    (conv) =>
      (conv.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (conv.user?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (conv.user?.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const pagedConversations = filteredConversations.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (e, conv) => {
    e.stopPropagation();
    if (!window.confirm(`Delete conversation "${conv.title}" and all its messages?`)) return;
    try {
      await api.delete(`/api/admin/conversations/${conv.id}`);
      setConversations((prev) => prev.filter((c) => c.id !== conv.id));
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError(err.response?.data?.error || 'Could not delete the conversation.');
    }
  };

  const handleExport = () => {
    exportToCsv('conversations.csv', filteredConversations, [
      { label: 'Title', value: 'title' },
      { label: 'User', value: (c) => c.user?.full_name || '' },
      { label: 'Email', value: (c) => c.user?.email || '' },
      { label: 'Messages', value: 'message_count' },
      { label: 'Created', value: (c) => new Date(c.created_at).toLocaleString() },
    ]);
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-300">
          Loading conversations...
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-4 pt-16 md:p-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversations</h1>
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
            placeholder="Search by title, user, or email"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow overflow-x-auto">
          <table className="min-w-full text-gray-900 dark:text-gray-100">
            <thead>
              <tr>
                <th className="text-left p-2">Title</th>
                <th className="text-left p-2">User</th>
                <th className="text-left p-2">Messages</th>
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedConversations.map((conv) => (
                <tr
                  key={conv.id}
                  onClick={() => navigate(`/admin/conversations/${conv.id}`)}
                  className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <td className="p-2 max-w-xs truncate">{conv.title}</td>
                  <td className="p-2">{conv.user?.full_name || conv.user?.email}</td>
                  <td className="p-2">{conv.message_count}</td>
                  <td className="p-2">{new Date(conv.created_at).toLocaleString()}</td>
                  <td className="p-2">
                    <button
                      onClick={(e) => handleDelete(e, conv)}
                      className="p-1 text-gray-400 hover:text-red-500"
                      title="Delete conversation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {pagedConversations.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">
                    No conversations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalItems={filteredConversations.length}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
