import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaComments } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';
import ChatWindow from '../components/ChatWindow';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Avatar({ name, image }) {
  if (image) return <img src={image} alt={name} className="w-10 h-10 rounded-full object-cover" />;
  const initials = (name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
      {initials}
    </div>
  );
}

function ConversationItem({ conversation, isActive, onClick }) {
  const other = conversation.otherUser || {};
  const name = [other.firstName, other.lastName].filter(Boolean).join(' ') || 'User';
  const lastMsg = conversation.lastMessage;
  const time = lastMsg?.createdAt
    ? new Date(lastMsg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '';
  const unread = conversation.unreadCount || 0;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
        isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
      }`}
    >
      <Avatar name={name} image={other.profileImage} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-[#222222] truncate">{name}</p>
          <span className="text-xs text-[#717171] flex-shrink-0">{time}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className="text-xs text-[#717171] truncate">
            {lastMsg?.content || lastMsg?.text || 'No messages yet'}
          </p>
          {unread > 0 && (
            <span className="flex-shrink-0 w-5 h-5 bg-[#FF385C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </div>
        {conversation.listing && (
          <p className="text-[10px] text-[#B0B0B0] truncate mt-0.5">{conversation.listing.title}</p>
        )}
      </div>
    </button>
  );
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const userId = user?._id || user?.id;
  const { connected, on, off, emit } = useSocket(token);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // Fetch conversation list
  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    const fetchConversations = async () => {
      try {
        const res = await fetch(`${API_BASE}/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await res.json();
        if (d.success) {
          setConversations(d.data?.conversations || d.data || []);
        }
      } catch {
        // Try alternative endpoint — bookings with messages
        try {
          const res = await fetch(`${API_BASE}/bookings?role=guest&limit=20`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const d = await res.json();
          if (d.success) {
            const bookings = d.data?.bookings || [];
            const convos = bookings.map((b) => ({
              _id: b._id,
              bookingId: b._id,
              otherUser: b.listing?.host || {},
              listing: b.listing,
              lastMessage: null,
              unreadCount: 0,
            }));
            setConversations(convos);
          }
        } catch {
          // silent
        }
      } finally {
        setLoadingConvos(false);
      }
    };
    fetchConversations();
  }, [token, navigate]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversationId || !token) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        // Try conversation endpoint first
        const res = await fetch(`${API_BASE}/messages/${activeConversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = await res.json();
        if (d.success) {
          setMessages(d.data?.messages || d.data || []);
        }
      } catch {
        // Fallback: try booking messages
        try {
          const res = await fetch(`${API_BASE}/bookings/${activeConversationId}/messages`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const d = await res.json();
          if (d.success) {
            setMessages(d.data?.messages || d.data || []);
          }
        } catch {
          setMessages([]);
        }
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();
  }, [activeConversationId, token]);

  // Listen for real-time messages
  useEffect(() => {
    if (!connected) return;

    const handleNewMessage = (msg) => {
      const convId = msg.conversationId || msg.bookingId;
      if (convId === activeConversationId) {
        setMessages((prev) => [...prev, msg]);
      }
      // Update conversation last message
      setConversations((prev) =>
        prev.map((c) =>
          c._id === convId ? { ...c, lastMessage: msg, unreadCount: convId === activeConversationId ? 0 : (c.unreadCount || 0) + 1 } : c
        )
      );
    };

    on('newMessage', handleNewMessage);
    on('message', handleNewMessage);

    return () => {
      off('newMessage', handleNewMessage);
      off('message', handleNewMessage);
    };
  }, [connected, on, off, activeConversationId]);

  // Join conversation room
  useEffect(() => {
    if (!connected || !activeConversationId) return;
    emit('joinRoom', { conversationId: activeConversationId });
    return () => emit('leaveRoom', { conversationId: activeConversationId });
  }, [connected, activeConversationId, emit]);

  // Send message
  const handleSend = useCallback(
    async (text) => {
      if (!activeConversationId || !token) return;

      // Optimistic update
      const tempMsg = {
        _id: `temp-${Date.now()}`,
        content: text,
        sender: userId,
        senderId: userId,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempMsg]);

      // Emit via socket
      emit('sendMessage', {
        conversationId: activeConversationId,
        bookingId: activeConversationId,
        content: text,
      });

      // Also persist via REST
      try {
        await fetch(`${API_BASE}/messages/${activeConversationId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: text }),
        });
      } catch {
        // Try booking messages endpoint
        try {
          await fetch(`${API_BASE}/bookings/${activeConversationId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content: text }),
          });
        } catch {
          // silent
        }
      }
    },
    [activeConversationId, token, userId, emit]
  );

  const selectConversation = (id) => {
    setActiveConversationId(id);
    setMobileShowChat(true);
    // Clear unread
    setConversations((prev) => prev.map((c) => (c._id === id ? { ...c, unreadCount: 0 } : c)));
  };

  const activeConvo = conversations.find((c) => c._id === activeConversationId);
  const otherUser = activeConvo?.otherUser || {};
  const otherName = [otherUser.firstName, otherUser.lastName].filter(Boolean).join(' ') || 'User';

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="h-[calc(100vh-80px)] flex">
        {/* Conversation list (desktop always visible, mobile toggle) */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
            <FaComments className="text-[#FF385C]" size={18} />
            <h1 className="text-lg font-bold text-[#222222]">Messages</h1>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="p-4 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                      <div className="h-2 bg-gray-200 rounded animate-pulse w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center px-6">
                <div>
                  <p className="text-4xl mb-3">📭</p>
                  <p className="text-sm font-semibold text-[#222222]">No conversations yet</p>
                  <p className="text-xs text-[#717171] mt-1">Messages with hosts will appear here after booking</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {conversations.map((c) => (
                  <ConversationItem
                    key={c._id}
                    conversation={c}
                    isActive={c._id === activeConversationId}
                    onClick={() => selectConversation(c._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className={`flex-1 flex flex-col ${!mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
          {activeConversationId ? (
            <>
              {/* Mobile back button */}
              <div className="md:hidden px-4 py-2 border-b border-gray-200">
                <button
                  onClick={() => setMobileShowChat(false)}
                  className="flex items-center gap-2 text-sm font-medium text-[#222222]"
                >
                  <FaArrowLeft size={12} /> Back to conversations
                </button>
              </div>

              {loadingMessages ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF385C]" />
                </div>
              ) : (
                <ChatWindow
                  messages={messages}
                  currentUserId={userId}
                  onSend={handleSend}
                  otherUserName={otherName}
                  connected={connected}
                />
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center px-6">
              <div>
                <p className="text-5xl mb-3">💬</p>
                <p className="text-lg font-semibold text-[#222222]">Select a conversation</p>
                <p className="text-sm text-[#717171] mt-1">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
