import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    console.log('API: Starting title generation');
    const { messages } = await req.json();
    console.log('API: Received messages:', messages);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7,
      max_tokens: 40,
    });

    const title = completion.choices[0].message.content?.trim() || 'Untitled Chat';
    console.log('API: Generated title:', title);
    
    return NextResponse.json({ title });
  } catch (error) {
    console.error('API Error generating title:', error);
    return NextResponse.json({ title: 'Untitled Chat' }, { status: 500 });
  }
}
