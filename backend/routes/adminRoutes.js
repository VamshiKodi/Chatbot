import express from 'express';
import { supabase, hasServiceRoleKey } from '../config/supabase.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require an authenticated admin user
router.use(requireAuth, requireAdmin);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: totalConversations } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true });

    const { count: totalMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true });

    const today = new Date().toISOString().split('T')[0];
    const { count: messagesToday } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${today}T00:00:00Z`);

    const { data: recentUsers } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: recentConversations } = await supabase
      .from('conversations')
      .select('*, user:profiles(full_name)')
      .order('created_at', { ascending: false })
      .limit(5);

    res.json({
      stats: {
        totalUsers,
        totalConversations,
        totalMessages,
        messagesToday,
      },
      recentUsers,
      recentConversations,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/users', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*, conversations:conversations(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedUsers = users.map((user) => ({
      ...user,
      conversation_count: user.conversations[0]?.count || 0,
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a user's role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be "user" or "admin"' });
    }

    if (id === req.user.id) {
      return res.status(400).json({ error: 'You cannot change your own role' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a user (requires service role key for auth deletion)
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Delete the user's conversations and messages first
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', id);

    const conversationIds = (conversations || []).map((c) => c.id);
    if (conversationIds.length > 0) {
      await supabase.from('messages').delete().in('conversation_id', conversationIds);
      await supabase.from('conversations').delete().eq('user_id', id);
    }

    const { error: profileError } = await supabase.from('profiles').delete().eq('id', id);
    if (profileError) throw profileError;

    // Deleting the auth user needs the service role key
    if (hasServiceRoleKey) {
      const { error: authError } = await supabase.auth.admin.deleteUser(id);
      if (authError) console.error('Error deleting auth user:', authError);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all conversations
router.get('/conversations', async (req, res) => {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*, user:profiles(*), messages:messages(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedConversations = conversations.map((conv) => ({
      ...conv,
      message_count: conv.messages[0]?.count || 0,
    }));

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get conversation details
router.get('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: conversation } = await supabase
      .from('conversations')
      .select('*, user:profiles(*)')
      .eq('id', id)
      .single();

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    res.json({ conversation, messages });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a conversation (and its messages)
router.delete('/conversations/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await supabase.from('messages').delete().eq('conversation_id', id);
    const { error } = await supabase.from('conversations').delete().eq('id', id);
    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
