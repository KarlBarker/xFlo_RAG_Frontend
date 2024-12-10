import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  isStreaming?: boolean;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

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
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '',
        metadata: null,
        isStreaming: true
      }]);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Skip status messages
        if (data.type === 'status') {
          return;
        }
        
        if (data.content !== undefined) {
          currentResponseContent += data.content;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: currentResponseContent,
              metadata: currentMetadata,
              isStreaming: true
            };
            return newMessages;
          });
        }

        if (data.metadata) {
          currentMetadata = data.metadata;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'assistant',
              content: currentResponseContent,
              metadata: currentMetadata,
              isStreaming: false
            };
            return newMessages;
          });
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        setIsLoading(false);
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[newMessages.length - 1]?.role === 'assistant') {
            newMessages[newMessages.length - 1].isStreaming = false;
          }
          return newMessages;
        });
      };

      return () => {
        eventSource.close();
      };

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your message.',
        isStreaming: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto">
      <ScrollArea className="flex-grow">
        <div className="flex flex-col">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex w-full py-8 ${
                message.role === 'assistant' ? 'bg-secondary/30' : ''
              }`}
            >
              <div className="w-full max-w-5xl mx-auto flex gap-4 px-6">
                <div className="w-8 h-8 flex-shrink-0">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-grow prose prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      code: ({node, inline, className, children, ...props}: any) => {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <SyntaxHighlighter
                            {...props}
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code {...props} className={className}>
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                  {message.isStreaming && (
                    <div className="mt-1">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  {message.metadata?.sources && (
                    <div className="mt-2 text-sm text-gray-500">
                      <p className="font-medium">Sources:</p>
                      <ul className="list-disc pl-5">
                        {message.metadata.sources.map((source: string, index: number) => (
                          <li key={index}>{source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="border-t bg-background p-4">
        <div className="max-w-5xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message xFlo..."
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Send'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}