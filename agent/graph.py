"""
LangGraph agent for Missouri Bills queries.

Implements a simple ReAct-style agent with tool calling.
"""
import os
from typing import TypedDict, Annotated, Sequence
from dotenv import load_dotenv
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.graph.message import add_messages
from agent.tools import get_tools

# Load environment variables
load_dotenv()


class AgentState(TypedDict):
    """State of the agent conversation."""
    messages: Annotated[Sequence[BaseMessage], add_messages]


def create_agent():
    """
    Create the Missouri Bills LangGraph agent.

    Returns:
        Compiled LangGraph agent
    """
    # Initialize LLM with tools
    tools = get_tools()
    llm = ChatOpenAI(model="gpt-4o", temperature=0)
    llm_with_tools = llm.bind_tools(tools)

    # Define agent node
    def call_model(state: AgentState):
        """Agent node that calls the LLM."""
        messages = state["messages"]
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    # Define conditional edge function
    def should_continue(state: AgentState):
        """Determine if we should continue or end."""
        messages = state["messages"]
        last_message = messages[-1]

        # If there are no tool calls, end
        if not hasattr(last_message, "tool_calls") or not last_message.tool_calls:
            return "end"

        # Otherwise continue with tools
        return "continue"

    # Create graph
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("agent", call_model)
    workflow.add_node("tools", ToolNode(tools))

    # Set entry point
    workflow.set_entry_point("agent")

    # Add edges
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "continue": "tools",
            "end": END,
        },
    )
    workflow.add_edge("tools", "agent")

    # Compile graph
    return workflow.compile()


def run_agent(query: str, agent=None):
    """
    Run the agent with a user query.

    Args:
        query: User's question
        agent: Optional pre-compiled agent (creates new one if not provided)

    Returns:
        Agent's response as string
    """
    if agent is None:
        agent = create_agent()

    # Run agent
    result = agent.invoke({
        "messages": [HumanMessage(content=query)]
    })

    # Extract final response
    final_message = result["messages"][-1]
    return final_message.content


# Create singleton agent instance for reuse
_agent_instance = None

def get_agent():
    """Get or create the agent instance."""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = create_agent()
    return _agent_instance


if __name__ == "__main__":
    # Example usage
    import sys

    if len(sys.argv) > 1:
        query = " ".join(sys.argv[1:])
    else:
        query = "What bills are about healthcare in 2026?"

    print(f"Query: {query}\n")
    response = run_agent(query)
    print(f"Response: {response}")
