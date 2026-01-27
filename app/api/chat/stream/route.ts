import { getAgentGraph } from '@/agent/graph';
import { AIMessageChunk } from '@langchain/core/messages';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { message, threadId } = await req.json();

    if (!message || !threadId) {
      return new Response('Message and threadId are required', { status: 400 });
    }

    const config = {
      configurable: {
        thread_id: threadId,
      },
    };

    const graph = await getAgentGraph();

    // Stream with "messages" mode for token-level streaming
    const stream = await graph.stream(
      { messages: [{ role: "user", content: message }] },
      { ...config, streamMode: 'messages' }
    );

    // Create a text stream from LangChain
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const [token] of stream) {
            // Only stream AI message chunks (not tool messages)
            if (token instanceof AIMessageChunk) {
              const content = token.content;

              if (content && typeof content === 'string' && content.length > 0) {
                controller.enqueue(encoder.encode(content));
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('[stream] Stream error:', error);
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
    console.error('[stream] Agent error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
