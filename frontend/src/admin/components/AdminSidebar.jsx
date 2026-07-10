import { useState } from 'react';
import { LayoutDashboard, Users, MessageSquare, LogOut, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import ThemeToggle from '../../components/ThemeToggle';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false); // mobile drawer

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const go = (path) => {
    navigate(path);
    setOpen(false);
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
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1 hover:text-red-400"
            title="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 p-4">
          <button
            onClick={() => go('/admin/dashboard')}
            className="w-full flex items-center gap-2 p-2 hover:bg-gray-700 rounded"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          <button
            onClick={() => go('/admin/users')}
            className="w-full flex items-center gap-2 p-2 hover:bg-gray-700 rounded mt-2"
          >
            <Users size={16} />
            Users
          </button>
          <button
            onClick={() => go('/admin/conversations')}
            className="w-full flex items-center gap-2 p-2 hover:bg-gray-700 rounded mt-2"
          >
            <MessageSquare size={16} />
            Conversations
          </button>
        </div>
        <div className="p-4 border-t border-gray-700">
          <ThemeToggle className="w-full mb-2" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2 hover:bg-gray-700 rounded"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
