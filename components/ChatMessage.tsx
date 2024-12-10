import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Settings2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
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

export function ChatMessage({ content, role, metadata }: ChatMessageProps) {
  const [showSources, setShowSources] = useState(false);

  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg",
      role === 'user' ? 'bg-secondary' : 'bg-muted'
    )}>
      <div className="flex-shrink-0">
        {role === 'user' ? (
          <User className="h-6 w-6" />
        ) : (
          <Settings2 className="h-6 w-6" />
        )}
      </div>

      <div className="flex-1 space-y-2">
        <div className="prose dark:prose-invert">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>

        {metadata?.sources && metadata.sources.length > 0 && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSources(!showSources)}
              className="text-xs"
            >
              {showSources ? 'Hide Sources' : `Show Sources (${metadata.sources.length})`}
            </Button>

            {showSources && (
              <div className="mt-2 space-y-2">
                {metadata.sources.map((source, index) => (
                  <div key={index} className="p-2 rounded bg-background border text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <strong className="text-primary">{source.title}</strong>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        source.confidence === 'High' ? 'bg-green-100 text-green-800' :
                        source.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      )}>
                        {source.confidence} ({(source.similarity * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <p className="text-muted-foreground text-xs">{source.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {metadata && (
          <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
            {metadata.model && (
              <span>Model: {metadata.model}</span>
            )}
            {metadata.execution_time && (
              <span>• Time: {metadata.execution_time.toFixed(2)}s</span>
            )}
            {metadata.documents_found && (
              <span>• Documents: {metadata.documents_found}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}