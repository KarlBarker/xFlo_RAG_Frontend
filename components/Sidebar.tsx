"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useChatStore } from '@/lib/stores/chatStore';
import { useState } from "react";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const { threads, currentThreadId, setCurrentThreadId, createThread, deleteThread } = useChatStore();
  const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);

  const handleNewChat = () => {
    const newThreadId = createThread('gpt-4-0');
    setCurrentThreadId(newThreadId);
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteThread(threadId);
  };

  return (
    <div className={cn("pb-12 w-64 border-r bg-gray-50/40", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-8 px-2 -mt-3">
            <Link href="/" className="flex items-center">
              <Image
                src="/xflo-logo.png"
                alt="xFlo Logo"
                width={96}
                height={32}
                priority
                className="dark:invert"
              />
            </Link>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2"
            onClick={handleNewChat}
          >
            <PlusCircle size={16} />
            New Chat
          </Button>
        </div>
        <div className="px-4">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Recent
          </h2>
          <ScrollArea className="h-[calc(100vh-200px)]">
            <div className="space-y-1">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className="group relative flex items-center px-2"
                  onMouseEnter={() => setHoveredThreadId(thread.id)}
                  onMouseLeave={() => setHoveredThreadId(null)}
                >
                  <Button
                    onClick={() => setCurrentThreadId(thread.id)}
                    variant={currentThreadId === thread.id ? "secondary" : "ghost"}
                    className="w-full justify-start text-left"
                  >
                    <span className="truncate">{thread.title || "New Chat"}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute right-2 h-6 w-6 opacity-0 transition-opacity",
                      hoveredThreadId === thread.id && "opacity-100"
                    )}
                    onClick={(e) => handleDeleteThread(thread.id, e)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}