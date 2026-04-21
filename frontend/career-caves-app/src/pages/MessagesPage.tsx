import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  getMessages,
  sendMessage,
  getMyConversations,
  type Message,
  type Conversation,
} from '../lib/api';

type LocationState = {
  conversationId?: number;
  currentUserId?: number;
};

export default function MessagesPage() {
  const location = useLocation();
  const state = (location.state as LocationState | null) ?? null;

  const initialConversationId = state?.conversationId;
  const currentUserIdFromState = state?.currentUserId;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<number | undefined>(
    initialConversationId,
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');

  const selectedConversation = conversations.find(
  (conversation) => conversation.conversation_id === selectedConversationId,
);

const currentUserId = currentUserIdFromState ?? selectedConversation?.current_user_id;

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await getMyConversations();
        setConversations(data);

        if (!selectedConversationId && data.length > 0) {
          setSelectedConversationId(data[0].conversation_id);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    };

    void loadConversations();
  }, [selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;

    const loadMessages = async () => {
      try {
        const data = await getMessages(selectedConversationId);
        setMessages(data);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    void loadMessages();
  }, [selectedConversationId]);

  const handleSend = async () => {
    if (!selectedConversationId || !currentUserId || !draft.trim()) return;

    try {
      const newMessage = await sendMessage({
        conversation_id: selectedConversationId,
        sender_id: currentUserId,
        body: draft.trim(),
      });

      setMessages((prev) => [...prev, newMessage]);
      setDraft('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="page-padding">
      <h2>Messages</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '16px' }}>
        <div style={{ border: '1px solid #ccc', padding: '12px', minHeight: '400px' }}>
          <h3>Your Conversations</h3>

          {conversations.length === 0 ? (
            <p>No conversations yet.</p>
          ) : (
            conversations.map((conversation) => (
  <button
    key={conversation.conversation_id}
    onClick={() => setSelectedConversationId(conversation.conversation_id)}
    style={{
      display: 'block',
      width: '100%',
      textAlign: 'left',
      marginBottom: '8px',
      padding: '10px',
      background:
        selectedConversationId === conversation.conversation_id ? '#eef2ff' : 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      cursor: 'pointer',
    }}
  >
    <div style={{ fontWeight: 600 }}>
      {conversation.other_user_name ?? `User #${conversation.other_user_id ?? ''}`}
    </div>
    <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
      {conversation.listing_title ?? `Listing #${conversation.listing_id}`}
    </div>
    {conversation.other_user_email && (
      <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
        {conversation.other_user_email}
      </div>
    )}
  </button>
))
          )}
        </div>

        <div>
          {!selectedConversationId ? (
            <p>Select a conversation.</p>
          ) : (
            <>
  {selectedConversation && (
    <div style={{ marginBottom: '12px' }}>
      <h3 style={{ margin: 0 }}>
        {selectedConversation.other_user_name ??
          `User #${selectedConversation.other_user_id ?? ''}`}
      </h3>
      <p style={{ margin: '4px 0 0 0', color: '#666' }}>
        {selectedConversation.listing_title ??
          `Listing #${selectedConversation.listing_id}`}
      </p>
    </div>
  )}

  <div style={{ border: '1px solid #ccc', padding: '12px', minHeight: '300px' }}>
                {messages.length === 0 ? (
                  <p>No messages yet.</p>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.message_id} style={{ marginBottom: '8px' }}>
                      <strong>{msg.sender_id === currentUserId ? 'You' : 'Them'}:</strong> {msg.body}
                    </div>
                  ))
                )}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}