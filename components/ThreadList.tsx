'use client';

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useChatStore } from "@/lib/stores/chatStore";
import { useThreadNaming } from "@/hooks/useThreadNaming";
import { cn } from "@/lib/utils";

export function ThreadList() {
  const { threads, currentThreadId, setCurrentThreadId, deleteThread } = useChatStore();
  const { isPending } = useThreadNaming(currentThreadId);

  const sortedThreads = [...threads].sort((a, b) => b.lastActive - a.lastActive);
  console.log('ThreadList state:', { threads, sortedThreads, currentThreadId });

  if (sortedThreads.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {sortedThreads.map((thread) => (
        <div 
          key={thread.id} 
          className="group relative flex items-center px-2"
        >
          <Button
            variant={currentThreadId === thread.id ? "secondary" : "ghost"}
            className="flex-1 justify-start"
            onClick={() => setCurrentThreadId(thread.id)}
          >
            <div className="flex-1 truncate">
              <div className="flex items-center">
                {thread.name || (isPending && currentThreadId === thread.id
                  ? 'Naming conversation...'
                  : 'Untitled Chat')}
              </div>
            </div>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="invisible h-6 w-6 group-hover:visible"
            onClick={(e) => {
              e.stopPropagation();
              deleteThread(thread.id);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
