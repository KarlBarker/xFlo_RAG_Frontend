"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatMessage } from "@/components/ChatMessage";
import { sendMessage } from "@/lib/api";
import type { ChatMessage as ChatMessageType } from "@/lib/api";

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await sendMessage(userMessage);
      setMessages(prev => [...prev, response]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8">
      <Tabs defaultValue="gpt4" className="mb-8">
        <TabsList>
          <TabsTrigger value="gpt4">GPT 4</TabsTrigger>
          <TabsTrigger value="gpt4mini">GPT 4 mini</TabsTrigger>
        </TabsList>
      </Tabs>

      <ScrollArea className="h-[calc(100vh-300px)] pr-4">
        <div className="space-y-8">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              content={message.content}
              role={message.role}
            />
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-4 mt-8">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}