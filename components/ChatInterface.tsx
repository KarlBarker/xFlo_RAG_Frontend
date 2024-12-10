'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, User } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChatStore } from '@/lib/stores/chatStore';
import { useSessionRestore } from '@/hooks/useSessionRestore';
import { useThreadNaming } from '@/hooks/useThreadNaming';
import { cn } from '@/lib/utils';

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

interface StreamingMessage extends Message {
  isStreaming?: boolean;
}

export function ChatInterface() {
  const { threads, currentThreadId, addMessage, createThread, getThread } = useChatStore();
  const { isRestoring } = useSessionRestore();
  const { isPending } = useThreadNaming(currentThreadId);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get current thread's messages or empty array if no thread
  const messages = currentThreadId ? getThread(currentThreadId)?.messages || [] : [];
  const currentThread = currentThreadId ? getThread(currentThreadId) : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create initial thread if none exists
  useEffect(() => {
    if (!isRestoring && threads.length === 0 && !currentThreadId) {
      createThread('gpt-4'); // Default model
    }
  }, [isRestoring, threads.length, createThread, currentThreadId]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading || !currentThreadId) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Create message object with timestamp
    const message: Message = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    // Add user message to store
    addMessage(currentThreadId, message);

    try {
      // Close any existing EventSource
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      let currentResponseContent = '';
      let currentMetadata: any = null;

      // Create new EventSource for streaming response
      const eventSource = new EventSource(
        `${process.env.NEXT_PUBLIC_API_URL}/chat/stream?message=${encodeURIComponent(userMessage)}`, 
        { withCredentials: true }
      );

      eventSourceRef.current = eventSource;

      // Add initial assistant message with streaming state
      const assistantMessage: StreamingMessage = {
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true
      };
      addMessage(currentThreadId, assistantMessage);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'status') return;
        
        if (data.content !== undefined) {
          currentResponseContent += data.content;
          const updatedMessage: StreamingMessage = {
            role: 'assistant',
            content: currentResponseContent,
            timestamp: assistantMessage.timestamp,
            isStreaming: true
          };
          addMessage(currentThreadId, updatedMessage);
        }

        if (data.metadata) {
          currentMetadata = data.metadata;
          const finalMessage: StreamingMessage = {
            role: 'assistant',
            content: currentResponseContent,
            timestamp: assistantMessage.timestamp,
            metadata: currentMetadata,
            isStreaming: false
          };

          // After message is complete, check if we should generate a thread name
          if (!currentThread?.name && messages.length >= 2) {
            // Removed generateThreadName call
          }
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsLoading(false);
        const errorMessage: StreamingMessage = {
          role: 'assistant',
          content: currentResponseContent || 'Sorry, there was an error processing your message.',
          timestamp: assistantMessage.timestamp,
          isStreaming: false
        };
        addMessage(currentThreadId, errorMessage);
      };

      return () => {
        eventSource.close();
      };

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: StreamingMessage = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message.',
        timestamp: Date.now(),
        isStreaming: false
      };
      addMessage(currentThreadId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-2xl mx-auto px-4 pt-6">
            {messages.map((message, index) => (
              <div
                key={message.timestamp}
                className={cn(
                  "mb-4 flex",
                  message.role === "user" && "justify-end",
                  message.role === "assistant" && "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <div className="w-8 h-8 flex-shrink-0 mt-2.5 mr-4">
                    <Image
                      src="/images/xflo_icon.png"
                      alt="xFlo AI"
                      width={32}
                      height={32}
                      className="rounded-full"
                      priority
                      key={Date.now()}
                    />
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-lg px-4 py-3",
                    message.role === "assistant" ? "bg-transparent" : "bg-gray-50"
                  )}
                >
                  <div className="flex-1">
                    {message.role === 'assistant' ? (
                      <ReactMarkdown
                        className="prose prose-neutral max-w-none [&>p]:mb-4 [&>p:last-child]:mb-0"
                        components={{
                          code(props) {
                            const { className, children } = props;
                            const match = /language-(\w+)/.exec(className || '');
                            return match ? (
                              <SyntaxHighlighter
                                style={oneDark}
                                language={match[1]}
                                PreTag="div"
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            ) : (
                              <code className={className}>
                                {children}
                              </code>
                            );
                          },
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    ) : (
                      <p className="whitespace-pre-line">{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start py-4">
                <div className="flex gap-4 max-w-[80%]">
                  <div className="w-8 h-8 flex-shrink-0 mt-2.5">
                    <Image
                      src="/images/xflo_icon.png"
                      alt="xFlo AI"
                      width={32}
                      height={32}
                      className="rounded-full"
                      priority
                    />
                  </div>
                  <div className="flex items-center bg-white rounded-xl px-4 py-3">
                    <span className="text-gray-400 animate-[thinking_2s_ease-in-out_infinite]">
                      thinking
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="flex-none h-24">
        <div className="fixed bottom-6 right-0 left-64">
          <div className="max-w-2xl mx-auto px-4">
            <div className="relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Type a message..."
                disabled={isLoading || isRestoring}
                className="flex-1 py-6 pr-12 bg-gray-50 border-0 ring-0 focus:ring-0 focus-visible:ring-0"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!currentThreadId || isLoading || !input.trim()}
                  className="w-[30px] h-[30px] bg-neutral-950 rounded-full flex items-center justify-center enabled:hover:opacity-90 disabled:opacity-40 transition-opacity"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-white"
                    >
                      <path
                        d="M22 2L11 13"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 2L15 22L11 13L2 9L22 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}