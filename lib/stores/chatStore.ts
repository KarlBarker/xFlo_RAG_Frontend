'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    model?: string;
    timestamp?: string;
    execution_time?: number;
    documents_found?: number;
    error?: string;
    sources?: Array<{
      title: string;
      content: string;
      similarity: number;
      confidence: string;
    }>;
  };
}

interface Thread {
  id: string;
  model: string;
  messages: Message[];
}

interface ChatStore {
  threads: Thread[];
  currentThreadId: string | null;
  createThread: (model: string) => string;
  deleteThread: (threadId: string) => void;
  addMessage: (threadId: string, message: Message) => void;
  updateMessage: (threadId: string, messageTimestamp: number, updates: Partial<Message>) => void;
  getThread: (threadId: string) => Thread | undefined;
  setCurrentThreadId: (threadId: string | null) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      threads: [],
      currentThreadId: null,
      
      createThread: (model) => {
        const thread: Thread = {
          id: Date.now().toString(),
          model,
          messages: [],
        };
        set((state) => ({
          threads: [...state.threads, thread],
          currentThreadId: thread.id,
        }));
        return thread.id;
      },

      deleteThread: (threadId: string) => {
        set((state) => {
          const newThreads = state.threads.filter((thread) => thread.id !== threadId);
          return {
            threads: newThreads,
            currentThreadId: state.currentThreadId === threadId ? 
              (newThreads.length > 0 ? newThreads[0].id : null) : 
              state.currentThreadId
          };
        });
      },
      
      addMessage: (threadId, message) => {
        set((state) => ({
          threads: state.threads.map((thread) => {
            if (thread.id === threadId) {
              // If this is an update to an existing message (same timestamp)
              const existingMessageIndex = thread.messages.findIndex(
                (m) => m.timestamp === message.timestamp
              );
              
              if (existingMessageIndex !== -1) {
                // Update existing message
                const updatedMessages = [...thread.messages];
                updatedMessages[existingMessageIndex] = {
                  ...updatedMessages[existingMessageIndex],
                  ...message
                };
                return {
                  ...thread,
                  messages: updatedMessages,
                };
              }
              
              // Add new message
              return {
                ...thread,
                messages: [...thread.messages, message],
              };
            }
            return thread;
          }),
        }));
      },

      updateMessage: (threadId, messageTimestamp, updates) => {
        set((state) => ({
          threads: state.threads.map((thread) => {
            if (thread.id === threadId) {
              const messageIndex = thread.messages.findIndex(
                (m) => m.timestamp === messageTimestamp
              );
              if (messageIndex !== -1) {
                const updatedMessages = [...thread.messages];
                updatedMessages[messageIndex] = {
                  ...updatedMessages[messageIndex],
                  ...updates
                };
                return {
                  ...thread,
                  messages: updatedMessages,
                };
              }
            }
            return thread;
          }),
        }));
      },

      getThread: (threadId) => {
        return get().threads.find((thread) => thread.id === threadId);
      },

      setCurrentThreadId: (threadId) => {
        set({ currentThreadId: threadId });
      },
    }),
    {
      name: 'chat-store',
    }
  )
);
