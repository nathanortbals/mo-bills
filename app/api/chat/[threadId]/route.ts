import { getAgentGraph } from '@/agent/graph';
import { HumanMessage, AIMessage, AIMessageChunk, BaseMessage } from '@langchain/core/messages';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;

    if (!threadId) {
      return Response.json({ error: 'Thread ID is required' }, { status: 400 });
    }

    const graph = await getAgentGraph();

    // Get the current state for this thread
    const state = await graph.getState({
      configurable: { thread_id: threadId },
    });

    if (!state.values || !state.values.messages) {
      return Response.json({ messages: [] });
    }

    // Convert LangChain messages to our simple format
    // Note: AI messages may be stored as AIMessageChunk (not AIMessage) due to streaming
    const messages = state.values.messages
      .filter((msg: BaseMessage) => {
        // Include human messages
        if (msg instanceof HumanMessage) return true;
        // Include AI messages (both AIMessage and AIMessageChunk)
        if (msg instanceof AIMessage || msg instanceof AIMessageChunk) {
          // Skip AI messages with empty content (tool call intermediates)
          const content = msg.content;
          return typeof content === 'string' && content.length > 0;
        }
        return false;
      })
      .map((msg: BaseMessage, index: number) => ({
        id: `${index}`,
        role: msg instanceof HumanMessage ? 'user' : 'assistant',
        content: typeof msg.content === 'string' ? msg.content : '',
      }));

    return Response.json({ messages });
  } catch (error) {
    console.error('[chat] Error fetching chat history:', error);
    return Response.json({ messages: [] });
  }
}
