from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import enum
import re
import httpx
import io
import mammoth
import PyPDF2
import time
import json
import google.generativeai as genai
import uvicorn
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload

# Flag to control SerpAPI usage
USE_SERPAPI = False
try:
    # Try different import approaches for SerpAPI
    try:
        from serpapi import GoogleSearch
        serpapi_client = GoogleSearch
        USE_SERPAPI = True
    except ImportError:
        try:
            from serpapi import serp_api
            serpapi_client = serp_api.SearchClient
            USE_SERPAPI = True
        except ImportError:
            try:
                import serpapi
                # Check if serpapi has a Search class
                if hasattr(serpapi, 'Search'):
                    serpapi_client = serpapi.Search
                    USE_SERPAPI = True
            except ImportError:
                print("SerpAPI not available - grammar checking will be disabled")
except Exception as e:
    print(f"Error loading SerpAPI: {str(e)} - grammar checking will be disabled")

# Enum for relevance levels
class Relevance(enum.Enum):
    HIGHLY_RELEVANT = "Highly Relevant"
    MODERATELY_RELEVANT = "Moderately Relevant"
    SOMEWHAT_RELEVANT = "Somewhat Relevant"
    IRRELEVANT = "Irrelevant"

# Pydantic model for feedback response
class Feedback(BaseModel):
    relevance: str
    evaluation_score: int
    overall_feedback: str
    plagiarism: float
    readability_score: float
    cosine_score: float
    jaccard_index: float
    ai_text: str

# Request model for content analysis
class ContentAnalysisRequest(BaseModel):
    topic: str
    content: str  # Content received from another server

# Request model for document fetching
class DocumentRequest(BaseModel):
    fileId: str
    fileName: str
    accessToken: str

# FastAPI app instance
app = FastAPI(title="Document Analysis and Fetching Service")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set this to your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load API keys and configurations
# Google Generative AI API
GEMINI_API_KEY = "AIzaSyD5gyJqBDDe3lVFxRkhxhDw1BwkXiUm4aI"
if not GEMINI_API_KEY:
    raise ValueError("Google API Key is not set in environment variables.")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# Supabase setup
SUPABASE_URL = "https://rmgfvazyspioitmgeflu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZ2Z2YXp5c3Bpb2l0bWdlZmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMTU3NjIsImV4cCI6MjA1NDU5MTc2Mn0.T_hGW9nol1M8q87OIMNUHOhifSsj4Ra6g_Bio8fFwL0"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
sentence_model = SentenceTransformer("all-MiniLM-L6-v2")

# SERPAPI Key for grammar checking
SERPAPI_KEY = "72ebeb1766847539b04330156cd9b1bb95b881c228e68d6bfdf2cf53d59391f8"

# Helper functions for text processing
def split_text(text, max_length, min_length):
    words = text.split()
    chunks = []
    current_chunk = []

    for word in words:
        current_chunk.append(word)
        current_length = len(" ".join(current_chunk))

        # Only split if we are near max_length, ensuring minimum length is met
        if current_length >= min_length and (current_length >= max_length or word.endswith(".")):
            chunks.append(" ".join(current_chunk))
            current_chunk = []

    # Add remaining text
    if current_chunk:
        chunks.append(" ".join(current_chunk))

    return chunks

def search_similar(query, top_k=3):
    # Find similar content in vector database
    query_embedding = sentence_model.encode(query).tolist()
    response = supabase.rpc(
        "search_documents",
        {"query_embedding": query_embedding, "top_k": top_k}
    ).execute()

    return response.data if response.data else "No results found."

def parse_feedback_json(json_str):
    """Parse the feedback JSON string from the model response."""
    try:
        # Try to parse the raw JSON
        data = json.loads(json_str)
        return data
    except json.JSONDecodeError:
        # If direct parsing fails, try to extract JSON from text
        try:
            # Look for JSON-like patterns
            match = re.search(r'({.*})', json_str, re.DOTALL)
            if match:
                json_str = match.group(1)
                return json.loads(json_str)
        except (json.JSONDecodeError, AttributeError):
            pass
    
    # If all parsing attempts fail, create a basic structure with the raw text
    return {
        "relevance": "medium",
        "evaluation_score": 70,
        "overall_feedback": json_str,
        "plagiarism": 0.1,
        "readability_score": 75.0,
        "cosine_score": 0.8,
        "jaccard_index": 0.7
    }

# Optional grammar check function
def grammar_check_text(text):
    """Check grammar using SerpAPI if available."""
    if not USE_SERPAPI:
        print("Grammar checking skipped - SerpAPI not available")
        return text
    
    try:
        params = {
            "engine": "google",
            "q": text + " grammar check",
            "api_key": SERPAPI_KEY
        }
        search = serpapi_client(params)
        results = search.get_dict()
        if "grammar_check" in results.keys():
            grammar_check = results["grammar_check"]
            return grammar_check['suggested_text']
    except Exception as e:
        print(f"Error in grammar checking: {str(e)}")
    
    # Return original text if grammar checking fails
    return text

