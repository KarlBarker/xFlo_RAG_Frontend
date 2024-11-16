import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Settings2, User } from "lucide-react";

interface ChatMessageProps {
  content: string;
  role: 'user' | 'assistant';
}

export function ChatMessage({ content, role }: ChatMessageProps) {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-8 w-8">
        {role === 'assistant' ? (
          <Settings2 className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </Avatar>
      <Card className="p-4 flex-1">
        <p className="text-sm text-muted-foreground">{content}</p>
      </Card>
    </div>
  );
}