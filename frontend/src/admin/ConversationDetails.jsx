import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AdminSidebar from './components/AdminSidebar';
import { api } from '../services/api';

export default function ConversationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await api.get(`/api/admin/conversations/${id}`);
        setConversation(response.data.conversation);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversation();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-300">
          Loading conversation...
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center text-gray-600 dark:text-gray-300">
          Conversation not found
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <AdminSidebar />
      <div className="flex-1 p-4 pt-16 md:p-6 overflow-y-auto">
        <button
          onClick={() => navigate('/admin/conversations')}
          className="flex items-center gap-1 mb-4 text-blue-600 hover:underline"
        >
          <ArrowLeft size={16} /> Back to conversations
        </button>
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Conversation Details
        </h1>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{conversation.title}</h2>
          <p className="text-gray-600 dark:text-gray-300">
            User: {conversation.user?.full_name} ({conversation.user?.email})
          </p>
          <p className="text-gray-600 dark:text-gray-300">
            Created: {new Date(conversation.created_at).toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          {messages.map((msg) => (
            <div key={msg.id} className="mb-4">
              <div className="font-bold text-gray-900 dark:text-white">
                {msg.sender === 'user' ? 'USER' : 'AI'}:
              </div>
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">{msg.content}</p>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </div>
          ))}
          {messages.length === 0 && (
            <p className="text-gray-500">No messages in this conversation</p>
          )}
        </div>
      </div>
    </div>
  );
}
