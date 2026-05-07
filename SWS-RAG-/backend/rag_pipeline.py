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

# ─────────────────────────────────────────────────────────────
# LOAD MODELS AND DB (runs once when server starts)
# ─────────────────────────────────────────────────────────────

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

# ─────────────────────────────────────────────────────────────
# SECTION 1 — PDF EXTRACTION
# ─────────────────────────────────────────────────────────────

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


# ─────────────────────────────────────────────────────────────
# SECTION 2 — CHUNKING
# ─────────────────────────────────────────────────────────────

def sliding_window_split(text: str) -> list:
    """
    Splits text into chunks of CHUNK_SIZE characters
    with CHUNK_OVERLAP overlap between chunks.
    """
    chunks = []
    start  = 0
    text_length = len(text)

    while start < text_length:
        end   = start + CHUNK_SIZE
        chunk = text[start:end]
        chunks.append(chunk)
        start += CHUNK_SIZE - CHUNK_OVERLAP
        if start >= text_length:
            break

    return chunks


def split_into_chunks(pages: list) -> list:
    """
    Takes list of pages and splits each page text into chunks.
    Returns list of { source, page, chunk_index, text }
    """
    all_chunks  = []
    chunk_index = 0

    for page in pages:
        text     = page["text"]
        source   = page["source"]
        page_num = page["page"]

        chunks = sliding_window_split(text)

        for chunk in chunks:
            if len(chunk.strip()) < 50:
                continue

            all_chunks.append({
                "source":      source,
                "page":        page_num,
                "chunk_index": chunk_index,
                "text":        chunk.strip()
            })

            chunk_index += 1

    print(f"Created {len(all_chunks)} chunks from {len(pages)} pages")
    return all_chunks


# ─────────────────────────────────────────────────────────────
# SECTION 3 — EMBEDDING AND STORING IN CHROMADB
# ─────────────────────────────────────────────────────────────

def embed_and_store(chunks: list) -> None:
    """
    Embeds all chunks using sentence-transformers
    and stores them in ChromaDB.
    """
    print(f"Embedding {len(chunks)} chunks...")

    ids       = []
    texts     = []
    metadatas = []

    for chunk in chunks:
        chunk_id = f"{chunk['source']}_p{chunk['page']}_c{chunk['chunk_index']}"
        ids.append(chunk_id)
        texts.append(chunk["text"])
        metadatas.append({
            "source":      chunk["source"],
            "page":        chunk["page"],
            "chunk_index": chunk["chunk_index"]
        })

    print("Generating vectors...")
    vectors = embed_model.encode(
        texts,
        show_progress_bar=True,
        batch_size=32
    ).tolist()

    batch_size = 500
    total      = len(ids)

    for i in range(0, total, batch_size):
        collection.upsert(
            ids        = ids[i:i + batch_size],
            documents  = texts[i:i + batch_size],
            embeddings = vectors[i:i + batch_size],
            metadatas  = metadatas[i:i + batch_size]
        )
        print(f"  Stored {min(i + batch_size, total)}/{total} chunks")

    print(f"Successfully stored all {total} chunks in ChromaDB!")


def ingest_pdfs(pdf_dir: str = PDF_DIR) -> dict:
    """
    Master ingestion function.
    Runs full pipeline: extract → chunk → embed → store.
    """
    print("\n=== Starting Ingestion Pipeline ===")

    print("\n--- Step 1: Extracting text from PDFs ---")
    pages = extract_text_from_pdfs(pdf_dir)
    if not pages:
        raise Exception("No text could be extracted from PDFs")

    print("\n--- Step 2: Splitting into chunks ---")
    chunks = split_into_chunks(pages)
    if not chunks:
        raise Exception("No chunks were created")

    print("\n--- Step 3: Embedding and storing in ChromaDB ---")
    embed_and_store(chunks)

    unique_docs = list(set(p["source"] for p in pages))

    print("\n=== Ingestion Complete ===")
    print(f"  Documents : {len(unique_docs)}")
    print(f"  Pages     : {len(pages)}")
    print(f"  Chunks    : {len(chunks)}")

    return {
        "documents_loaded": len(unique_docs),
        "pages_extracted":  len(pages),
        "chunks_created":   len(chunks)
    }


