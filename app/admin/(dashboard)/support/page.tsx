"use client";

import { useEffect, useState, useRef } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { getAllUsers } from "@/features/admin/actions";
import { sendSupportMessageAsAdmin, getSupportHistoryForAdmin } from "@/features/support/actions";
import { Loader2, MessageSquare, Send, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSupportPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [activeChatUserId, setActiveChatUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllUsers().then(data => {
      setUsers(data);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!activeChatUserId) return;

    const fetchHistory = async () => {
      try {
        const history = await getSupportHistoryForAdmin(activeChatUserId);
        setMessages(history);
      } catch (err) {
        console.error("Failed to fetch history via proxy:", err);
      }
    };

    fetchHistory();
    // Poll every 3 seconds
    const intervalId = setInterval(fetchHistory, 3000);

    return () => clearInterval(intervalId);
  }, [activeChatUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatUserId) return;

    const textToSend = newMessage;
    setNewMessage("");

    // Optimistic UI update
    const tempMsg = {
      id: Math.random().toString(),
      clientId: "admin",
      data: { text: textToSend, sender: "ADMIN" },
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await sendSupportMessageAsAdmin(activeChatUserId, textToSend);
    } catch (err) {
      console.error("Failed to send message via proxy:", err);
    }
  };

  const activeUser = users.find(u => u._id === activeChatUserId);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-fade-in">
      <PageHeader title="Live Support" description="Assist users in real-time." showBack={false} />

      <div className="flex flex-1 border rounded-xl overflow-hidden bg-card mt-4">
        {/* User List Sidebar */}
        <div className="w-1/3 border-r flex flex-col bg-muted/10">
          <div className="p-4 border-b font-medium bg-muted/20">All Users</div>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground" /></div>
            ) : (
              users.map(user => (
                <button
                  key={user._id}
                  onClick={() => setActiveChatUserId(user._id)}
                  className={`w-full text-left p-4 border-b hover:bg-muted/50 transition-colors flex items-center gap-3 ${activeChatUserId === user._id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UserIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium truncate">{user.name || user.username}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col bg-background">
          {activeChatUserId ? (
            <>
              <div className="p-4 border-b flex justify-between items-center bg-card shadow-sm z-10">
                <div>
                  <div className="font-bold">{activeUser?.name || activeUser?.username}</div>
                  <div className="text-sm text-muted-foreground">Support Channel</div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                {messages.length === 0 ? (
                  <div className="m-auto flex flex-col items-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                    <p>No messages yet.</p>
                  </div>
                ) : (
                  messages.map((msg, i) => {
                    const isAdmin = msg.data.sender === "ADMIN";
                    return (
                      <div key={i} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] rounded-2xl p-3 text-sm ${isAdmin ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-muted rounded-tl-sm border"}`}>
                          {msg.data.text}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="p-4 border-t bg-card flex gap-3">
                <Input 
                  value={newMessage} 
                  onChange={(e) => setNewMessage(e.target.value)} 
                  placeholder="Type your reply..." 
                  className="flex-1"
                />
                <Button type="submit" disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4 mr-2" /> Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-muted/5">
              <MessageSquare className="h-16 w-16 mb-4 text-muted/30" />
              <p className="text-lg font-medium">Select a user to view chat</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
