from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from datetime import datetime
import os
from supabase import create_client, Client

app = FastAPI(
    title="Fashion Designer Agent API",
    description="API for the fashion designer agent platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "https://suanfamama-fashion-designer-agent-6-frontend-f99mwdlio.vercel.app", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Pydantic models
class FeaturedCollection(BaseModel):
    id: int
    title: str
    description: str
    image_url: str
    designer: str
    created_at: datetime
    is_featured: bool = True

class NewsItem(BaseModel):
    id: int
    title: str
    content: str
    image_url: Optional[str] = None
    published_at: datetime
    is_published: bool = True

class PlatformStats(BaseModel):
    total_designers: int
    total_collections: int
    total_users: int

# Mock data for development
mock_collections = [
    {
        "id": 1,
        "title": "Summer Elegance 2024",
        "description": "A stunning collection featuring flowing fabrics and vibrant colors perfect for summer occasions.",
        "image_url": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&h=600&fit=crop",
        "designer": "Elena Rodriguez",
        "created_at": "2024-01-15T10:00:00Z",
        "is_featured": True
    },
    {
        "id": 2,
        "title": "Urban Minimalist",
        "description": "Clean lines and neutral tones define this contemporary urban collection.",
        "image_url": "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop",
        "designer": "Marcus Chen",
        "created_at": "2024-01-10T14:30:00Z",
        "is_featured": True
    },
    {
        "id": 3,
        "title": "Vintage Revival",
        "description": "Classic styles reimagined with modern techniques and sustainable materials.",
        "image_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop",
        "designer": "Sophie Laurent",
        "created_at": "2024-01-05T09:15:00Z",
        "is_featured": True
    }
]

mock_news = [
    {
        "id": 1,
        "title": "AI-Powered Fashion Design Revolution",
        "content": "Discover how our platform is transforming the fashion industry with cutting-edge AI technology.",
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop",
        "published_at": "2024-01-20T12:00:00Z",
        "is_published": True
    },
    {
        "id": 2,
        "title": "New Designer Spotlight: Rising Stars",
        "content": "Meet the talented designers who are making waves on our platform this month.",
        "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=400&fit=crop",
        "published_at": "2024-01-18T15:30:00Z",
        "is_published": True
    }
]

# API Routes
@app.get("/")
async def root():
    return {"message": "Fashion Designer Agent API", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/api/featured-collections", response_model=List[FeaturedCollection])
async def get_featured_collections():
    """Get featured fashion collections for the landing page"""
    try:
        if supabase:
            response = supabase.table("featured_collections").select("*").eq("is_featured", True).execute()
            if response.data:
                return response.data
        
        # Return mock data if Supabase is not configured
        return mock_collections
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching collections: {str(e)}")

@app.get("/api/news", response_model=List[NewsItem])
async def get_latest_news():
    """Get latest news items for the landing page"""
    try:
        if supabase:
            response = supabase.table("news_items").select("*").eq("is_published", True).order("published_at", desc=True).limit(5).execute()
            if response.data:
                return response.data
        
        # Return mock data if Supabase is not configured
        return mock_news
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching news: {str(e)}")

@app.get("/api/platform-stats", response_model=PlatformStats)
async def get_platform_stats():
    """Get platform statistics for the landing page"""
    try:
        if supabase:
            # Get actual stats from database
            designers_count = supabase.table("users").select("id", count="exact").eq("role", "designer").execute()
            collections_count = supabase.table("collections").select("id", count="exact").execute()
            users_count = supabase.table("users").select("id", count="exact").execute()
            
            return {
                "total_designers": designers_count.count or 0,
                "total_collections": collections_count.count or 0,
                "total_users": users_count.count or 0
            }
        
        # Return mock stats if Supabase is not configured
        return {
            "total_designers": 1250,
            "total_collections": 3400,
            "total_users": 15600
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stats: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)