# ─────────────────────────────────────────────────────────────
# SECTION 4 — RETRIEVAL
# ─────────────────────────────────────────────────────────────

def retrieve_relevant_chunks(question: str) -> list:
    """
    Converts question to vector.
    Searches ChromaDB for top K most similar chunks.
    """
    print(f"\nSearching for: {question}")

    question_vector = embed_model.encode(question).tolist()

    results = collection.query(
        query_embeddings=[question_vector],
        n_results=min(TOP_K, collection.count()),
        include=["documents", "metadatas", "distances"]
    )

    chunks    = []
    documents = results["documents"][0]
    metadatas = results["metadatas"][0]
    distances = results["distances"][0]

    for doc, meta, distance in zip(documents, metadatas, distances):
        similarity = round(1 - distance, 4)
        chunks.append({
            "text":        doc,
            "source":      meta["source"],
            "page":        meta["page"],
            "chunk_index": meta["chunk_index"],
            "similarity":  similarity
        })

    chunks = sorted(chunks, key=lambda x: x["similarity"], reverse=True)

    print(f"Top {len(chunks)} chunks retrieved:")
    for i, chunk in enumerate(chunks, 1):
        print(f"  {i}. [{chunk['similarity']}] {chunk['source']} — page {chunk['page']}")

    return chunks


def get_unique_sources(chunks: list) -> list:
    """Returns unique document names from retrieved chunks."""
    seen = []
    for chunk in chunks:
        if chunk["source"] not in seen:
            seen.append(chunk["source"])
    return seen


# ─────────────────────────────────────────────────────────────
# SECTION 5 — GENERATE ANSWER VIA OLLAMA
# ─────────────────────────────────────────────────────────────

def build_context(chunks: list) -> str:
    """Formats retrieved chunks into a clean context string."""
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        part = f"""--- Chunk {i} ---
Source: {chunk['source']}
Page: {chunk['page']}
Content: {chunk['text']}
"""
        context_parts.append(part)
    return "\n".join(context_parts)


def build_messages(question: str, context: str, conversation_history: list) -> list:
    """
    Builds messages list for Ollama.
    Includes system prompt + conversation history + current question with context.
    """
    system_prompt = """You are a helpful HR assistant for SWS AI company.
Your job is to answer employee questions about company policies and documents.

STRICT RULES:
1. Answer ONLY from the context provided below.
2. Do NOT use any outside knowledge.
3. If the answer is not in the context say exactly:
   "I don't have that information in the company documents."
4. Always mention which document your answer comes from.
5. Be concise, friendly and professional.
6. If asked a follow up question use the conversation history to understand context."""

    messages = [{"role": "system", "content": system_prompt}]

    # Add last 6 turns of conversation history for multi-turn support
    recent_history = conversation_history[-6:]
    for turn in recent_history:
        messages.append({
            "role":    turn["role"],
            "content": turn["content"]
        })

    # Add current question with context
    user_message = f"""Use the following context from company documents to answer my question.

CONTEXT:
{context}

QUESTION:
{question}"""

    messages.append({"role": "user", "content": user_message})
    return messages


def call_ollama(messages: list) -> str:
    """Sends messages to Ollama API and returns response text."""
    payload = {
        "model":    OLLAMA_MODEL,
        "messages": messages,
        "stream":   False,
        "options": {
            "temperature": 0.1,
            "top_p":       0.9
        }
    }

    try:
        response = requests.post(OLLAMA_URL, json=payload, timeout=120)
        response.raise_for_status()
        data   = response.json()
        answer = data["message"]["content"]
        return answer

    except requests.exceptions.ConnectionError:
        raise Exception("Cannot connect to Ollama. Make sure Ollama is running: ollama serve")

    except requests.exceptions.Timeout:
        raise Exception("Ollama took too long to respond. Try again.")

    except Exception as e:
        raise Exception(f"Ollama error: {str(e)}")


