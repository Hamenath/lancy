import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase/config";
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  setDoc, 
  doc, 
  onSnapshot, 
  orderBy, 
  getDoc
} from "firebase/firestore";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button } from "@/components/ui/button";

interface ChatThread {
  id: string;
  participants: string[];
  lastMessage?: string;
  updatedAt?: any;
  otherParticipantName?: string;
  otherParticipantPhoto?: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
}

export default function Chat() {
  const { user } = useAuth();
  const { receiverId } = useParams<{ receiverId: string }>();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThread, setActiveThread] = useState<ChatThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageText, setNewMessageText] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 1. Fetch/Listen for Chat Threads
  useEffect(() => {
    if (!user) return;

    const threadsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(threadsQuery, async (snapshot) => {
      const list: ChatThread[] = [];
      for (const d of snapshot.docs) {
        const data = d.data();
        const otherId = data.participants.find((p: string) => p !== user.uid);
        
        // Fetch other participant profile details
        let otherParticipantName = "User";
        let otherParticipantPhoto = "";
        try {
          const userDoc = await getDoc(doc(db, "users", otherId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            otherParticipantName = userData.name || "User";
            otherParticipantPhoto = userData.photo || "";
          }
        } catch (e) {
          console.error("Error fetching other participant info:", e);
        }

        list.push({
          id: d.id,
          participants: data.participants,
          lastMessage: data.lastMessage || "",
          updatedAt: data.updatedAt,
          otherParticipantName,
          otherParticipantPhoto
        });
      }
      setThreads(list);
      setLoadingThreads(false);
    });

    return unsubscribe;
  }, [user]);

  // 2. Handle direct Chat creation from URL param (receiverId)
  useEffect(() => {
    async function initDirectChat() {
      if (!user || !receiverId) return;

      const chatId = user.uid < receiverId ? `${user.uid}_${receiverId}` : `${receiverId}_${user.uid}`;
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants: [user.uid, receiverId],
          lastMessage: "Started a conversation",
          updatedAt: new Date().toISOString()
        });
      }

      // Fetch recipient details to set as active thread
      let name = "User";
      let photo = "";
      try {
        const userDoc = await getDoc(doc(db, "users", receiverId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          name = userData.name || "User";
          photo = userData.photo || "";
        }
      } catch (e) {
        console.error(e);
      }

      setActiveThread({
        id: chatId,
        participants: [user.uid, receiverId],
        otherParticipantName: name,
        otherParticipantPhoto: photo
      });
    }

    initDirectChat();
  }, [user, receiverId]);

  // 3. Listen for Messages on Active Thread
  useEffect(() => {
    if (!activeThread) return;

    const messagesQuery = query(
      collection(db, "chats", activeThread.id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const list: Message[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          senderId: data.senderId,
          text: data.text,
          createdAt: data.createdAt
        });
      });
      setMessages(list);
    });

    return unsubscribe;
  }, [activeThread]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeThread || !newMessageText.trim()) return;

    const textToSend = newMessageText.trim();
    setNewMessageText("");

    try {
      // Add message to subcollection
      await addDoc(collection(db, "chats", activeThread.id, "messages"), {
        senderId: user.uid,
        text: textToSend,
        createdAt: new Date().toISOString()
      });

      // Update thread lastMessage status
      await setDoc(doc(db, "chats", activeThread.id), {
        lastMessage: textToSend,
        updatedAt: new Date().toISOString()
      }, { merge: true });

    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white flex-col space-y-4">
        <p>Please log in to chat.</p>
        <Link to="/login" className="text-sm text-blue-400 hover:underline">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white antialiased flex flex-col justify-between">
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="flex-1 w-full px-4 md:px-8 pt-28 pb-8 flex flex-col md:flex-row gap-6">
          {/* Threads Listing Sidebar */}
          <div className="w-full md:w-80 border border-neutral-900 bg-neutral-950/20 p-4 flex flex-col h-[70vh] rounded-none">
            <h3 className="text-base font-extrabold tracking-tight border-b border-neutral-900 pb-3 mb-4">Messages</h3>
            
            {loadingThreads ? (
              <div className="flex-1 flex justify-center items-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-800 border-t-white"></div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {threads.length === 0 ? (
                  <p className="text-neutral-500 text-xs text-center py-10">No messages yet.</p>
                ) : (
                  threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setActiveThread(thread)}
                      className={`w-full flex items-center gap-3 p-3 text-left border rounded-none transition-colors ${
                        activeThread?.id === thread.id
                          ? "bg-white text-black border-white"
                          : "bg-neutral-950 text-neutral-400 border-neutral-900 hover:text-white hover:border-neutral-850"
                      }`}
                    >
                      <img
                        src={thread.otherParticipantPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(thread.otherParticipantName || "U")}&radius=0&backgroundColor=000000&textColor=ffffff`}
                        alt=""
                        className="h-9 w-9 rounded-none object-cover border border-neutral-900 bg-neutral-900"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{thread.otherParticipantName}</p>
                        <p className={`text-[10px] truncate ${activeThread?.id === thread.id ? "text-neutral-700" : "text-neutral-500"}`}>
                          {thread.lastMessage}
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
            {activeThread ? (
              <>
                {/* Header */}
                <div className="border-b border-neutral-900 p-4 flex items-center gap-3">
                  <img
                    src={activeThread.otherParticipantPhoto || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(activeThread.otherParticipantName || "U")}&radius=0&backgroundColor=000000&textColor=ffffff`}
                    alt=""
                    className="h-8 w-8 rounded-none object-cover border border-neutral-900 bg-neutral-900"
                  />
                  <div>
                    <h4 className="text-sm font-bold">{activeThread.otherParticipantName}</h4>
                    <span className="text-[10px] text-green-400">● Active conversation</span>
                  </div>
                </div>

                {/* Messages Body */}
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
                        <p>{msg.text}</p>
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
                <p className="text-sm">Select an active contact or start a chat from a designer's profile.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
