from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from app.schemas.generation import FormStructure, GenerationRequest
import logging
from fastapi import HTTPException
from app.services.document_service import process_document_from_url, vector_store
from app.core.config import settings

# --- LangChain Setup ---

llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    temperature=0.3,
    google_api_key=settings.GEMINI_API_KEY
)

parser = JsonOutputParser(pydantic_object=FormStructure)

# Refined prompt template to include a placeholder for RAG context
prompt_template = ChatPromptTemplate.from_template("""
You are an expert form creator. Generate a structured JSON object based on the following requirements.

CONTEXT FROM UPLOADED DOCUMENT:
{retrieved_context}
---
USER REQUIREMENTS:
- Primary Purpose/Topic: {purpose}
- Target Audience: {target_audience}
- Number of Questions to Generate: {num_questions}
- Additional Instructions: {additional_context}
---
JSON FORMAT INSTRUCTIONS:
{format_instructions}
""")

chain = prompt_template | llm | parser

# --- Service Function with RAG ---

async def generate_form_from_prompt(request: GenerationRequest) -> FormStructure:
    """
    Generates a form structure, using RAG if a document URL is provided.
    """
    retrieved_context = "No document provided."

    if request.document_url:
        try:
            # 1. Process the document to create and store embeddings
            process_document_from_url(request.document_url)

            # 2. Retrieve diverse and relevant chunks using MMR
            retriever = vector_store.as_retriever(
                search_type="mmr",
                search_kwargs={"k": 5, "fetch_k": 20}
            )
            docs = retriever.invoke(request.topic)
            retrieved_context = "\n\n".join([doc.page_content for doc in docs])

        except Exception as e:
            logging.error(f"RAG process failed for URL {request.document_url}: {e}")
            retrieved_context = "Error: Could not process the provided document."

    try:
        # Invoke the chain with all context, including RAG results
        generated_form_dict = await chain.ainvoke({
            "purpose": request.purpose,
            "target_audience": request.target_audience,
            "num_questions": request.num_questions,
            "additional_context": request.additional_context or "None",
            "retrieved_context": retrieved_context,
            "format_instructions": parser.get_format_instructions(),
        })
        
        return FormStructure(**generated_form_dict)

    except Exception as e:
        logging.error(f"LangChain invocation failed: {e}")
        raise HTTPException(status_code=503, detail="The AI service failed to generate the form.")