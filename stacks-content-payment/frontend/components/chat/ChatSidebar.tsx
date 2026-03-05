"use client";

import { useState } from "react";
import { useXMTP } from "./XMTPProvider";
import { motion } from "framer-motion";
import {
    Search,
    MoreVertical,
    Plus,
    MessageCircle,
    ShieldCheck,
    Loader2,
} from "lucide-react";

export function ChatSidebar() {
    const {
        conversations,
        activeConversation,
        selectConversation,
        startConversation,
        isConnected,
        isLoading,
        error,
        initClient,
    } = useXMTP();

    const [searchTerm, setSearchTerm] = useState("");
    const [showNewChat, setShowNewChat] = useState(false);
    const [newAddress, setNewAddress] = useState("");
    const [startingChat, setStartingChat] = useState(false);

    const shortenAddress = (addr: string) => {
        if (addr.length <= 12) return addr;
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const handleNewConversation = async () => {
        if (!newAddress.trim()) return;

        setStartingChat(true);
        try {
            await startConversation(newAddress.trim());
            setNewAddress("");
            setShowNewChat(false);
        } catch (err) {
            console.error("Failed to start conversation:", err);
        } finally {
            setStartingChat(false);
        }
    };

    const filteredConversations = conversations.filter((c) =>
        c.peerAddress.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-white/5 backdrop-blur-md border-r border-white/10 w-full md:w-80">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        XMTP Chat
                    </h2>
                    <div className="flex items-center gap-1 mt-0.5">
                        <ShieldCheck size={10} className="text-green-400" />
                        <span className="text-[10px] text-green-400">
                            Decentralized • E2E Encrypted
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => setShowNewChat(!showNewChat)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-purple-400"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Not connected state */}
            {!isConnected && !isLoading && (
                <div className="p-6 flex flex-col items-center gap-3">
                    <MessageCircle size={32} className="text-gray-500" />
                    <p className="text-sm text-gray-400 text-center">
                        Connect your Ethereum wallet to start messaging
                    </p>
                    <button
                        onClick={initClient}
                        className="px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors"
                    >
                        Connect to XMTP
                    </button>
                </div>
            )}

            {/* Loading state */}
            {isLoading && (
                <div className="p-6 flex flex-col items-center gap-3">
                    <Loader2 size={24} className="text-purple-400 animate-spin" />
                    <p className="text-sm text-gray-400">Connecting to XMTP...</p>
                </div>
            )}

            {/* Error state */}
            {error && (
                <div className="p-4 mx-4 mt-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-xs text-red-400">{error}</p>
                </div>
            )}

            {/* New Chat Input */}
            {showNewChat && isConnected && (
                <div className="p-4 border-b border-white/10 bg-white/5">
                    <p className="text-xs text-gray-400 mb-2">
                        Enter an Ethereum address:
                    </p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            placeholder="0x..."
                            className="flex-1 bg-black/20 text-white text-sm placeholder-gray-600 px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            onKeyDown={(e) => e.key === "Enter" && handleNewConversation()}
                        />
                        <button
                            onClick={handleNewConversation}
                            disabled={startingChat || !newAddress.trim()}
                            className="px-3 py-2 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            {startingChat ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                "Chat"
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Search */}
            {isConnected && (
                <div className="p-4">
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/20 text-white text-sm placeholder-gray-600 pl-9 pr-4 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                        />
                    </div>
                </div>
            )}

            {/* Conversation List */}
            {isConnected && (
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredConversations.length === 0 && (
                        <div className="p-6 text-center">
                            <p className="text-sm text-gray-500">No conversations yet</p>
                            <p className="text-xs text-gray-600 mt-1">
                                Start one by clicking the + button
                            </p>
                        </div>
                    )}

                    {filteredConversations.map((convo) => (
                        <motion.div
                            key={convo.topic}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => selectConversation(convo.topic)}
                            className={`p-4 cursor-pointer transition-colors border-b border-white/5 ${activeConversation?.topic === convo.topic
                                    ? "bg-purple-500/10 border-l-2 border-l-purple-500"
                                    : "hover:bg-white/5 active:bg-white/10"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {convo.peerAddress.slice(2, 4).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-gray-200 text-sm truncate">
                                        {shortenAddress(convo.peerAddress)}
                                    </h3>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">
                                        {convo.lastMessage || "No messages yet"}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
