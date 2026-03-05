"use client";

import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatPage() {
    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#09090b]">
            {/* Sidebar */}
            <div className="hidden md:block h-full">
                <ChatSidebar />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 h-full">
                <ChatWindow />
            </div>
        </div>
    );
}
