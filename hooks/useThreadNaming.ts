'use client';

import { useState, useEffect } from 'react';
import { useChatStore } from '@/lib/stores/chatStore';

export const useThreadNaming = (threadId: string | null) => {
  const [isPending, setIsPending] = useState(false);
  const { getThread, updateThreadName } = useChatStore();

  useEffect(() => {
    const generateThreadName = async () => {
      console.log('Hook: Starting name generation for thread:', threadId);
      const thread = threadId ? getThread(threadId) : null;
      console.log('Hook: Thread state:', { 
        threadId, 
        threadExists: !!thread, 
        hasName: !!thread?.name, 
        messageCount: thread?.messages.length,
        isPending 
      });

      if (!thread) {
        console.log('Hook: No thread found');
        return;
      }
      if (thread.name) {
        console.log('Hook: Thread already has name:', thread.name);
        return;
      }
      if (!thread.messages.length) {
        console.log('Hook: Thread has no messages');
        return;
      }
      if (isPending) {
        console.log('Hook: Already generating name');
        return;
      }

      setIsPending(true);
      try {
        const firstUserMessage = thread.messages.find(m => m.role === 'user')?.content;
        console.log('Hook: First user message:', firstUserMessage);
        if (!firstUserMessage) {
          console.log('Hook: No user message found');
          return;
        }

        console.log('Hook: Sending request to API');
        const response = await fetch('/api/generate-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              role: 'system',
              content: 'Create a very brief, descriptive title (max 40 chars) for this chat based on the user\'s first message. Focus on the main topic or question. Don\'t use quotes or punctuation.'
            }, {
              role: 'user',
              content: firstUserMessage
            }]
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Hook: API request failed:', errorText);
          throw new Error('Failed to generate title');
        }
        
        const { title } = await response.json();
        console.log('Hook: Received title:', title);
        
        if (threadId) {
          console.log('Hook: Updating thread name');
          updateThreadName(threadId, title);
        }
      } catch (error) {
        console.error('Hook: Error in name generation:', error);
      } finally {
        setIsPending(false);
      }
    };

    generateThreadName();
  }, [threadId, getThread, updateThreadName, isPending]);

  return { isPending };
};
