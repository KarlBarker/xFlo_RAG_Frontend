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
  name?: string;
  createdAt: number;
  lastActive: number;
}

interface ChatStore {
  threads: Thread[];
  currentThreadId: string | null;
  lastActiveThread: string | null;
  createThread: (model: string) => string;
  deleteThread: (threadId: string) => void;
  addMessage: (threadId: string, message: Message) => void;
  updateMessage: (threadId: string, messageTimestamp: number, updates: Partial<Message>) => void;
  getThread: (threadId: string) => Thread | undefined;
  setCurrentThreadId: (threadId: string | null) => void;
  updateThreadName: (threadId: string, name: string) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      threads: [],
      currentThreadId: null,
      lastActiveThread: null,

      createThread: (model: string) => {
        const currentThread = get().currentThreadId ? get().threads.find(t => t.id === get().currentThreadId) : null;
        if (currentThread && currentThread.messages.length === 0) {
          return currentThread.id;
        }

        const threadId = crypto.randomUUID();
        const newThread: Thread = {
          id: threadId,
          model,
          messages: [],
          createdAt: Date.now(),
          lastActive: Date.now(),
        };
        set((state) => ({
          threads: [newThread, ...state.threads],
          currentThreadId: threadId,
          lastActiveThread: threadId,
        }));
        return threadId;
      },

      deleteThread: (threadId: string) => {
        console.log('Deleting thread:', threadId);
        set((state) => {
          console.log('Current state:', {
            threads: state.threads,
            currentThreadId: state.currentThreadId,
            lastActiveThread: state.lastActiveThread
          });
          const newThreads = state.threads.filter((thread) => thread.id !== threadId);
          const newCurrentId = state.currentThreadId === threadId ? 
            (newThreads.length > 0 ? newThreads[0].id : null) : 
            state.currentThreadId;
          console.log('New state:', {
            threads: newThreads,
            currentThreadId: newCurrentId,
            lastActiveThread: newCurrentId
          });
          return {
            threads: newThreads,
            currentThreadId: newCurrentId,
            lastActiveThread: state.lastActiveThread === threadId ? newCurrentId : state.lastActiveThread,
          };
        });
      },
      
      addMessage: (threadId, message) => {
        const now = Date.now();
        set((state) => ({
          threads: state.threads.map((thread) => {
            if (thread.id === threadId) {
              const existingMessageIndex = thread.messages.findIndex(
                (m) => m.timestamp === message.timestamp
              );
              
              if (existingMessageIndex !== -1) {
                const updatedMessages = [...thread.messages];
                updatedMessages[existingMessageIndex] = {
                  ...updatedMessages[existingMessageIndex],
                  ...message
                };
                return {
                  ...thread,
                  messages: updatedMessages,
                  lastActive: now,
                };
              }
              
              return {
                ...thread,
                messages: [...thread.messages, message],
                lastActive: now,
              };
            }
            return thread;
          }),
          lastActiveThread: threadId,
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

      setCurrentThreadId: (threadId: string | null) => {
        set((state) => ({
          currentThreadId: threadId,
          lastActiveThread: threadId || state.lastActiveThread,
        }));
      },

      updateThreadName: (threadId, name) => {
        set((state) => ({
          threads: state.threads.map((thread) => 
            thread.id === threadId ? { ...thread, name } : thread
          ),
        }));
      },
    }),
    {
      name: 'chat-store',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          const { threads, lastActiveThread } = state;
          if (threads.length > 0 && lastActiveThread) {
            state.setCurrentThreadId(lastActiveThread);
          }
        }
      },
    }
  )
);
