from typing import List, Annotated

from langchain_core.messages import SystemMessage, BaseMessage, HumanMessage, AnyMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END, add_messages
from pydantic import BaseModel
from typing_extensions import TypedDict, Literal

from core.config import config
from core.ai.transcript_manager import TranscriptManager

def do_rag(message: str, course_id: int = 1) -> str:
    # Placeholder for RAG function
    tm = TranscriptManager(config.WEAVIATE_URL)
    rt_res = tm.most_similar_content(message, course_id=course_id)

    prompt = f"""
    The user message is:
    ```
    {message}
    ```
    
    Additional context for info:
    ```
    {rt_res}
    ```
    
    Generate a response to the user message based on the additional context.
    """

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=config.OPENAI_API_KEY,
        temperature=0,
    )

    res = llm.invoke(prompt)
    return res.content

def intent_identifier(message: str) -> str:
    class Intent(BaseModel):
        intent: Literal["summary", "course_question", "general_question"]

    llm = ChatOpenAI(
        model="gpt-4o-mini",
        api_key=config.OPENAI_API_KEY,
        temperature=0,
    ).with_structured_output(Intent)
    prompt: str = f"""
    You are provided with additional tools as a chatbot.
    
    For calling tool:
    1. Summary: return 'summary'
    2. RAG based result: return 'course_question'
    
    For not calling tool:
    1. General question: return 'general_question'
    
    user input:
    {message}
    """
    res = llm.invoke(message)
    return res.intent

def chat(messages: List[str], course_id: int = 1) -> str:
    intent = intent_identifier(messages[-1])

    if intent == 'summary':
        # Call the summarizer function here
        return "Summary function called"
    elif intent == 'course_question':
        # Call the course question function here
        return do_rag(messages[-1], course_id)
    else:
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            api_key=config.OPENAI_API_KEY,
            temperature=0,
        )
        prompt = f"""
        Provide response to the user query.
        {messages}
        """
        res = llm.invoke(prompt)
        return f"Assistant: {res.content}"

if __name__ == '__main__':
    messages = [
        "User: What is the capital of France?",
        "Assistant: The capital of France is Paris.",
        "User: what is taught in the current course?",
    ]
    res = chat(messages)
    print(res)

