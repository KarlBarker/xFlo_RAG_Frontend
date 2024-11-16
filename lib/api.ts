export interface ChatMessage {
  content: string;
  role: 'user' | 'assistant';
}

export async function sendMessage(message: string): Promise<ChatMessage> {
  const response = await fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}