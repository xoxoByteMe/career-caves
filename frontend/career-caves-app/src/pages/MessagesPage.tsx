import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getMessages, sendMessage, type Message } from '../lib/api';

type LocationState = {
  conversationId?: number;
  currentUserId?: number;
};

export default function MessagesPage() {
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;

  const conversationId = state?.conversationId;
  const currentUserId = state?.currentUserId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      const data = await getMessages(conversationId);
      setMessages(data);
    };

    loadMessages();
  }, [conversationId]);

  const handleSend = async () => {
    if (!conversationId || !currentUserId || !draft.trim()) return;

    const newMessage = await sendMessage({
      conversation_id: conversationId,
      sender_id: currentUserId,
      body: draft.trim(),
    });

    setMessages((prev) => [...prev, newMessage]);
    setDraft('');
  };

  if (!conversationId || !currentUserId) {
    return (
      <div className="page-padding">
        <h2>Messages</h2>
        <p>No conversation selected.</p>
      </div>
    );
  }

  return (
    <div className="page-padding">
      <h2>Messages</h2>

      <div style={{ border: '1px solid #ccc', padding: '12px', minHeight: '300px' }}>
        {messages.map((msg) => (
          <div key={msg.message_id}>
            <strong>{msg.sender_id === currentUserId ? 'You' : 'Them'}:</strong> {msg.body}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1 }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}