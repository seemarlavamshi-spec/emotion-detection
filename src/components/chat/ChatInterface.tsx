import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Loader2, 
  History,
  Trash2,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello. I'm MindEase AI, your empathetic companion. How are you feeling today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      // Add the new user message to history context
      history.push({ role: 'user', parts: [{ text: input }] });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: history,
        config: {
          systemInstruction: "You are MindEase AI, an empathetic, supportive, and non-judgmental mental health companion. Your goal is to listen activey, validate feelings, and provide gentle wellness advice. If a user expresses severe distress or self-harm, gently guide them to professional help or crisis resources. Keep responses concise but warm."
        }
      });

      const text = response.text || "I'm here to listen, but I had a momentary lapse. Please tell me more.";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: 'assistant',
        content: "Hello again. I've cleared our previous conversation. How can I support you now?",
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] bg-brand-bg rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
      {/* Header */}
      <header className="bg-brand-card/50 backdrop-blur-xl border-b border-slate-800 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">MindEase AI</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Empathetic Listener</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-3 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
          title="Clear History"
        >
          <Trash2 size={20} />
        </button>
      </header>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-4 max-w-[80%]",
                message.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border",
                message.role === 'user' 
                  ? "bg-slate-800 border-slate-700 text-slate-400" 
                  : "bg-brand-primary/10 border-brand-primary/20 text-brand-primary"
              )}>
                {message.role === 'user' ? <User size={18} /> : <Sparkles size={18} />}
              </div>
              <div className={cn(
                "p-5 rounded-3xl text-sm leading-relaxed",
                message.role === 'user' 
                  ? "bg-brand-primary text-white font-medium rounded-tr-none shadow-lg shadow-brand-primary/20" 
                  : "bg-brand-card border border-slate-800 text-slate-300 rounded-tl-none"
              )}>
                <div className="prose prose-invert prose-sm">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <div className={cn(
                  "mt-2 text-[10px] opacity-40 font-mono",
                  message.role === 'user' ? "text-right" : "text-left"
                )}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 mr-auto max-w-[80%]"
          >
            <div className="w-10 h-10 rounded-2xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center text-brand-primary animate-pulse">
              <Bot size={18} />
            </div>
            <div className="bg-brand-card/50 border border-slate-800/50 p-5 rounded-3xl rounded-tl-none flex items-center gap-3">
              <Loader2 size={16} className="animate-spin text-brand-primary" />
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Thinking empathetically...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 bg-brand-card/30 backdrop-blur-md border-t border-slate-800">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative max-w-4xl mx-auto"
        >
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Type your thoughts here... I'm listening."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-6 pr-16 text-slate-200 placeholder:text-slate-600 outline-none focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/5 transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-4 rounded-xl transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-600 mt-4 font-mono uppercase tracking-[0.2em]">
          MindEase AI is a supportive tool, not a replacement for professional clinical care.
        </p>
      </div>
    </div>
  );
}
