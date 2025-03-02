import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { Send, Loader2, Sparkles, Trash2, Copy, CheckCheck } from "lucide-react";

const GEMINI_API_KEY = import.meta.env.VITE_GEN_API_KEY;

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "welcome", 
      text: "Hi there! 👋 I'm your AI Tutor. Ask me anything about your studies, and I'll help you understand the concepts better!", 
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 100)}px`;
    }
  }, [inputValue]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { 
      id: `user-${Date.now()}`, 
      text: inputValue, 
      sender: "user",
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ 
                  text: `You are an AI Tutor specialized in helping students understand complex topics. 
                  Your responses should be educational, clear, and helpful.
                  If appropriate, include examples to illustrate concepts.
                  IMPORTANT: Do not use asterisks (*) in your response.
                  User query: ${inputValue}` 
                }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              topK: 40
            }
          })
        }
      );

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      let botResponse =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";
      
      // Remove any asterisks from the response
      botResponse = botResponse.replace(/\*/g, '');

      setMessages((prev) => [...prev, { 
        id: `bot-${Date.now()}`, 
        text: botResponse, 
        sender: "bot",
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, { 
        id: `error-${Date.now()}`, 
        text: "⚠️ Error connecting to AI service. Please try again later.", 
        sender: "bot",
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const clearChat = () => {
    setMessages([{ 
      id: "welcome-new", 
      text: "Chat cleared. How can I help you with your studies today?", 
      sender: "bot",
      timestamp: new Date()
    }]);
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-[450px] p-3 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100 shadow-md">
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <div className="bg-purple-600 p-1.5 rounded-full">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-purple-800 font-bold text-lg">AI Study Tutor</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearChat}
          className="text-slate-500 hover:text-red-500 hover:bg-red-50 h-7 px-2"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" />
          Clear
        </Button>
      </div>
      
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto space-y-3 p-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent"
      >
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
            <div className="flex items-start max-w-[80%] group">
              {message.sender === "bot" && (
                <Avatar 
                  className="mt-1 mr-1.5 flex-shrink-0 bg-purple-100" 
                  size="sm"
                  fallback="AI"
                />
              )}
              
              <div
                className={`relative p-2.5 rounded-lg text-xs leading-relaxed ${
                  message.sender === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-white dark:bg-slate-700 text-slate-800 dark:text-white rounded-bl-none shadow-sm border border-slate-200"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.text}</div>
                <div className={`text-xs mt-1 ${message.sender === "user" ? "text-purple-200" : "text-slate-400"}`}>
                  {formatTime(message.timestamp)}
                </div>
                
                {message.sender === "bot" && (
                  <button 
                    onClick={() => copyMessage(message.id, message.text)}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100"
                    aria-label="Copy message"
                  >
                    {copiedId === message.id ? (
                      <CheckCheck className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </button>
                )}
              </div>
              
              {message.sender === "user" && (
                <Avatar 
                  className="mt-1 ml-1.5 flex-shrink-0 bg-blue-100" 
                  size="sm"
                  fallback="You"
                />
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[80%]">
              <Avatar 
                className="mt-1 mr-1.5 flex-shrink-0 bg-purple-100" 
                size="sm"
                fallback="AI"
              />
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-3.5 w-3.5 text-purple-500 animate-spin" />
                  <p className="text-slate-500 text-xs">Thinking...</p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="mt-2">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your studies..."
            className="w-full px-3 py-2 pr-12 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none min-h-[40px] max-h-[100px] text-sm"
            disabled={loading}
            rows={1}
          />
          <Button 
            type="submit" 
            className="absolute right-1.5 bottom-1.5 rounded-full w-8 h-8 p-0 flex items-center justify-center"
            disabled={loading || !inputValue.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-slate-500 mt-1 text-center">
          Press Enter to send, Shift+Enter for a new line
        </p>
      </form>
    </div>
  );
};

export default Chatbot;