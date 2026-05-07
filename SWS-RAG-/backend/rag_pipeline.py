# rag_pipeline.py
# Complete RAG Pipeline for SWS AI Company Chatbot
# Handles: PDF extraction → chunking → embedding → ChromaDB → retrieval → Ollama answer

import os
import re
import json
import random
import requests
import pdfplumber
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────

CHUNK_SIZE      = 500
CHUNK_OVERLAP   = 50
TOP_K           = 5
COLLECTION_NAME = "sws_ai_docs"
PDF_DIR         = "../pdf"
OLLAMA_URL      = "http://localhost:11434/api/chat"
OLLAMA_MODEL    = "llama3.1:8b"

print("Loading embedding model (all-MiniLM-L6-v2)...")
embed_model = SentenceTransformer("all-MiniLM-L6-v2")
print("Embedding model loaded!")

chroma_client = chromadb.PersistentClient(
    path="./chroma_db",
    settings=Settings(anonymized_telemetry=False)
)

collection = chroma_client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"}
)

def clean_text(text: str) -> str:
    """Clean raw text extracted from PDF."""
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    text = text.encode("utf-8", errors="ignore").decode("utf-8")
    text = text.strip()
    return text


def extract_text_from_pdfs(pdf_dir: str) -> list:
    """
    Reads all PDFs from the folder.
    Returns list of { source, page, text }
    """
    all_pages = []
    pdf_files = [f for f in os.listdir(pdf_dir) if f.endswith(".pdf")]

    if not pdf_files:
        raise Exception(f"No PDF files found in {pdf_dir}")

    print(f"Found {len(pdf_files)} PDF files")

    for pdf_file in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_file)
        doc_name = pdf_file.replace(".pdf", "")

        print(f"  Reading: {pdf_file}")

        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page_num, page in enumerate(pdf.pages, start=1):
                    text = page.extract_text()

                    if not text or text.strip() == "":
                        continue

                    text = clean_text(text)

                    all_pages.append({
                        "source": doc_name,
                        "page":   page_num,
                        "text":   text
                    })
        except Exception as e:
            print(f"  Warning: Could not read {pdf_file}: {e}")
            continue

    print(f"Extracted {len(all_pages)} pages total")
    return all_pages

