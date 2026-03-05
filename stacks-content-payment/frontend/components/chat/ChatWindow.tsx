"use client";

import { useEffect, useRef } from "react";
import { useXMTP } from "./XMTPProvider";
import { ChatInput } from "./ChatInput";
import { motion } from "framer-motion";
import { Phone, Video, Info, ShieldCheck, Lock } from "lucide-react";

export function ChatWindow() {
    const {
        messages,
        activeConversation,
        isConnected,
        isLoading,
        client,
        userAddress,
    } = useXMTP();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatTimestamp = (date: Date) => {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const shortenAddress = (addr: string) => {
        if (addr.length <= 12) return addr;
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    // No wallet connected
    if (!isConnected && !isLoading) {
        return (
            <div className="flex flex-col h-full bg-[#0c0c0e] items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                    <Lock size={36} className="text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-200">
                    Connect Ethereum Wallet
                </h3>
                <p className="text-gray-500 text-center max-w-sm text-sm">
                    XMTP uses your Ethereum wallet for decentralized, end-to-end encrypted
                    messaging. Connect via WalletConnect to start chatting.
                </p>
                <div className="flex items-center gap-2 text-xs text-green-400 mt-2">
                    <ShieldCheck size={14} />
                    <span>End-to-end encrypted • No central server</span>
                </div>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex flex-col h-full bg-[#0c0c0e] items-center justify-center gap-3">
                <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Connecting to XMTP network...</p>
            </div>
        );
    }

    // No active conversation
    if (!activeConversation) {
        return (
            <div className="flex flex-col h-full bg-[#0c0c0e] items-center justify-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                    <Lock size={36} className="text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-200">
                    Select a Conversation
                </h3>
                <p className="text-gray-500 text-center max-w-sm text-sm">
                    Choose a conversation from the sidebar or start a new one with an
                    Ethereum address.
                </p>
                <div className="flex items-center gap-2 text-xs text-green-400">
                    <ShieldCheck size={14} />
                    <span>Messages are end-to-end encrypted via XMTP</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0c0c0e] relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {activeConversation.peerAddress.slice(2, 4).toUpperCase()}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-200 text-sm">
                            {shortenAddress(activeConversation.peerAddress)}
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <Lock size={10} className="text-green-400" />
                            <p className="text-[11px] text-green-400">
                                Encrypted via XMTP
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <Phone size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <Video size={20} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <Info size={20} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar z-0">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                        <p>No messages yet. Start the conversation!</p>
                        <p className="text-xs mt-1 text-gray-600">
                            Messages are encrypted and delivered via XMTP
                        </p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe =
                        msg.senderAddress === client?.inboxId ||
                        msg.senderAddress === userAddress?.toLowerCase();
                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[70%] p-3 rounded-2xl ${isMe
                                        ? "bg-purple-600/90 text-white rounded-tr-sm"
                                        : "bg-white/10 text-gray-200 rounded-tl-sm"
                                    } backdrop-blur-sm shadow-sm`}
                            >
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <div
                                    className={`text-[10px] mt-1 ${isMe ? "text-purple-200" : "text-gray-500"
                                        } text-right`}
                                >
                                    {formatTimestamp(msg.sent)}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="z-10">
                <ChatInput />
            </div>
        </div>
    );
}
