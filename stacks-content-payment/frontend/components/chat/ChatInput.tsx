"use client";

import { useState } from "react";
import { Send, Smile } from "lucide-react";
import { motion } from "framer-motion";
import { useXMTP } from "./XMTPProvider";

export function ChatInput() {
    const [message, setMessage] = useState("");
    const { sendMessage, isConnected, activeConversation } = useXMTP();

    const handleSend = async () => {
        if (message.trim() && isConnected && activeConversation) {
            await sendMessage(message.trim());
            setMessage("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const canSend = isConnected && activeConversation && message.trim();

    return (
        <div className="p-4 bg-white/5 backdrop-blur-md border-t border-white/10">
            <div className="flex items-end gap-2 bg-black/20 p-2 rounded-2xl border border-white/5 focus-within:ring-2 focus-within:ring-purple-500/50 transition-all">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        !isConnected
                            ? "Connect wallet to chat..."
                            : !activeConversation
                                ? "Select a conversation..."
                                : "Type a message (E2E encrypted)..."
                    }
                    disabled={!isConnected || !activeConversation}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none py-2 max-h-32 min-h-[40px] custom-scrollbar disabled:opacity-50"
                    rows={1}
                />
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <Smile size={20} />
                </button>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSend}
                    disabled={!canSend}
                    className={`p-2 rounded-full transition-colors ${canSend
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                            : "bg-white/10 text-gray-500 cursor-not-allowed"
                        }`}
                >
                    <Send size={20} />
                </motion.button>
            </div>
        </div>
    );
}
