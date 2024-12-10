"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useChatStore } from '@/lib/stores/chatStore';
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThreadList } from "./ThreadList";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const { threads, currentThreadId, setCurrentThreadId, createThread, deleteThread } = useChatStore();
  const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

  const handleNewThread = () => {
    const threadId = createThread('gpt-4'); // Set default model
    setCurrentThreadId(threadId);
  };

  const handleDeleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreadToDelete(threadId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (threadToDelete) {
      deleteThread(threadToDelete);
      setDeleteDialogOpen(false);
      setThreadToDelete(null);
    }
  };

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-gray-50">
        <div className="flex h-14 items-center">
          <Link href="/" className="flex items-center pl-6">
            <Image
              src="/xflo-logo.png"
              alt="xFlo Logo"
              width={77}
              height={26}
              priority
              className="dark:invert"
            />
          </Link>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2"
            onClick={handleNewThread}
          >
            <PlusCircle size={16} />
            New Chat
          </Button>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <ThreadList />
          </ScrollArea>
        </div>
      </aside>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Chat</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" className="bg-neutral-950 hover:bg-neutral-950/90" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}