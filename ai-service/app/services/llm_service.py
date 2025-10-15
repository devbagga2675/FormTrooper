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
from app.schemas.generation import (
    FormStructure,
    GenerationRequest,
    Question,
    RefinementRequest,
    RefinedQuestionsList,
    DummyResponseRequest,
    DummyAnswers
)
from app.services.document_service import process_document_for_pinecone



llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash-lite",
    temperature=0.3,
    google_api_key=settings.GEMINI_API_KEY
)

embeddings = JinaEmbeddings(
    model_name="jina-embeddings-v3",
    jina_api_key=settings.JINA_API_KEY
)

parser = JsonOutputParser(pydantic_object=FormStructure)

prompt_template = ChatPromptTemplate.from_template("""
You are an expert form creator and data analyst. Your task is to generate a structured JSON object for a new form and also suggest relevant analysis actions.

**Part 1: Generate the Form**
Generate a form based on the following requirements.
CONTEXT FROM UPLOADED DOCUMENT:
{retrieved_context}
---
USER REQUIREMENTS:
- Form Context: {form_context}
- Number of Questions to Generate: {num_questions}
- Additional Instructions: {additional_context}

**Part 2: Suggest Analysis Actions**
After generating the form, think about what kind of insights a user would want from the responses.
Generate a list of 3-4 relevant analysis actions. The actions should be concise and phrased as clear calls-to-action.

Your final output MUST be a single, valid JSON object that strictly follows this format:
{format_instructions}
""")

chain = prompt_template | llm | parser

refine_parser = JsonOutputParser(pydantic_object=RefinedQuestionsList)

refine_prompt_template = ChatPromptTemplate.from_template(
"""You are an expert form editor's assistant. Your task is to refine an existing set of questions based on a new instruction from the user.
Here is the original context for the form:
{user_context}
Here is some relevant information retrieved from the user's document:
{retrieved_context}
Here is the user's NEW INSTRUCTION for this edit:
"{new_instruction}"
Here is the CURRENT list of questions in the form:
{existing_questions_json}
Based on the new instruction, return a complete, updated list of questions in the required JSON format. You should:
- Modify existing questions where necessary to fit the new instruction.
- Add new questions if the instruction calls for it.
- Remove any questions that are no longer relevant.
- Keep any unchanged questions exactly as they are.
- Ensure the final output is a valid JSON array of question objects that matches this format: {format_instructions}
"""
)

refine_chain = refine_prompt_template | llm | refine_parser

async def generate_form_from_prompt(request: GenerationRequest) -> FormStructure:
    retrieved_context = "No document provided."
    if request.document_url and request.pinecone_namespace:
        try:
            process_document_for_pinecone(
                url=request.document_url,
                namespace=request.pinecone_namespace
            )
            vector_store = PineconeVectorStore.from_existing_index(
                index_name="formtrooper",
                embedding=embeddings,
                namespace=request.pinecone_namespace
            )
            retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 5})
            docs = retriever.invoke(request.form_context)
            retrieved_context = "\n\n".join([doc.page_content for doc in docs])
        except Exception as e:
            logging.error(f"FATAL: RAG process failed for URL {request.document_url}: {e}")
            raise HTTPException(status_code=422, detail=f"Failed to process the document. Error: {e}")

    try:
        generated_form_dict = await chain.ainvoke({
            "form_context": request.form_context,
            "num_questions": request.num_questions,
            "additional_context": request.additional_context or "None",
            "retrieved_context": retrieved_context,
            "format_instructions": parser.get_format_instructions(),
        })
        return FormStructure(**generated_form_dict)
    except Exception as e:
        logging.error(f"LangChain invocation failed: {e}")
        raise HTTPException(status_code=503, detail="The AI service failed to generate the form.")

async def refine_questions(request: RefinementRequest) -> List[Question]:
    retrieved_context = "No document provided."
    if request.pinecone_namespace:
        try:
            vector_store = PineconeVectorStore.from_existing_index(
                index_name="formtrooper",
                embedding=embeddings,
                namespace=request.pinecone_namespace
            )
            retriever = vector_store.as_retriever(search_type="mmr", search_kwargs={"k": 3})
            docs = retriever.invoke(request.user_context)
            retrieved_context = "\n\n".join([doc.page_content for doc in docs])
            logging.info(f"Retrieved context: for pinecone namespace {request.pinecone_namespace}")
        except Exception as e:
            logging.error(f"RAG process failed during refinement: {e}")
            retrieved_context = "Error retrieving document context."

    existing_questions_json_str = json.dumps([q.dict() for q in request.existing_questions], indent=2)

    refined_output_dict = await refine_chain.ainvoke({
        "user_context": request.user_context,
        "new_instruction": request.new_instruction,
        "retrieved_context": retrieved_context,
        "existing_questions_json": existing_questions_json_str,
        "format_instructions": refine_parser.get_format_instructions(),
    })

    return [Question(**q) for q in refined_output_dict['questions']]


# ... (imports and other chains)

# --- Refined chain for generating dummy answers ---
# The parser can now be a simple string parser, as we'll handle the JSON in the prompt
dummy_answer_parser = JsonOutputParser(pydantic_object=DummyAnswers)
dummy_answer_prompt = ChatPromptTemplate.from_template("""
You are a test data generator. Your task is to act as a persona and fill out a form.
The persona you should adopt is: "{persona}"

Here is the form's structure and questions:
{questions_json}

Please provide a realistic answer for each question based on your persona.
Follow these rules for formatting your answers based on the 'question_type':
- For 'multiple_choice' or 'linear_scale': Your answer MUST be a single string chosen from the provided 'options'.
- For 'checkboxes': Your answer MUST be an array of one or more strings chosen from the 'options'.
- For 'short_answer' or 'paragraph': Your answer should be a generated string.

Your response must be a JSON object that strictly follows this format: {format_instructions}
""")
dummy_answer_chain = dummy_answer_prompt | llm | dummy_answer_parser

async def generate_dummy_answers(request: DummyResponseRequest) -> list:
    # We pass the full question objects to give the AI complete context
    questions_data = [q.dict() for q in request.questions]
    questions_json_str = json.dumps(questions_data, indent=2)
    
    # The response will now be a dictionary like {"answers": [...]}
    response_dict = await dummy_answer_chain.ainvoke({
        "persona": request.persona,
        "questions_json": questions_json_str,
        "format_instructions": dummy_answer_parser.get_format_instructions(),
    })
    
    # Extract the list of answers from the dictionary
    return response_dict['answers']