def generate_answer(question: str, chunks: list, conversation_history: list) -> dict:
    """
    Master answer function.
    Builds context → builds prompt → calls Ollama → returns answer + sources.
    """
    context  = build_context(chunks)
    sources  = get_unique_sources(chunks)
    messages = build_messages(question, context, conversation_history)

    print(f"\nSending to Ollama ({OLLAMA_MODEL})...")
    answer = call_ollama(messages)

    return {
        "answer":      answer,
        "sources":     sources,
        "chunks_used": len(chunks)
    }


# ─────────────────────────────────────────────────────────────
# SECTION 6 — SMART SUGGESTED QUESTIONS
# ─────────────────────────────────────────────────────────────

def generate_suggested_questions() -> list:
    """
    Samples chunks from each document and asks Ollama
    to generate relevant employee questions.
    Returns list of 6 suggested questions.
    """
    print("\nGenerating smart suggested questions...")

    all_data = collection.get(include=["documents", "metadatas"])

    if not all_data or not all_data["documents"]:
        return get_default_questions()

    # Group chunks by document
    doc_chunks = {}
    for doc, meta in zip(all_data["documents"], all_data["metadatas"]):
        source = meta["source"]
        if source not in doc_chunks:
            doc_chunks[source] = []
        doc_chunks[source].append(doc)

    # Pick 1 random chunk from each document
    sample_texts = []
    for source, chunks in doc_chunks.items():
        sample = random.choice(chunks)
        sample_texts.append(f"From {source}:\n{sample[:300]}")

    combined_sample = "\n\n".join(sample_texts[:10])

    prompt_messages = [
        {
            "role":    "system",
            "content": "You are an HR assistant. Generate questions an employee would ask."
        },
        {
            "role": "user",
            "content": f"""Based on these excerpts from company documents, generate exactly 6 
natural questions that an employee would likely ask.

DOCUMENT EXCERPTS:
{combined_sample}

RULES:
- Return ONLY a JSON array of 6 question strings
- No extra text, no numbering, no explanation
- Questions should be practical and specific
- Example format: ["Question 1?", "Question 2?", ...]"""
        }
    ]

    try:
        raw   = call_ollama(prompt_messages)
        match = re.search(r'\[.*?\]', raw, re.DOTALL)
        if match:
            questions = json.loads(match.group())
            if isinstance(questions, list) and len(questions) > 0:
                print(f"Generated {len(questions)} suggested questions")
                return questions[:6]
    except Exception as e:
        print(f"Could not generate questions: {e}")

    return get_default_questions()


def get_default_questions() -> list:
    """Fallback default questions if generation fails."""
    return [
        "What is the leave policy?",
        "How many sick days do I get per year?",
        "What is the work from home policy?",
        "How does the performance review process work?",
        "What are the employee benefits?",
        "What is the resignation notice period?"
    ]


# ─────────────────────────────────────────────────────────────
# SECTION 7 — UTILITY FUNCTIONS
# ─────────────────────────────────────────────────────────────

def get_collection_count() -> int:
    """Returns total number of chunks stored in ChromaDB."""
    return collection.count()


def reset_collection() -> None:
    """Clears all data from ChromaDB collection."""
    global collection
    chroma_client.delete_collection(COLLECTION_NAME)
    collection = chroma_client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )
    print("ChromaDB collection reset.")


def chat(question: str, conversation_history: list = []) -> dict:
    """
    Main chat function called by FastAPI.
    Full RAG pipeline: question → retrieve → generate → return.
    """
    if collection.count() == 0:
        return {
            "answer":      "No documents have been ingested yet. Please upload the company PDFs first.",
            "sources":     [],
            "chunks_used": 0
        }

    chunks = retrieve_relevant_chunks(question)

    if not chunks:
        return {
            "answer":      "I don't have that information in the company documents.",
            "sources":     [],
            "chunks_used": 0
        }

    return generate_answer(question, chunks, conversation_history)