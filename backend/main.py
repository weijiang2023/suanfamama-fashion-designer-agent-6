from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, validator, Field
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime, timedelta
import os
import re
import bcrypt
import jwt
from supabase import create_client, Client

app = FastAPI(
    title="Fashion Designer Agent API",
    description="API for the fashion designer agent platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:5173", "https://suanfamama-fashion-designer-agent-6-frontend-f99mwdlio.vercel.app", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "")
JWT_SECRET = os.getenv("JWT_SECRET", "your-jwt-secret-here")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Security
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

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

class UserSignUp(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    role: str

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @validator('confirm_password')
    def passwords_match(cls, v, values, **kwargs):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v
    
    @validator('role')
    def valid_role(cls, v):
        valid_roles = ['designer', 'buyer', 'customer']
        if v.lower() not in valid_roles:
            raise ValueError(f'Role must be one of: {", ".join(valid_roles)}')
        return v.lower()

class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    created_at: datetime

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class EmailValidationRequest(BaseModel):
    email: EmailStr

class EmailValidationResponse(BaseModel):
    available: bool

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: Optional[bool] = False

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

# Helper functions
def generate_token(user_id: str, email: str, role: str) -> str:
    """Generate JWT token for authenticated user"""
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

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

@app.post("/api/auth/signup", response_model=TokenResponse)
async def signup(user_data: UserSignUp):
    """Register a new user"""
    try:
        if not supabase:
            # Mock response for development without Supabase
            user_id = "mock-user-id"
            now = datetime.now()
            
            return {
                "token": generate_token(user_id, user_data.email, user_data.role),
                "user": {
                    "id": user_id,
                    "email": user_data.email,
                    "role": user_data.role,
                    "created_at": now
                }
            }
        
        # Check if email already exists
        existing_user = supabase.table("users").select("email").eq("email", user_data.email).execute()
        if existing_user.data:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user in Supabase auth
        auth_response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        user_id = auth_response.user.id
        
        # Hash password for storage in users table
        hashed_password = hash_password(user_data.password)
        
        # Create user profile in users table
        user_profile = {
            "id": user_id,
            "email": user_data.email,
            "role": user_data.role,
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
        
        supabase.table("users").insert(user_profile).execute()
        
        # Generate JWT token
        token = generate_token(user_id, user_data.email, user_data.role)
        
        return {
            "token": token,
            "user": {
                "id": user_id,
                "email": user_data.email,
                "role": user_data.role,
                "created_at": user_profile["created_at"]
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")

@app.post("/api/auth/validate-email", response_model=EmailValidationResponse)
async def validate_email(data: EmailValidationRequest):
    """Check if an email is available for registration"""
    try:
        if not supabase:
            # Mock response for development without Supabase
            return {"available": True}
        
        # Check if email already exists
        existing_user = supabase.table("users").select("email").eq("email", data.email).execute()
        return {"available": not existing_user.data}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error validating email: {str(e)}")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(login_data: LoginRequest):
    """Authenticate a user and return a token"""
    try:
        if not supabase:
            # Mock response for development without Supabase
            # In a real app, we would verify credentials
            user_id = "mock-user-id"
            role = "designer"  # Mock role
            now = datetime.now()
            
            return {
                "token": generate_token(user_id, login_data.email, role),
                "user": {
                    "id": user_id,
                    "email": login_data.email,
                    "role": role,
                    "created_at": now
                }
            }
        
        # Find user by email
        user_response = supabase.table("users").select("*").eq("email", login_data.email).execute()
        
        if not user_response.data:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user = user_response.data[0]
        
        # Verify password
        auth_response = supabase.auth.sign_in_with_password({
            "email": login_data.email,
            "password": login_data.password
        })
        
        if not auth_response.user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Generate JWT token
        token = generate_token(user["id"], user["email"], user["role"])
        
        # Log login event (optional)
        # supabase.table("login_events").insert({
        #     "user_id": user["id"],
        #     "ip_address": request.client.host,
        #     "user_agent": request.headers.get("user-agent", ""),
        #     "timestamp": datetime.now()
        # }).execute()
        
        return {
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "role": user["role"],
                "created_at": user["created_at"]
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during login: {str(e)}")

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    """Authenticate a user and return a token"""
    try:
        # For development without Supabase
        if not supabase:
            # Mock successful login for testing
            if user_data.email == "test@example.com" and user_data.password == "Password123":
                user_id = "mock-user-id"
                role = "designer"  # Mock role
                now = datetime.now()
                
                return {
                    "token": generate_token(user_id, user_data.email, role),
                    "user": {
                        "id": user_id,
                        "email": user_data.email,
                        "role": role,
                        "created_at": now
                    }
                }
            else:
                # Mock login failure
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
        
        # With Supabase
        # First try to sign in with Supabase Auth
        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": user_data.email,
                "password": user_data.password
            })
            
            if not auth_response.user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            user_id = auth_response.user.id
            
            # Get user details from our users table
            user_response = supabase.table("users").select("*").eq("id", user_id).execute()
            
            if not user_response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User profile not found"
                )
            
            user_profile = user_response.data[0]
            
            # Log login event if needed
            if user_data.remember_me:
                # Set longer expiration for token
                token = generate_token(user_id, user_data.email, user_profile["role"])
            else:
                token = generate_token(user_id, user_data.email, user_profile["role"])
            
            # Optional: Log login event
            # supabase.table("login_events").insert({
            #     "user_id": user_id,
            #     "timestamp": datetime.now(),
            #     "ip_address": request.client.host,  # Would need to get from request
            #     "user_agent": request.headers.get("user-agent", "")  # Would need to get from request
            # }).execute()
            
            return {
                "token": token,
                "user": {
                    "id": user_id,
                    "email": user_data.email,
                    "role": user_profile["role"],
                    "created_at": user_profile["created_at"]
                }
            }
            
        except Exception as e:
            # Handle Supabase auth errors
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
            
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)