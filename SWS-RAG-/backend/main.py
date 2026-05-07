from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

import rag_pipeline as rag

app = FastAPI(
    title="SWS AI RAG Chatbot API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    question: str
    conversation_history: List[dict] = []

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    chunks_used: int

class IngestResponse(BaseModel):
    message: str
    documents_loaded: int
    pages_extracted: int
    chunks_created: int

class StatusResponse(BaseModel):
    status: str
    chunks_indexed: int
    ready: bool

class QuestionsResponse(BaseModel):
    questions: List[str]

@app.get("/")
def root():
    return {
        "message": "SWS AI RAG Chatbot API is running!",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/status", response_model=StatusResponse)
def get_status():
    """
    Check how many chunks are indexed in ChromaDB.
    Frontend calls this on load to know if docs are ready.
    """
    try:
        count = rag.get_collection_count()
        return StatusResponse(
            status="ready" if count > 0 else "empty",
            chunks_indexed=count,
            ready=count > 0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ingest", response_model=IngestResponse)
def ingest_documents():
    """
    Triggers the full ingestion pipeline.
    Reads PDFs from ../pdf folder.
    Extracts → chunks → embeds → stores in ChromaDB.
    """
    try:
        result = rag.ingest_pdfs()
        return IngestResponse(
            message="Documents ingested successfully!",
            documents_loaded=result["documents_loaded"],
            pages_extracted=result["pages_extracted"],
            chunks_created=result["chunks_created"]
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    """
    Main RAG chat endpoint.
    
    Flow:
    1. Embed the question
    2. Retrieve top 5 relevant chunks from ChromaDB
    3. Build prompt with context + history
    4. Send to Ollama llama3.1:8b
    5. Return answer + sources
    """
    # Validate question
    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty."
        )

    try:
        result = rag.chat(
            question=request.question,
            conversation_history=request.conversation_history
        )
        return ChatResponse(
            answer=result["answer"],
            sources=result["sources"],
            chunks_used=result["chunks_used"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/questions", response_model=QuestionsResponse)
def get_suggested_questions():
    """
    Returns 6 smart suggested questions
    generated from the actual document content.
    Frontend shows these as clickable chips.
    """
    try:
        questions = rag.generate_suggested_questions()
        return QuestionsResponse(questions=questions)
    except Exception as e:
        # If anything fails return default questions
        return QuestionsResponse(
            questions=rag.get_default_questions()
        )


@app.delete("/api/reset")
def reset():
    """
    Clears all data from ChromaDB.
    Useful when you want to re-ingest fresh documents.
    """
    try:
        rag.reset_collection()
        return {"message": "ChromaDB collection cleared successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))