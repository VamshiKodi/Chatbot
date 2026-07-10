import { useState } from 'react';
import { Plus, User, LogOut, Pencil, Trash2, Check, X, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ThemeToggle from './ThemeToggle';

export default function Sidebar({
  conversations,
  selectedConversation,
  onNewChat,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
}) {
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [open, setOpen] = useState(false); // mobile drawer

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const startRename = (conv) => {
    setEditingId(conv.id);
    setDraftTitle(conv.title);
  };

  const saveRename = () => {
    const trimmed = draftTitle.trim();
    if (trimmed) {
      onRenameConversation(editingId, trimmed);
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-30 p-2 rounded bg-gray-800 text-white"
        title="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay (mobile only, when open) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30"
        />
      )}

      <div
        className={`w-64 bg-gray-800 text-white h-screen flex flex-col fixed md:static z-40 transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h1 className="text-xl font-bold">AI Chatbot</h1>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden p-1 hover:text-red-400"
          title="Close menu"
        >
          <X size={18} />
        </button>
      </div>
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 p-2 bg-blue-600 rounded hover:bg-blue-700"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`group flex items-center px-2 py-1 hover:bg-gray-700 ${
              selectedConversation === conv.id ? 'bg-gray-700' : ''
            }`}
          >
            {editingId === conv.id ? (
              <div className="flex items-center gap-1 w-full">
                <input
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveRename();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  className="flex-1 min-w-0 p-1 text-gray-900 rounded text-sm"
                  autoFocus
                />
                <button onClick={saveRename} className="p-1 hover:text-green-400" title="Save">
                  <Check size={14} />
                </button>
                <button onClick={() => setEditingId(null)} className="p-1 hover:text-red-400" title="Cancel">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <>
                <div
                  onClick={() => {
                    onSelectConversation(conv.id);
                    setOpen(false);
                  }}
                  className="flex-1 p-1 cursor-pointer truncate text-sm"
                >
                  {conv.title}
                </div>
                <div className="flex md:hidden md:group-hover:flex items-center gap-1">
                  <button
                    onClick={() => startRename(conv)}
                    className="p-1 text-gray-400 hover:text-white"
                    title="Rename conversation"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDeleteConversation(conv.id)}
                    className="p-1 text-gray-400 hover:text-red-400"
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-700">
        <ThemeToggle className="w-full" />
        <button
          onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-2 p-2 hover:bg-gray-700 rounded mt-2"
        >
          <User size={16} />
          Profile
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 p-2 hover:bg-gray-700 rounded mt-2"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
      </div>
    </>
  );
}
