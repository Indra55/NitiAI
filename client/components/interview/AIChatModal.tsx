"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Sparkles, Loader2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCode: string;
  problem: any;
}

export default function AIChatModal({ isOpen, onClose, currentCode, problem }: AIChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: "👋 Hi! I'm your AI coding assistant. Stuck on a problem? Ask me for a hint, explanation, or help with debugging!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    scrollToBottom();
    // Retry after render/animation
    const timeoutId = setTimeout(scrollToBottom, 300);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
      
      const context = `
        You are an expert coding interview mentor.
        The user is solving this problem: ${problem?.title}
        Description: ${problem?.description}
        Current Code:
        \`\`\`
        ${currentCode}
        \`\`\`
        
        Answer the user's question concisely. Do not give the full solution unless explicitly asked. Focus on guiding them.
      `;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.origin,
        },
        body: JSON.stringify({
          model: "stepfun/step-3.5-flash:free",
          messages: [
             { role: "system", content: context },
             { role: "user", content: input }
          ]
        }),
      });

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || "I'm having trouble connecting right now. Please try again.";

      const aiMsg: Message = { role: 'ai', content: aiResponse, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please check your connection.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border">
        <DialogHeader className="p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
                <DialogTitle>AI Assistant</DialogTitle>
                <DialogDescription>Get help with your code</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-muted rounded-tl-sm'
                }`}>
                  <ReactMarkdown>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </motion.div>
            ))}
            {isLoading && (
               <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Bot size={14} />
                  </div>
                  <div className="bg-muted rounded-2xl p-3 rounded-tl-sm flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin opacity-50" />
                      <span className="text-xs opacity-50">Thinking...</span>
                  </div>
               </div>
            )}
            <div ref={scrollRef} className="h-px w-full" />
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border bg-background">
          <div className="flex gap-2">
            <Input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question..."
              disabled={isLoading}
              className="bg-muted/50 border-input focus-visible:ring-primary"
            />
            <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
