import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";
import { chatService } from "../services/chatService";
import type { ChatConversation, ChatMessage } from "../services/chatService";

export default function Chat() {
  const { user } = useAuth();
  const { receiverId } = useParams<{ receiverId: string }>();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Fetch Conversations
  useEffect(() => {
    if (!user) return;

    async function loadConversations() {
      try {
        setLoading(true);
        const list = await chatService.getMyConversations();
        setConversations(list);

        if (receiverId) {
          const directConv = await chatService.getOrCreateConversation(receiverId);
          if (directConv) {
            setActiveConv(directConv);
          }
        } else if (list.length > 0 && !activeConv) {
          setActiveConv(list[0]);
        }
      } catch (err) {
        console.error("Error loading conversations:", err);
      } finally {
        setLoading(false);
      }
    }

    loadConversations();
  }, [user, receiverId]);

  // 2. Connect Socket.IO & Listen for Real-Time Messages
  useEffect(() => {
    if (!user) return;
    const socket = chatService.connectSocket(user.uid);

    socket.on("message:new", (newMsg: ChatMessage) => {
      const currentActiveId = activeConv?.id;
      if (currentActiveId && newMsg.conversationId === currentActiveId) {
        setMessages((prev) => [...prev, newMsg]);
        chatService.markAsRead(currentActiveId);
      }
      chatService.getMyConversations().then((updated) => setConversations(updated));
    });

    return () => {
      socket.off("message:new");
    };
  }, [user, activeConv]);

  // 3. Load Messages when Active Conversation changes
  useEffect(() => {
    if (!activeConv || !user) return;
    const activeId = activeConv.id;

    async function loadMessages() {
      try {
        const history = await chatService.getMessages(activeId);
        setMessages(history);
        await chatService.markAsRead(activeId);
      } catch (err) {
        console.error("Error loading messages:", err);
      }
    }

    loadMessages();
  }, [activeConv, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeConv || !newMessageText.trim()) return;

    const content = newMessageText.trim();
    setNewMessageText("");

    try {
      const sentMsg = await chatService.sendMessage(activeConv.id, content);
      if (sentMsg) {
        setMessages((prev) => [...prev, sentMsg]);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-neutral-900 flex-col space-y-4">
        <p>Please log in to view your messages.</p>
        <Link to="/login" className="text-sm text-blue-400 hover:underline">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-white text-neutral-900 antialiased flex flex-col justify-between">
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="flex-1 w-full px-4 md:px-8 pt-28 pb-8 flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-80 border border-neutral-900 bg-neutral-950/20 p-4 flex flex-col h-[70vh] rounded-none">
            <h3 className="text-base font-extrabold tracking-tight border-b border-neutral-900 pb-3 mb-4">Messages</h3>

            {loading ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-800 border-t-white"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {conversations.length === 0 ? (
                  <p className="text-neutral-500 text-xs text-center py-10">No active conversations yet.</p>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConv(conv)}
                      className={`w-full flex items-center gap-3 p-3 text-left border rounded-none transition-colors ${
                        activeConv?.id === conv.id
                          ? "bg-white text-black border-white"
                          : "bg-neutral-950 text-neutral-400 border-neutral-900 hover:text-white hover:border-neutral-850"
                      }`}
                    >
                      <img
                        src={conv.otherParticipant?.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(conv.otherParticipant?.name || "U")}&radius=0&backgroundColor=000000&textColor=ffffff`}
                        alt=""
                        className="h-9 w-9 rounded-none object-cover border border-neutral-900 bg-neutral-900"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-xs font-bold truncate">{conv.otherParticipant?.name || "User"}</p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-brand-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-none">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] truncate ${activeConv?.id === conv.id ? "text-neutral-700" : "text-neutral-500"}`}>
                          {conv.lastMessage?.content || "No messages yet"}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Messages Panel */}
          <div className="flex-1 border border-neutral-900 bg-neutral-950/20 flex flex-col h-[70vh] rounded-none">
            {activeConv ? (
              <>
                {/* Header */}
                <div className="border-b border-neutral-900 p-4 flex items-center gap-3">
                  <img
                    src={activeConv.otherParticipant?.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeConv.otherParticipant?.name || "U")}&radius=0&backgroundColor=000000&textColor=ffffff`}
                    alt=""
                    className="h-8 w-8 rounded-none object-cover border border-neutral-900 bg-neutral-900"
                  />
                  <div>
                    <h4 className="text-sm font-bold">{activeConv.otherParticipant?.name || "User"}</h4>
                    <span className="text-[10px] text-green-400">● Live Real-Time Connection</span>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.uid ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] p-3 text-xs leading-relaxed border rounded-none ${
                          msg.senderId === user.uid
                            ? "bg-white text-black border-white"
                            : "bg-neutral-900 text-slate-300 border-neutral-800"
                        }`}
                      >
                        <p>{msg.content}</p>
                        {msg.createdAt && (
                          <span className="text-[8px] opacity-60 block text-right mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <form onSubmit={handleSendMessage} className="border-t border-neutral-900 p-3 flex gap-2">
                  <input
                    type="text"
                    required
                    value={newMessageText}
                    onChange={(e) => setNewMessageText(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-none border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-white focus:outline-none focus:ring-1 focus:ring-white"
                  />
                  <Button type="submit" className="text-xs px-5 bg-white text-black hover:bg-neutral-200 rounded-none font-bold">
                    Send
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-neutral-500 p-6 text-center">
                <p className="text-sm">Select an active conversation to view message history.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
