from typing import List, Annotated

from langchain_core.messages import SystemMessage, BaseMessage, HumanMessage, AnyMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END, add_messages
from pydantic import BaseModel
from typing_extensions import TypedDict, Literal

from core.config import config


def intent_identifier(message: str) -> str:
    print("Debugging")
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

def chat(messages: List[str]) -> str:
    intent = intent_identifier(messages[-1])

    if intent == 'summary':
        # Call the summarizer function here
        return "Summary function called"
    elif intent == 'course_question':
        # Call the course question function here
        return "Course question function called"
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
        "User: what did I ask last?",
    ]
    res = chat(messages)
    print(res)

