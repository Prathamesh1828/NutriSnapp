"use client";
// ── Imports ───────────────────────────────────────────────────────────────────
import { useEffect, useState, useRef, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useSocket } from "@/contexts/SocketContext";
import {
    Search, Edit3, MoreVertical, History, Mic, Plus,
    Send, ClipboardList, ChevronLeft, X, Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Shared UI Components ───────────────────────────────────────────────────────
function Avatar({ initials, size = "md", online }: { initials: string; size?: "sm" | "md" | "lg"; online?: boolean }) {
    const sz = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-11 h-11 text-sm" }[size];
    const isAI = initials === "AI";
    return (
        <div className="relative flex-shrink-0">
            <div className={`${sz} rounded-full flex items-center justify-center font-black text-[#0A0A0F] ${isAI ? "bg-[#B8FF3C]" : "bg-gradient-to-br from-[#B8FF3C]/80 to-emerald-500"}`}>
                {initials}
            </div>
            {online !== undefined && (
                <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#0D0D12] ${online ? "bg-[#B8FF3C]" : "bg-slate-600"}`} />
            )}
        </div>
    );
}

// ── Chat List ──────────────────────────────────────────────────────────────────
function ChatList({ chats, selected, onSelect, currentUserId }: { chats: any[]; selected: string | null; onSelect: (id: string) => void, currentUserId: string }) {
    return (
        <div className="flex flex-col h-full bg-[#0D0D12]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/5 flex-shrink-0">
                <h2 className="text-lg font-black text-white">Messages</h2>
                <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors">
                    <Edit3 size={15} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {chats.length === 0 ? (
                    <p className="text-center text-slate-500 text-sm mt-10">No active chats yet</p>
                ) : chats.map((chat) => {
                    const otherUser = chat.participants.find((p: any) => p._id !== currentUserId);
                    const name = otherUser ? (otherUser.role === 'coach' ? `Coach ${otherUser.email.split('@')[0]}` : otherUser.email.split('@')[0]) : "Unknown";
                    const initial = name.charAt(0).toUpperCase();

                    return (
                        <button
                            key={chat._id}
                            onClick={() => onSelect(chat._id)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all border-l-2 ${selected === chat._id
                                ? "bg-[#B8FF3C]/8 border-[#B8FF3C]"
                                : "border-transparent hover:bg-white/3"
                                }`}
                        >
                            <Avatar initials={initial} size="md" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <span className="font-bold text-sm text-white truncate">{name}</span>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-xs text-slate-400 truncate">{chat.lastMessage || 'Start a conversation...'}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ── Conversation ───────────────────────────────────────────────────────────────
function Conversation({ chatId, currentUserId, onBack, autoHello }: { chatId: string; currentUserId: string; onBack: () => void; autoHello?: boolean }) {
    const { socket } = useSocket();
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasAutoSent = useRef(false);

    // Initial load
    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/chat/${chatId}/messages`);
                const json = await res.json();
                if (json.success) {
                    setMessages(json.data);
                }
            } catch (err) {
                console.error("DEBUG: fetchHistory failed", err);
            }
        }
        if (chatId) {
            fetchHistory();
            if (socket) socket.emit("join_chat", chatId);
        }
    }, [chatId, socket]);

    // Separate effect for auto-hello to ensure it waits for socket and chatId
    useEffect(() => {
        if (autoHello && socket && chatId && !hasAutoSent.current) {
            console.log("DEBUG: Auto-hello triggering now", { chatId, currentUserId });
            hasAutoSent.current = true;
            
            const timer = setTimeout(() => {
                socket.emit("send_message", {
                    chatId,
                    senderId: currentUserId,
                    text: "Hello Coach! I'm excited to start this journey with you."
                });
            }, 800);
            
            return () => clearTimeout(timer);
        }
    }, [autoHello, socket, chatId, currentUserId]);

    // Listen for live socket broadcasts
    useEffect(() => {
        if (!socket) return;
        const handleMsg = (newMessage: any) => {
            if (newMessage.chatId === chatId) {
                setMessages((prev) => [...prev, newMessage]);
            }
        };
        socket.on("receive_message", handleMsg);
        return () => { socket.off("receive_message", handleMsg); };
    }, [socket, chatId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSend = () => {
        console.log("DEBUG: handleSend called", { hasInput: !!input.trim(), hasImage: !!imagePreview });
        if ((!input.trim() && !imagePreview) || !socket) return;
        
        const payload = {
            chatId,
            senderId: currentUserId,
            text: input.trim() || "",
            image: imagePreview || null
        };
        
        socket.emit("send_message", payload);
        setInput("");
        setImagePreview(null);
    };

    return (
        <div className="flex flex-col h-full bg-[#0A0A0F]">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 flex-shrink-0 bg-[#0D0D12]">
                <button
                    onClick={onBack}
                    className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors flex-shrink-0"
                >
                    <ChevronLeft size={16} />
                </button>
                <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-sm leading-none">Conversation View</p>
                </div>
                <div className="flex items-center gap-1.5">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <MoreVertical size={15} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
                {messages.length === 0 ? (
                    <div className="flex justify-center text-slate-500 text-sm mt-5">No messages yet. Say hi!</div>
                ) : messages.map((msg, i) => {
                    const isMe = msg.senderId._id === currentUserId || msg.senderId === currentUserId;
                    return (
                        <div key={msg._id || i} className={`flex items-end gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                            <div className={`max-w-[75%] sm:max-w-[65%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${isMe
                                    ? "bg-[#1E2B12] text-white rounded-br-sm border border-[#B8FF3C]/15 shadow-sm"
                                    : "bg-[#161A10] text-slate-200 rounded-bl-sm border border-white/5"
                                    }`}>
                                    {msg.image && (
                                        <div className="mb-2 overflow-hidden rounded-xl border border-white/5 bg-black/20">
                                            <img src={msg.image} alt="Shared" className="max-w-full h-auto object-cover max-h-64" />
                                        </div>
                                    )}
                                    {msg.text}
                                </div>
                                <span className="text-[9px] text-slate-600 font-bold px-1 uppercase tracking-tighter">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-white/5 bg-[#0D0D12] pb-10 sm:pb-4">
                {/* Image Preview */}
                <AnimatePresence>
                    {imagePreview && (
                        <div className="mb-3 relative group w-24 h-24">
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl border border-white/10" />
                            <button 
                                onClick={() => setImagePreview(null)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg z-10"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-2">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        accept="image/*" 
                        className="hidden" 
                    />
                    
                    <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${imagePreview ? 'bg-[#B8FF3C] text-[#0A0A0F]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <ImageIcon size={18} />
                        </button>
                        
                        <button 
                            onClick={handleSend} 
                            disabled={!input.trim() && !imagePreview} 
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#B8FF3C] text-[#0A0A0F] hover:bg-[#d4ff6e] transition-colors disabled:opacity-30"
                        >
                            <Send size={16} />
                        </button>
                    </div>

                    <div className="flex-1">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder={imagePreview ? "Add a caption..." : "Type your message..."}
                            className="w-full bg-white/5 border border-white/8 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#B8FF3C]/30 transition-colors"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
function MessagesContent() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const initialChatId = searchParams.get('chatId');
    const autoHello = searchParams.get('autoHello') === 'true';

    console.log("DEBUG: MessagesContent Initialized", { initialChatId, autoHello });

    const [chats, setChats] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(initialChatId);

    // Sync search param with internal state (crucial for notification redirects)
    useEffect(() => {
        if (initialChatId) {
            setSelectedChat(initialChatId);
            setMobileView("chat");
        }
    }, [initialChatId]);

    // Mobile view states: "list" | "chat"
    const [mobileView, setMobileView] = useState<"list" | "chat">(initialChatId ? "chat" : "list");

    useEffect(() => {
        async function fetchChats() {
            if (!session?.user?.id) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/chat?userId=${session.user.id}`);
                const json = await res.json();
                if (json.success) {
                    const unique = new Map();
                    json.data.forEach((c: any) => {
                        const otherId = c.participants.find((p: any) => p._id !== session.user.id)?._id;
                        if (otherId && !unique.has(otherId)) unique.set(otherId, c);
                    });
                    setChats(Array.from(unique.values()));
                }
            } catch (err) {
                console.error("Failed fetching chat list", err);
            }
        }
        fetchChats();
    }, [session?.user?.id]);

    const handleSelectChat = (id: string) => {
        setSelectedChat(id);
        setMobileView("chat");
    };

    return (
        <div className="h-full flex overflow-hidden rounded-xl border border-white/5">

            {/* ── Col 1: Chat list ── */}
            <div className={`
                flex-shrink-0 w-full lg:w-[260px] xl:w-[280px] border-r border-white/5
                ${mobileView === "list" ? "block" : "hidden"} lg:block
            `}>
                <div className="h-full">
                    {session?.user?.id && (
                        <ChatList
                            chats={chats}
                            selected={selectedChat}
                            onSelect={handleSelectChat}
                            currentUserId={session.user.id}
                        />
                    )}
                </div>
            </div>

            {/* ── Col 2: Conversation ── */}
            <div className={`
                flex-1 min-w-0
                ${mobileView === "chat" ? "flex" : "hidden"} lg:flex
                flex-col
            `}>
                <div className="flex-1 min-h-0 relative">
                    {selectedChat && session?.user?.id ? (
                        <Conversation
                            chatId={selectedChat}
                            currentUserId={session.user.id}
                            onBack={() => setMobileView("list")}
                            autoHello={selectedChat === initialChatId && autoHello}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-500 font-bold">
                            Select a chat to start messaging
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading messages...</div>}>
            <MessagesContent />
        </Suspense>
    );
}