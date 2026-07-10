import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL;

const SUGGESTIONS = [
  'Explain JavaScript promises',
  'Help me write a professional email',
  'Give me project ideas for students',
];

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        setError('Could not load your conversations. Please refresh the page.');
      } else {
        setConversations(data);
      }
    };

    fetchConversations();
  }, []);

  // Fetch messages when a conversation is selected
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        setError('Could not load messages for this conversation.');
      } else {
        setMessages(data);
      }
    };

    fetchMessages();
  }, [selectedConversation]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, aiTyping, streamingText]);

  const refreshMessages = async (conversationId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setMessages(data || []);
    return data || [];
  };

  const handleNewChat = () => {
    setSelectedConversation(null);
    setMessages([]);
    setError('');
  };

  const handleSendMessage = async (content) => {
    if (!content.trim()) return;

    setLoading(true);
    setAiTyping(true);
    setError('');

    try {
      let conversationId = selectedConversation;

      // If no conversation is selected, create a new one
      if (!conversationId) {
        const { data: { user } } = await supabase.auth.getUser();
        const title = content.length > 30 ? content.substring(0, 30) + '...' : content;
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({ title, user_id: user.id })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = newConversation.id;
        setConversations((prev) => [newConversation, ...prev]);
        setSelectedConversation(conversationId);
      }

      // Add user message to the database
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender: 'user',
          content,
        });

      if (msgError) throw msgError;

      const updatedMessages = await refreshMessages(conversationId);

      // Stream the AI response from the backend (Server-Sent Events)
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ conversationId, messages: updatedMessages }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Something went wrong while sending your message.');
      }

      // Read the SSE stream and accumulate the assistant's reply
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';
      let streamError = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // keep the trailing partial event

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const payload = JSON.parse(trimmed.slice(5).trim());
          if (payload.delta) {
            fullText += payload.delta;
            setStreamingText(fullText);
          } else if (payload.error) {
            streamError = payload.error;
          }
        }
      }

      if (streamError) throw new Error(streamError);

      // Persist the completed AI response to the database
      const { error: aiError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender: 'assistant',
          content: fullText,
        });

      if (aiError) throw aiError;

      await refreshMessages(conversationId);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(
        err.message ||
          'Something went wrong while sending your message. Please try again.'
      );
    } finally {
      setLoading(false);
      setAiTyping(false);
      setStreamingText('');
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    const { error } = await supabase
      .from('messages')
      .update({ content: newContent })
      .eq('id', messageId);

    if (error) {
      console.error('Error editing message:', error);
      setError('Could not edit the message. Please try again.');
    } else {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: newContent } : m))
      );
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;

    const { error } = await supabase.from('messages').delete().eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
      setError('Could not delete the message. Please try again.');
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
  };

  const handleRenameConversation = async (conversationId, newTitle) => {
    const { error } = await supabase
      .from('conversations')
      .update({ title: newTitle })
      .eq('id', conversationId);

    if (error) {
      console.error('Error renaming conversation:', error);
      setError('Could not rename the conversation. Please try again.');
    } else {
      setConversations((prev) =>
        prev.map((c) => (c.id === conversationId ? { ...c, title: newTitle } : c))
      );
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!window.confirm('Delete this conversation and all its messages?')) return;

    // Delete messages first, then the conversation
    await supabase.from('messages').delete().eq('conversation_id', conversationId);
    const { error } = await supabase.from('conversations').delete().eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      setError('Could not delete the conversation. Please try again.');
    } else {
      setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      if (selectedConversation === conversationId) {
        handleNewChat();
      }
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        onNewChat={handleNewChat}
        onSelectConversation={setSelectedConversation}
        onRenameConversation={handleRenameConversation}
        onDeleteConversation={handleDeleteConversation}
      />
      <div className="flex-1 flex flex-col pt-14 md:pt-0">
        {error && (
          <div className="m-4 mb-0 p-3 bg-red-100 border border-red-300 text-red-700 rounded flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold ml-4">✕</button>
          </div>
        )}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                How can I help you today?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    disabled={loading}
                    className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 text-left"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{suggestion}</h3>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isUser={msg.sender === 'user'}
                onEdit={msg.sender === 'user' ? handleEditMessage : undefined}
                onDelete={msg.sender === 'user' ? handleDeleteMessage : undefined}
              />
            ))
          )}
          {streamingText && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-none px-4 py-3 max-w-[80%] whitespace-pre-wrap break-words">
                {streamingText}
              </div>
            </div>
          )}
          {aiTyping && !streamingText && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-lg animate-pulse">
                AI is typing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <ChatInput onSendMessage={handleSendMessage} disabled={loading} />
      </div>
    </div>
  );
}
