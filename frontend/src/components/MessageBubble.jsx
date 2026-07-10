import { useState } from 'react';
import { Copy, Check, Pencil, Trash2, X } from 'lucide-react';

export default function MessageBubble({ message, isUser, onEdit, onDelete }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleSaveEdit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== message.content) {
      onEdit(message.id, trimmed);
    }
    setEditing(false);
  };

  return (
    <div className={`group flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex items-end gap-1 max-w-[80%]">
        {/* Action buttons for user messages (left of bubble) */}
        {isUser && !editing && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
            {onEdit && (
              <button
                onClick={() => { setDraft(message.content); setEditing(true); }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Edit message"
              >
                <Pencil size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(message.id)}
                className="p-1 text-gray-400 hover:text-red-500"
                title="Delete message"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}

        <div
          className={
            isUser
              ? 'bg-blue-500 dark:bg-blue-600 rounded-2xl rounded-br-none px-4 py-3 text-white'
              : 'bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-none px-4 py-3 text-gray-800 dark:text-gray-200'
          }
        >
          {editing ? (
            <div>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="w-full sm:w-64 p-2 text-gray-800 rounded resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-1">
                <button onClick={() => setEditing(false)} title="Cancel" className="p-1 hover:opacity-75">
                  <X size={14} />
                </button>
                <button onClick={handleSaveEdit} title="Save" className="p-1 hover:opacity-75">
                  <Check size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
          )}
          <div
            className={`text-xs mt-1 text-right ${
              isUser ? 'text-blue-100 dark:text-blue-200' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {message.edited_at ? 'edited · ' : ''}{formatTime(message.created_at)}
          </div>
        </div>

        {/* Copy button for AI messages (right of bubble) */}
        {!isUser && (
          <button
            onClick={handleCopy}
            className="p-1 mb-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Copy response"
          >
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
