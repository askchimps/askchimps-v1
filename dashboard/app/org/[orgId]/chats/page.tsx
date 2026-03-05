"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { useOrganisationStore } from "@/stores/organisation-store";
import { chatApi, ChatSource } from "@/lib/api/chat";
import { ChatListItem } from "@/components/chats/chat-list-item";
import { ChatDetail } from "@/components/chats/chat-detail";
import { ChatEmptyState } from "@/components/chats/chat-empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function ChatsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { selectedOrganisation } = useOrganisationStore();
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [source, setSource] = useState<ChatSource | "ALL">("ALL");

    // Read chatId and source from URL on mount
    useEffect(() => {
        const chatIdFromUrl = searchParams.get("chatId");
        const sourceFromUrl = searchParams.get("source");

        if (chatIdFromUrl) {
            setSelectedChatId(chatIdFromUrl);
        }
        if (sourceFromUrl && (sourceFromUrl === "WHATSAPP" || sourceFromUrl === "INSTAGRAM")) {
            setSource(sourceFromUrl as ChatSource);
        }
    }, [searchParams]);

    // Fetch chats list
    const {
        data: chatsData,
        isLoading: isLoadingChats,
        error: chatsError,
    } = useQuery({
        queryKey: ["chats", selectedOrganisation?.id, source],
        queryFn: () =>
            chatApi.getAll(selectedOrganisation!.id, {
                source: source !== "ALL" ? source : undefined,
            }),
        enabled: !!selectedOrganisation,
        staleTime: 30000, // 30 seconds
    });

    // Fetch selected chat details with messages
    const { data: chatDetailData, isLoading: isLoadingDetail } = useQuery({
        queryKey: ["chat", selectedOrganisation?.id, selectedChatId],
        queryFn: () =>
            chatApi.getById(selectedOrganisation!.id, selectedChatId!, true),
        enabled: !!selectedOrganisation && !!selectedChatId,
        staleTime: 60000, // 1 minute
    });

    console.log("Chats Data:", chatsData);
    console.log("Chat Detail Data:", chatDetailData);

    const chats = chatsData?.data || [];
    const total = chats.length;
    const selectedChat = chatDetailData?.data;

    // Update URL when chat is selected (using query params to preserve the page)
    const handleChatSelect = (chatId: string) => {
        setSelectedChatId(chatId);
        const orgId = selectedOrganisation?.id;
        if (orgId) {
            const params = new URLSearchParams();
            params.set("chatId", chatId);
            if (source !== "ALL") params.set("source", source);

            const queryString = params.toString();
            router.replace(
                `/org/${orgId}/chats?${queryString}`,
                { scroll: false },
            );
        }
    };

    return (
        <DashboardLayout>
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Left Panel - Chat List */}
                <div className="bg-card flex w-96 flex-col border-r">
                    {/* Header */}
                    <div className="border-b p-4">
                        <div className="mb-1 flex items-center gap-2">
                            <MessageSquare className="text-primary h-5 w-5" />
                            <h1 className="text-xl font-bold">Chats</h1>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {total} total chat{total !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {/* Filters */}
                    <div className="space-y-3 border-b p-4">
                        <div className="grid grid-cols-1 gap-2">
                            <select
                                value={source}
                                onChange={(e) =>
                                    setSource(e.target.value as ChatSource | "ALL")
                                }
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            >
                                <option value="ALL">All Sources</option>
                                <option value="WHATSAPP">WhatsApp</option>
                                <option value="INSTAGRAM">Instagram</option>
                            </select>
                        </div>
                    </div>

                    {/* Chat List */}
                    <ScrollArea className="flex-1">
                        {isLoadingChats ? (
                            <div className="space-y-4 p-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                ))}
                            </div>
                        ) : chatsError ? (
                            <div className="p-4">
                                <Card className="bg-destructive/10 border-destructive/20 p-4">
                                    <p className="text-destructive text-sm">
                                        Failed to load chats. Please try again.
                                    </p>
                                </Card>
                            </div>
                        ) : chats.length === 0 ? (
                            <ChatEmptyState
                                message="No chats found"
                                description={
                                    source !== "ALL"
                                        ? "Try adjusting your filters"
                                        : "Chats will appear here once they are created"
                                }
                            />
                        ) : (
                            <div>
                                {chats.map((chat) => (
                                    <ChatListItem
                                        key={chat.id}
                                        chat={chat}
                                        isSelected={selectedChatId === chat.id}
                                        onClick={() =>
                                            handleChatSelect(chat.id)
                                        }
                                        orgId={selectedOrganisation?.id}
                                    />
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Right Panel - Chat Detail */}
                <div className="bg-muted/30 flex-1">
                    {!selectedChatId ? (
                        <ChatEmptyState
                            message="Select a chat to view details"
                            description="Choose a chat from the list on the left"
                        />
                    ) : isLoadingDetail ? (
                        <div className="h-full space-y-6 p-6">
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-1/2" />
                                <Skeleton className="h-4 w-1/4" />
                            </div>
                            <Skeleton className="h-32 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                    ) : selectedChat ? (
                        <ChatDetail
                            chat={selectedChat}
                            orgId={selectedOrganisation?.id}
                        />
                    ) : (
                        <ChatEmptyState
                            message="Chat not found"
                            description="The selected chat could not be loaded"
                        />
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
