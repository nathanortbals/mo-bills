import { getAgent } from '@/agent/graph';
import { HumanMessage } from '@langchain/core/messages';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new Response('No message provided', { status: 400 });
    }

    // Get agent and stream response
    const agent = getAgent();

    // Stream the agent's response
    const stream = await agent.stream({
      messages: [new HumanMessage(message)],
    });

    // Create a text stream from LangChain
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let previousContent = '';

          for await (const chunk of stream) {
            const messages = chunk.messages || [];
            if (messages.length > 0) {
              const lastMessage = messages[messages.length - 1];

              if (lastMessage.content) {
                const currentContent = typeof lastMessage.content === 'string'
                  ? lastMessage.content
                  : JSON.stringify(lastMessage.content);

                // Only send the new content (delta)
                if (currentContent.length > previousContent.length) {
                  const delta = currentContent.slice(previousContent.length);
                  controller.enqueue(encoder.encode(delta));
                  previousContent = currentContent;
                }
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Agent error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
