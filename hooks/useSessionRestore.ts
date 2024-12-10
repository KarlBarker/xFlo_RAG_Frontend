import { useEffect, useState } from 'react';
import { useChatStore } from '@/lib/stores/chatStore';

export const useSessionRestore = () => {
  const { threads, currentThreadId, lastActiveThread, setCurrentThreadId } = useChatStore();
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    // Only run once on mount
    const restoreSession = () => {
      // If we already have a current thread, do nothing
      if (currentThreadId && threads.some(t => t.id === currentThreadId)) {
        setIsRestoring(false);
        return;
      }

      // If there's a last active thread, restore it
      if (lastActiveThread && threads.some(t => t.id === lastActiveThread)) {
        setCurrentThreadId(lastActiveThread);
        setIsRestoring(false);
        return;
      }

      // If there are any threads, set the most recent one
      if (threads.length > 0) {
        const mostRecentThread = threads.reduce((latest, thread) => 
          thread.lastActive > latest.lastActive ? thread : latest
        );
        setCurrentThreadId(mostRecentThread.id);
      }
      
      setIsRestoring(false);
    };

    restoreSession();
  }, []); // Only run on mount

  return {
    isRestoring,
    hasThreads: threads.length > 0,
  };
};
