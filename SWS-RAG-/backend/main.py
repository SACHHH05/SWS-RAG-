from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

import rag_pipeline as rag

app = FastAPI(
    title="SWS AI RAG Chatbot API",
    version="1.0.0"
)