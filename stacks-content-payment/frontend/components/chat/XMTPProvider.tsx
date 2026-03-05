"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    ReactNode,
} from "react";
import { useWalletClient, useAccount } from "wagmi";

// Types matching XMTP structures
interface XMTPMessage {
    id: string;
    content: string;
    senderAddress: string;
    sent: Date;
}

interface XMTPConversation {
    peerAddress: string;
    topic: string;
    createdAt: Date;
    messages: XMTPMessage[];
    lastMessage?: string;
}

interface XMTPContextValue {
    client: any | null;
    conversations: XMTPConversation[];
    activeConversation: XMTPConversation | null;
    messages: XMTPMessage[];
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    userAddress: string | null;
    initClient: () => Promise<void>;
    sendMessage: (content: string) => Promise<void>;
    startConversation: (peerAddress: string) => Promise<void>;
    selectConversation: (topic: string) => void;
    loadMessages: () => Promise<void>;
}

const XMTPContext = createContext<XMTPContextValue | undefined>(undefined);

export function XMTPProvider({ children }: { children: ReactNode }) {
    const { data: walletClient } = useWalletClient();
    const { address, isConnected: walletConnected } = useAccount();

    const [client, setClient] = useState<any | null>(null);
    const [conversations, setConversations] = useState<XMTPConversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<XMTPConversation | null>(null);
    const [messages, setMessages] = useState<XMTPMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize XMTP client
    const initClient = useCallback(async () => {
        if (!walletClient || !address) {
            setError("Please connect your Ethereum wallet first");
            return;
        }

        if (client) return; // Already initialized

        setIsLoading(true);
        setError(null);

        try {
            // Dynamically import to avoid SSR issues
            const { Client, IdentifierKind } = await import("@xmtp/browser-sdk");

            // Create signer from Viem WalletClient  
            const signer = {
                type: "EOA" as const,
                getIdentifier: () => ({
                    identifier: address.toLowerCase(),
                    identifierKind: IdentifierKind.Ethereum,
                }),
                signMessage: async (message: string) => {
                    const signature = await walletClient.signMessage({
                        message,
                    });
                    // Convert hex string to Uint8Array
                    const bytes = new Uint8Array(
                        (signature.slice(2).match(/.{2}/g) || []).map((byte: string) =>
                            parseInt(byte, 16)
                        )
                    );
                    return bytes;
                },
            };

            // Create XMTP client on dev network for testing
            const xmtpClient = await Client.create(signer, {
                env: "dev", // Use 'production' for mainnet
            });

            setClient(xmtpClient);
            setIsConnected(true);
            console.log("✅ XMTP client initialized for", address);

            // Load existing conversations
            await loadConversations(xmtpClient);
        } catch (err: any) {
            console.error("Failed to initialize XMTP:", err);
            setError(err.message || "Failed to connect to XMTP");
        } finally {
            setIsLoading(false);
        }
    }, [walletClient, address, client]);

    // Auto-init when wallet connects
    useEffect(() => {
        if (walletConnected && walletClient && address && !client && !isLoading) {
            initClient();
        }
    }, [walletConnected, walletClient, address, client, isLoading, initClient]);

    // Load all conversations
    const loadConversations = async (xmtpClient: any) => {
        try {
            // Sync conversations from the network
            await xmtpClient.conversations.sync();
            const allConvos = await xmtpClient.conversations.list();

            const convos: XMTPConversation[] = [];
            for (const convo of allConvos) {
                // Get the last few messages for preview
                await convo.sync();
                const msgs = await convo.messages({ limit: BigInt(1) });
                const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

                // For DMs, get peer address
                const members = await convo.members();
                const peerMember = members.find(
                    (m: any) =>
                        m.accountIdentifiers?.[0]?.identifier?.toLowerCase() !==
                        xmtpClient.accountIdentifier?.identifier?.toLowerCase()
                );
                const peerAddress = peerMember?.accountIdentifiers?.[0]?.identifier || "Unknown";

                convos.push({
                    peerAddress,
                    topic: convo.id,
                    createdAt: new Date(),
                    messages: [],
                    lastMessage: lastMsg?.content || undefined,
                });
            }

            setConversations(convos);
        } catch (err) {
            console.error("Failed to load conversations:", err);
        }
    };

    // Start a new conversation
    const startConversation = useCallback(
        async (peerAddress: string) => {
            if (!client) {
                setError("XMTP not connected");
                return;
            }

            setIsLoading(true);
            try {
                // Check if peer is on XMTP
                const canMessage = await client.canMessage([peerAddress]);
                if (!canMessage.get(peerAddress.toLowerCase())) {
                    setError("This address is not registered on XMTP");
                    setIsLoading(false);
                    return;
                }

                // Create DM conversation
                const convo = await client.conversations.newDm(peerAddress);
                await convo.sync();

                const newConvo: XMTPConversation = {
                    peerAddress,
                    topic: convo.id,
                    createdAt: new Date(),
                    messages: [],
                };

                setConversations((prev) => {
                    // Avoid duplicate
                    if (prev.find((c) => c.topic === convo.id)) return prev;
                    return [newConvo, ...prev];
                });

                setActiveConversation(newConvo);
                setMessages([]);
            } catch (err: any) {
                console.error("Failed to start conversation:", err);
                setError(err.message || "Failed to start conversation");
            } finally {
                setIsLoading(false);
            }
        },
        [client]
    );

    // Select a conversation
    const selectConversation = useCallback(
        (topic: string) => {
            const convo = conversations.find((c) => c.topic === topic);
            if (convo) {
                setActiveConversation(convo);
                setMessages([]);
            }
        },
        [conversations]
    );

    // Load messages for active conversation
    const loadMessages = useCallback(async () => {
        if (!client || !activeConversation) return;

        try {
            const convo = await client.conversations.getConversationById(
                activeConversation.topic
            );
            if (!convo) return;

            await convo.sync();
            const rawMessages = await convo.messages();

            const msgs: XMTPMessage[] = rawMessages.map((msg: any) => ({
                id: msg.id || String(msg.sentAtNs),
                content:
                    typeof msg.content === "string"
                        ? msg.content
                        : JSON.stringify(msg.content),
                senderAddress: msg.senderInboxId || "",
                sent: new Date(Number(msg.sentAtNs) / 1_000_000),
            }));

            setMessages(msgs);
        } catch (err) {
            console.error("Failed to load messages:", err);
        }
    }, [client, activeConversation]);

    // Load messages when active conversation changes
    useEffect(() => {
        if (activeConversation) {
            loadMessages();
        }
    }, [activeConversation, loadMessages]);

    // Stream new messages
    useEffect(() => {
        if (!client || !activeConversation) return;

        let stream: any = null;

        const startStreaming = async () => {
            try {
                const convo = await client.conversations.getConversationById(
                    activeConversation.topic
                );
                if (!convo) return;

                stream = await convo.stream();

                for await (const msg of stream) {
                    if (msg) {
                        const newMsg: XMTPMessage = {
                            id: msg.id || String(msg.sentAtNs),
                            content:
                                typeof msg.content === "string"
                                    ? msg.content
                                    : JSON.stringify(msg.content),
                            senderAddress: msg.senderInboxId || "",
                            sent: new Date(Number(msg.sentAtNs) / 1_000_000),
                        };

                        setMessages((prev) => {
                            // Avoid duplicate messages
                            if (prev.find((m) => m.id === newMsg.id)) return prev;
                            return [...prev, newMsg];
                        });
                    }
                }
            } catch (err) {
                console.error("Stream error:", err);
            }
        };

        startStreaming();

        return () => {
            // Clean up stream
            if (stream && typeof stream.return === "function") {
                stream.return();
            }
        };
    }, [client, activeConversation]);

    // Send a message
    const sendMessage = useCallback(
        async (content: string) => {
            if (!client || !activeConversation || !content.trim()) return;

            try {
                const convo = await client.conversations.getConversationById(
                    activeConversation.topic
                );
                if (!convo) throw new Error("Conversation not found");

                await convo.send(content);

                // Optimistically add message locally
                const optimisticMsg: XMTPMessage = {
                    id: `optimistic-${Date.now()}`,
                    content,
                    senderAddress: client.inboxId || address || "",
                    sent: new Date(),
                };

                setMessages((prev) => [...prev, optimisticMsg]);

                // Update conversation last message
                setConversations((prev) =>
                    prev.map((c) =>
                        c.topic === activeConversation.topic
                            ? { ...c, lastMessage: content }
                            : c
                    )
                );
            } catch (err: any) {
                console.error("Failed to send message:", err);
                setError(err.message || "Failed to send message");
            }
        },
        [client, activeConversation, address]
    );

    const value: XMTPContextValue = {
        client,
        conversations,
        activeConversation,
        messages,
        isConnected,
        isLoading,
        error,
        userAddress: address || null,
        initClient,
        sendMessage,
        startConversation,
        selectConversation,
        loadMessages,
    };

    return (
        <XMTPContext.Provider value={value}>{children}</XMTPContext.Provider>
    );
}

export function useXMTP() {
    const context = useContext(XMTPContext);
    if (context === undefined) {
        throw new Error("useXMTP must be used within an XMTPProvider");
    }
    return context;
}
