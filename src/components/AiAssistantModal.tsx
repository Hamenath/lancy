import { useState } from "react";
import { Sparkles, X, Send, Bot, User } from "lucide-react";
import { aiService } from "../services/aiService";

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function AiAssistantModal({ isOpen, onClose }: AiAssistantModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "Hello! I am Lancy AI Assistant. I can help you with hiring, project descriptions, profile optimization, or marketplace policies. What would you like help with today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || loading) return;

    const userText = inputPrompt.trim();
    setInputPrompt("");
    const userMsg: ChatMessage = {
      sender: "user",
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiService.chatAssistant(userText);
      const aiMsg: ChatMessage = {
        sender: "ai",
        text: res?.response || "I am currently unable to process your request. Please try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI Assistant error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md bg-neutral-950 border border-neutral-800 shadow-2xl rounded-none flex flex-col h-[500px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-900 bg-neutral-900/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-brand-primary/10 border border-brand-primary/30 text-brand-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight">Lancy AI Assistant</h3>
            <span className="text-[10px] text-green-400 font-bold uppercase flex items-center gap-1">
              <span className="size-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Message History */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            {m.sender === "ai" && (
              <div className="size-6 bg-neutral-900 border border-neutral-800 flex items-center justify-center text-brand-primary shrink-0">
                <Bot className="size-3.5" />
              </div>
            )}
            <div
              className={`max-w-[80%] p-3 text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-white text-black font-semibold"
                  : "bg-neutral-900 border border-neutral-800 text-neutral-200"
              }`}
            >
              <p>{m.text}</p>
              <span className="block text-[9px] opacity-60 text-right mt-1 font-mono">{m.timestamp}</span>
            </div>
            {m.sender === "user" && (
              <div className="size-6 bg-white text-black flex items-center justify-center shrink-0 font-bold text-[10px]">
                <User className="size-3.5" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
            <Bot className="size-3.5 animate-spin text-brand-primary" />
            <span>AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-neutral-900 bg-neutral-900/40 flex gap-2">
        <input
          type="text"
          placeholder="Ask Lancy AI..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          className="flex-1 h-9 px-3 text-xs bg-neutral-950 border border-neutral-800 text-white rounded-none focus:outline-none focus:border-white"
        />
        <button
          type="submit"
          disabled={loading || !inputPrompt.trim()}
          className="h-9 px-3 bg-white text-black hover:bg-neutral-200 font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center"
        >
          <Send className="size-3.5" />
        </button>
      </form>
    </div>
  );
}
