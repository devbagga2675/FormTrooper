import requests
import tempfile
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.core.config import settings

# Initialize the embedding model
embeddings = GoogleGenerativeAIEmbeddings(model="embedding-gecko", google_api_key=settings.GEMINI_API_KEY)

# Initialize a simple in-memory vector store
# In a production app, you would use a persistent database like PostgreSQL with pgvector.
vector_store = Chroma(embedding_function=embeddings, persist_directory="./chroma_db")

def process_document_from_url(url: str):
    """
    Downloads a document, processes it, and loads its content into the vector store.
    """
    try:
        response = requests.get(url)
        response.raise_for_status()

        suffix = ".pdf" if ".pdf" in url.lower() else ".docx"
        with tempfile.NamedTemporaryFile(delete=True, suffix=suffix) as temp_file:
            temp_file.write(response.content)
            temp_file.flush()

            # if suffix == ".pdf":
            loader = PyPDFLoader(temp_file.name)
            # else:
            #     raise ValueError("Unsupported document type for RAG.")

            documents = loader.load()
            print(documents)
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
        chunks = text_splitter.split_documents(documents)

        # Add the document chunks to the vector store
        vector_store.add_documents(chunks)
        print(f"Successfully processed and embedded document from {url}")

    except Exception as e:
        print(f"Error processing document: {e}")
        raise