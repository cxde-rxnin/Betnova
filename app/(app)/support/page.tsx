"use client";

import { useEffect, useState, useRef } from "react";
import { Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { sendSupportMessage, getSupportHistory, markSupportMessagesAsRead } from "@/features/support/actions";
import { useQueryClient } from "@tanstack/react-query";

export default function SupportPage() {
  const { data: user } = useCurrentUser();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectionError, setConnectionError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const history = await getSupportHistory();
        setMessages(history);
        setConnectionError(false);

        // Mark as read and invalidate unread count
        await markSupportMessagesAsRead();
        queryClient.invalidateQueries({ queryKey: ["unreadSupportCount"] });
      } catch (err) {
        console.error("Failed to fetch support history via proxy:", err);
        setConnectionError(true);
      }
    };

    fetchHistory();
    // Poll every 3 seconds to get new messages bypassing the browser's Ably block
    const intervalId = setInterval(fetchHistory, 3000);

    return () => clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const textToSend = newMessage;
    setNewMessage("");

    // Optimistic UI update
    const tempMsg = {
      id: Math.random().toString(),
      clientId: user?._id,
      data: { text: textToSend, sender: "USER" },
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await sendSupportMessage(textToSend);
    } catch (err) {
      console.error("Failed to send message via proxy:", err);
      // Let the polling override this if there's a desync, or we could show an error toast
    }
  };

  if (!user) return null;

  return (
    <div className="w-full h-[calc(100vh-8rem)] flex flex-col animate-fade-in gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Customer Support</h1>
        <p className="text-muted-foreground mt-2">Chat directly with our support team to resolve any issues.</p>
      </div>

      <div className="flex-1 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-xl flex flex-col overflow-hidden shadow-2xl relative">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10 mix-blend-screen pointer-events-none" />

        <div className="bg-background/40 backdrop-blur-md border-b border-white/5 p-4 flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-semibold text-xl tracking-tight">Live Support</h2>
            <p className="text-sm flex items-center gap-2">
              {connectionError ? (
                <span className="text-destructive flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive shadow-[0_0_8px_var(--destructive)]"></span> Disconnected</span>
              ) : (
                <span className="text-muted-foreground flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></span> Agents are online</span>
              )}
            </p>
          </div>
        </div>

        {connectionError && (
          <div className="bg-destructive/10 border-b border-destructive/20 p-3 text-sm text-destructive font-medium text-center backdrop-blur-md">
            Unable to connect to the live chat server. Please check your network connection.
          </div>
        )}

        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6 bg-transparent z-10">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-4 animate-in fade-in zoom-in duration-500">
              <div className="h-24 w-24 rounded-full bg-primary/5 flex items-center justify-center mb-2">
                <MessageSquare className="h-10 w-10 text-primary/40" />
              </div>
              <p className="text-lg">Start a conversation.<br/><span className="text-sm opacity-70">Our support team typically replies in under 5 minutes.</span></p>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isUser = msg.clientId === user._id || msg.data.sender === "USER";
              return (
                <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`max-w-[75%] px-5 py-3.5 text-[15px] leading-relaxed shadow-lg ${
                    isUser 
                      ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl rounded-tr-sm" 
                      : "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl rounded-tl-sm text-foreground"
                  }`}>
                    {msg.data.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-background/40 backdrop-blur-md flex gap-3 z-10 items-center">
          <Input 
            value={newMessage} 
            onChange={(e) => setNewMessage(e.target.value)} 
            placeholder="Type your message here..." 
            className="flex-1 h-14 rounded-full bg-white/5 border-white/10 px-6 focus-visible:ring-primary/50 text-base"
          />
          <Button type="submit" size="icon" className="h-14 w-14 rounded-full shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95" disabled={!newMessage.trim()}>
            <Send className="w-6 h-6 ml-1" />
          </Button>
        </form>
      </div>
    </div>
  );
}
