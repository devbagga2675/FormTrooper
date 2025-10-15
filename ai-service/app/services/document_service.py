import io
import re
import requests
import fitz  # PyMuPDF
from langchain_chroma import Chroma
from langchain_community.embeddings import JinaEmbeddings
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_pinecone import PineconeVectorStore
from app.core.config import settings
import os
os.environ["PINECONE_API_KEY"] = settings.PINECONE_API_KEY
# Initialize the Jina embedding model with the API key
embeddings = JinaEmbeddings(
    model_name="jina-embeddings-v3",
    jina_api_key=settings.JINA_API_KEY
)

vector_store = Chroma(
    embedding_function=embeddings,
    persist_directory="./chroma_db"
)

def clean_text(text: str) -> str:
    """
    A simple and safe text cleaning function that normalizes whitespace.
    """
    if not text:
        return ""
    # Replace multiple whitespace characters (including newlines) with a single space
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def process_document_for_pinecone(url: str, namespace: str):
    print(f"Processing document for Pinecone namespace: {namespace}")
    """

    Fetches a PDF from a URL, extracts text, cleans it, chunks it,
    and stores the embeddings in a Chroma vector store.
    """
    print(f"Starting processing for document from: {url}")
    
    try:

        # 1. Fetch the document into an in-memory buffer
        response = requests.get(url)
        response.raise_for_status()
        pdf_buffer = io.BytesIO(response.content)
        
        # 2. Open the PDF from the buffer with PyMuPDF and extract text
        pdf_doc = fitz.open(stream=pdf_buffer, filetype="pdf")
        full_text = "".join(page.get_text() for page in pdf_doc)
        
        # 3. Clean the extracted text
        cleaned_text = clean_text(full_text)
        
        if not cleaned_text:
            print(f"Error: No processable text was found in the PDF from {url}.")
            return

        # 4. Create LangChain documents and split into chunks
        documents = [Document(page_content=cleaned_text, metadata={"source": url})]
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=150
        )
        chunks = text_splitter.split_documents(documents)

        # 5. Add the document chunks to the vector store
        if chunks:
        # Instead of saving to a local file, this sends the chunks and their
        # embeddings to your Pinecone index.
            PineconeVectorStore.from_documents(
                documents=chunks,
                embedding=embeddings,
                index_name="formtrooper", # The name you gave your index in Pinecone
                namespace=namespace
            )
            print(f"✅ Successfully embedded document to Pinecone namespace: {namespace}")
        else:
            raise ValueError("Text was extracted but resulted in no valid chunks.")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise