from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import JinaEmbeddings
from app.core.config import settings
from app.schemas.analysis import MapRequest, ReduceRequest
from app.schemas.analysis import QueryRequest # Import the new schema

import json
from typing import List
import logging
from fastapi import HTTPException

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_pinecone import PineconeVectorStore
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import JinaEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.output_parsers import JsonOutputParser
from app.core.config import settings

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    temperature=0.3,
    google_api_key=settings.GEMINI_API_KEY
)

embeddings = JinaEmbeddings(
    model_name="jina-embeddings-v3",
    jina_api_key=settings.JINA_API_KEY
)

map_prompt_template = ChatPromptTemplate.from_template("""
You are an expert data analyst. Your task is to perform a specific analysis on a small batch of user responses from a form.

FORM CONTEXT:
{form_context}

USER RESPONSES (this is one batch of many):
{responses}

YOUR SPECIFIC TASK FOR THIS BATCH:
"{action_to_perform}"

Provide a concise result of this task for only the given batch.
""")
map_chain = map_prompt_template | llm | StrOutputParser()


# --- LangChain Setup for "Reduce" Step ---
reduce_prompt_template = ChatPromptTemplate.from_template("""
You are an expert data analyst. You have been given intermediate results from an analysis. Your task is to synthesize these into a single, final, coherent answer formatted in clean Markdown.

THE ORIGINAL TASK WAS:
"{action_to_perform}"

Here are the combined intermediate results from all batches:
{intermediate_results}

Please synthesize these results into a final, well-structured summary using Markdown formatting. Use headings, bullet points, and bold text to improve readability.
""")
reduce_chain = reduce_prompt_template | llm | StrOutputParser()


# --- Service Functions ---

async def map_analysis(request: MapRequest) -> str:
    result = await map_chain.ainvoke({
        "form_context": request.form_context,
        "responses": "\n- ".join(request.responses),
        "action_to_perform": request.action_to_perform,
    })
    return result

async def reduce_analysis(request: ReduceRequest) -> str:
    result = await reduce_chain.ainvoke({
        "action_to_perform": request.action_to_perform,
        "intermediate_results": request.intermediate_results,
    })
    return result

# ... (existing imports and map/reduce logic)

# --- LangChain Setup for "Query" Step ---
query_prompt_template = ChatPromptTemplate.from_template("""
You are an expert reporting assistant. Your task is to answer a user's question by analyzing the provided data and presenting the final answer directly.

**RULES:**
1.  **Provide only the final answer.** Do not show your work, calculations, or step-by-step thinking.
2.  **Be direct and concise.** Do not use conversational filler or introductory phrases like "Here is the summary..." or "Based on the data...".
3.  **Format for clarity.** Use Markdown (like tables, bullet points, and bold text) to present the answer in the most readable way possible.

**USER'S QUESTION:**
"{user_query}"

**FORM STRUCTURE (The questions that were asked):**
{form_questions_json}

**ALL RESPONSES (The raw data submitted by users):**
{all_responses_json}

**ANSWER:**
""")
query_chain = query_prompt_template | llm | StrOutputParser()


# --- NEW: Service Function for Q&A ---
async def answer_query(request: QueryRequest) -> str:
    result = await query_chain.ainvoke({
        "user_query": request.user_query,
        "form_questions_json": json.dumps(request.form_questions, indent=2),
        "all_responses_json": json.dumps(request.all_responses, indent=2),
    })
    return result