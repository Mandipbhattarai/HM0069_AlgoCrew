from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import enum
import re
import google.generativeai as genai
import uvicorn
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client
from serpapi import GoogleSearch
from fastapi.middleware.cors import CORSMiddleware
import json 
# Initialize FastAPI app
app = FastAPI()

# Define the allowed origins for CORS
origins = [
    "http://localhost:5173",  # Your Vite React frontend
    "http://127.0.0.1:5173",  # Alternative localhost URL
]

# Add CORS middleware with proper configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache preflight requests for 10 minutes
)

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
    plagiarism_report: str
    readability_score: float
    cosine_score: float
    jaccard_index: float
    ai_text: str

# Load API key from environment variables
API_KEY = "AIzaSyD5gyJqBDDe3lVFxRkhxhDw1BwkXiUm4aI"
if not API_KEY:
    raise ValueError("Google API Key is not set in environment variables.")

genai.configure(api_key=API_KEY)
model = genai.GenerativeModel("gemini-2.0-flash")

# Supabase setup
SUPABASE_URL = "https://rmgfvazyspioitmgeflu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtZ2Z2YXp5c3Bpb2l0bWdlZmx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwMTU3NjIsImV4cCI6MjA1NDU5MTc2Mn0.T_hGW9nol1M8q87OIMNUHOhifSsj4Ra6g_Bio8fFwL0"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
sentence_model = SentenceTransformer("all-MiniLM-L6-v2")

# Request model for content analysis
class ContentAnalysisRequest(BaseModel):
    topic: str
    content: str  # Content received from another server

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
    # Check grammar first
    query_embedding = sentence_model.encode(query).tolist()
    response = supabase.rpc(
        "search_documents",
        {"query_embedding": query_embedding, "top_k": top_k}
    ).execute()

    return response.data if response.data else "No results found."

@app.post("/analyze_content")
async def analyze_content(request: ContentAnalysisRequest):
    try:
        stud_content = request.content
        if not stud_content:
            raise HTTPException(status_code=400, detail="Content is empty.")

        cleaned_text = re.sub(r'\s+', ' ', stud_content).strip()
        params = {
            "engine": "google",
            "q": cleaned_text + " grammar check",
            "api_key": "72ebeb1766847539b043301 56cd9b1bb95b881c228e68d6bfdf2cf53d59391f8"
        }
        try:
            search = GoogleSearch(params)
            results = search.get_dict()
            if "grammar_check" in results.keys():
                grammar_check = results["grammar_check"]
                cleaned_text = grammar_check['suggested_text']
        except:
            print("Error in grammar checking.")
        
        list_text = split_text(cleaned_text, max_length=200, min_length=50)
        print(list_text)

        for item in list_text:
            # Generate embedding
            embedding = sentence_model.encode(item).tolist()
            print(f"Content: {item}")
            print(f"Embedding (first 10 values): {embedding[:10]}")  # Print the first 10 values of the embedding for debugging

            # Insert into Supabase
            response = supabase.table("documents").upsert({
                "content": item,
                "embedding": embedding
            }).execute()

        # Search similar content from Supabase
        query = request.topic
        results = search_similar(query)
        context = ""
        for i in results:
            context += i["content"]

        # Generate AI content based on the topic
        ai_query = f"Generate content on Topic: {request.topic}, approximate length: {len(cleaned_text.split())} words. Context: " + context
        ai_response = model.generate_content(ai_query)
        ai_text = ai_response.text.strip() if ai_response.text else ""

        # Generate feedback
        feedback_query = (
            f"Topic: {request.topic}, Student's Content: {cleaned_text}, AI-Generated Content: {ai_text}. "
            "--do not use next content for generation: Follow this JSON format strictly: relevance(Choose low, medium or high), "
            f"evaluation_score(1-100), overall_feedback, plagiarism(0.0-1.0), readability_score(0-100), cosine_score(0-1), jaccard_index(0-1), ai_text: {ai_text}"
        )

        feedback_response = model.generate_content(feedback_query)
        # Ensure only valid JSON is extracted
        match = re.search(r'\{.*\}', feedback_response.text, re.DOTALL)
        if not match:
            raise HTTPException(status_code=500, detail="AI response is not valid JSON.")

        try:
            feedback_json = json.loads(match.group())  # Extract valid JSON content
            return feedback_json  # Return as a JSON object
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Error parsing AI JSON response.")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

if __name__ == "__main__":
    print("Server running at: http://127.0.0.1:8000")
    uvicorn.run(app, host="127.0.0.1", port=8000)