# Document fetching endpoint
@app.post("/fetch-document")
async def fetch_document(request: DocumentRequest):
    """
    Fetches a document from Google Drive and extracts its text content.
    This runs on the server side, avoiding CORS and browser limitations.
    """
    try:
        # Create credentials from the access token
        credentials = Credentials(token=request.accessToken)
        
        # Build the Drive API service
        drive_service = build('drive', 'v3', credentials=credentials)
        
        # Get file metadata to determine file type
        file_metadata = drive_service.files().get(fileId=request.fileId, fields="mimeType").execute()
        mime_type = file_metadata.get("mimeType", "")
        
        # Different handling based on mime type
        if "google-apps.document" in mime_type:
            # For Google Docs, export as DOCX
            file_request = drive_service.files().export_media(
                fileId=request.fileId, 
                mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            )
        else:
            # For regular files (PDF, DOCX, etc.), download directly
            file_request = drive_service.files().get_media(fileId=request.fileId)
        
        # Download the file content
        file_content = io.BytesIO()
        downloader = MediaIoBaseDownload(file_content, file_request)
        
        done = False
        while not done:
            status, done = downloader.next_chunk()
        
        file_content.seek(0)
        
        # Extract text based on file type
        extracted_text = ""
        
        if "google-apps.document" in mime_type or request.fileName.lower().endswith(".docx"):
            # Process DOCX files (including exported Google Docs)
            result = mammoth.extract_raw_text(file_content)
            extracted_text = result.value
        
        elif mime_type == "application/pdf" or request.fileName.lower().endswith(".pdf"):
            # Process PDF files
            pdf_reader = PyPDF2.PdfReader(file_content)
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                extracted_text += page.extract_text() + "\n"
        
        else:
            # For other text-based files, try to decode as UTF-8
            extracted_text = file_content.read().decode("utf-8", errors="replace")
        
        return {
            "fileName": request.fileName,
            "textContent": extracted_text,
            "charCount": len(extracted_text)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching document: {str(e)}")

# Content analysis endpoint
@app.post("/analyze_content")
async def analyze_content(request: ContentAnalysisRequest):
    try:
        stud_content = request.content
        if not stud_content:
            raise HTTPException(status_code=400, detail="Content is empty.")

        cleaned_text = re.sub(r'\s+', ' ', stud_content).strip()
        
        # Apply grammar check if SerpAPI is available
        cleaned_text = grammar_check_text(cleaned_text)
        
        # Split text into manageable chunks
        list_text = split_text(cleaned_text, max_length=200, min_length=50)
        print(f"Split into {len(list_text)} chunks")

        # Store chunks in vector database
        for item in list_text:
            # Generate embedding
            embedding = sentence_model.encode(item).tolist()
            print(f"Content: {item[:50]}... (embedding first 3 values: {embedding[:3]})")

            # Insert into Supabase
            supabase.table("documents").upsert({"content": item, "embedding": embedding}).execute()

        # Search similar content from Supabase
        query = request.topic
        results = search_similar(query)
        context = ""
        for i in results:
            if isinstance(i, dict) and "content" in i:
                context += i["content"] + " "
        
        # Generate AI content based on the topic
        ai_query = f"Generate content on Topic: {request.topic}, approximate length: {len(cleaned_text.split())} words. Context: {context}"
        ai_response = model.generate_content(ai_query)
        ai_text = ai_response.text.strip() if ai_response.text else ""

        # Generate feedback
        feedback_query = (
            f"Topic: {request.topic}\n\nStudent's Content: {cleaned_text[:1000]}\n\nAI-Generated Content: {ai_text[:1000]}\n\n"
            "Analyze the student's content and provide feedback in this JSON format:\n"
            "{\n"
            '  "relevance": "high", // Choose from: "high", "medium", "low"\n'
            '  "evaluation_score": 85, // Score from 1-100\n'
            '  "overall_feedback": "Detailed feedback here...",\n'
            '  "plagiarism": 0.15, // Number from 0-1\n'
            '  "readability_score": 75.5, // Number from 0-100\n'
            '  "cosine_score": 0.8, // Number from 0-1\n'
            '  "jaccard_index": 0.7 // Number from 0-1\n'
            "}"
        )

        feedback_response = model.generate_content(feedback_query)
        feedback_text = feedback_response.text.strip() if feedback_response.text else ""
        print(f"Raw feedback: {feedback_text}")
        
        # Parse the feedback JSON
        feedback_data = parse_feedback_json(feedback_text)
        
        # Construct final response
        response_data = {
            "relevance": feedback_data.get("relevance", "medium"),
            "evaluation_score": feedback_data.get("evaluation_score", 70),
            "overall_feedback": feedback_data.get("overall_feedback", "Feedback not available"),
            "plagiarism": feedback_data.get("plagiarism", 0.1),
            "readability_score": feedback_data.get("readability_score", 75.0),
            "cosine_score": feedback_data.get("cosine_score", 0.8),
            "jaccard_index": feedback_data.get("jaccard_index", 0.7),
            "ai_text": ai_text
        }
        
        return response_data

    except Exception as e:
        print(f"Error during content analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

# Endpoint for direct document fetching and analysis
@app.post("/analyze_document")
async def analyze_document(request: DocumentRequest):
    """
    Fetches a document from Google Drive, extracts its text, and analyzes it.
    This combines both fetch-document and analyze_content in one step.
    """
    try:
        # First, fetch the document
        doc_result = await fetch_document(request)
        
        # Get the document content and create analysis request
        text_content = doc_result["textContent"]
        
        # Extract topic from filename (remove extension)
        topic = request.fileName
        if "." in topic:
            topic = topic.rsplit(".", 1)[0]
        
        # Create analysis request
        analysis_request = ContentAnalysisRequest(
            topic=topic,
            content=text_content
        )
        
        # Then, analyze the content
        analysis_result = await analyze_content(analysis_request)
        
        # Combine both results
        return {
            "document": {
                "fileName": request.fileName,
                "charCount": len(text_content),
                "fileId": request.fileId
            },
            "analysis": analysis_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing document: {str(e)}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "services": {
            "document_fetching": "active",
            "content_analysis": "active",
            "grammar_checking": "active" if USE_SERPAPI else "disabled"
        }
    }

if __name__ == "__main__":
    print("Server running at: http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)
