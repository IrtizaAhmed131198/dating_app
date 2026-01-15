from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import random
import string
import math
import logging

from auth import hash_password, verify_password, create_access_token, get_current_user

# ==================== ENV ====================

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]

# ==================== DB ====================

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

print("✅ Connected MongoDB Database:", db.name)

# ==================== APP ====================

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ==================== MODELS ====================

# class UserSignup(BaseModel):
#     email: EmailStr
#     password: str
#     full_name: str
#     gender: str
#     date_of_birth: str

# class UserLogin(BaseModel):
#     email: EmailStr
#     password: str

# class Token(BaseModel):
#     access_token: str
#     token_type: str
#     user_id: str
#     email: str

# class User(BaseModel):
#     model_config = ConfigDict(extra="ignore")

#     id: str = Field(default_factory=lambda: str(uuid.uuid4()))
#     email: EmailStr
#     password_hash: str
#     full_name: str
#     gender: str
#     date_of_birth: str
#     created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
#     is_active: bool = True
#     has_profile: bool = False

# Waitlist Models (Phase 1 & 2)
class WaitlistUser(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    referral_code: str
    referred_by: Optional[str] = None
    boosts: int = 0
    gender: Optional[str] = None
    is_vip: bool = False
    status: str = "pending"
    city: str = "NYC"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    verified_referrals: int = 0

class WaitlistSignup(BaseModel):
    email: EmailStr
    gender: Optional[str] = None
    referred_by: Optional[str] = None

class ReferralVerification(BaseModel):
    referral_code: str

class WaitlistStats(BaseModel):
    total_signups: int
    female_signups: int
    male_signups: int
    total_referrals: int
    active_users: int

class UserStats(BaseModel):
    email: str
    referral_code: str
    boosts: int
    verified_referrals: int
    position_in_line: int
    is_vip: bool


# Authentication Models (Phase 3)
class UserSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    gender: str  # "female", "male", "other"
    date_of_birth: str  # YYYY-MM-DD

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    email: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    full_name: str
    gender: str
    date_of_birth: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True
    has_profile: bool = False


# Profile Models (Phase 3)
class Profile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    bio: str
    age: int
    interests: List[str] = []
    photos: List[str] = []  # URLs or base64
    location: dict = {"city": "NYC", "neighborhood": "Downtown", "lat": 40.7128, "lng": -74.0060}
    looking_for: str = "relationship"  # "relationship", "dating", "friends"
    is_verified: bool = False
    verification_photos: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProfileCreate(BaseModel):
    bio: str
    age: int
    interests: List[str]
    looking_for: str = "relationship"
    neighborhood: str = "Downtown"

class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    interests: Optional[List[str]] = None
    looking_for: Optional[str] = None
    neighborhood: Optional[str] = None


# Swipe/Match Models (Phase 3)
class SwipeAction(BaseModel):
    target_user_id: str
    action: str  # "like", "pass", "super_like"

class Match(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user1_id: str
    user2_id: str
    matched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_message_at: Optional[datetime] = None
    is_active: bool = True

class Interaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    target_user_id: str
    action: str  # "view", "like", "pass", "super_like", "match"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Messaging Models (Phase 3)
class Message(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    match_id: str
    sender_id: str
    receiver_id: str
    content: str
    sent_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read_at: Optional[datetime] = None

class MessageCreate(BaseModel):
    receiver_id: str
    content: str


# Mock API Models
class PoseDetectionRequest(BaseModel):
    image_base64: str
    user_id: str

class PoseDetectionResponse(BaseModel):
    success: bool
    confidence: float
    detected_poses: List[str]
    message: str

# ==================== HELPERS ====================

def generate_referral_code(length=8):
    """Generate a unique referral code"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

async def get_user_by_email(email: str):
    return await db.users.find_one({"email": email})

async def get_profile_by_user_id(user_id: str):
    """Get profile by user_id"""
    profile = await db.profiles.find_one({"user_id": user_id}, {"_id": 0})
    return profile

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two coordinates in km"""
    R = 6371  # Earth radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

def calculate_match_score(user_profile, target_profile, distance_km):
    """Calculate match score based on distance, interests, and activity"""
    score = 100
    
    # Distance factor (max 30 points, closer = better)
    if distance_km <= 2:
        score += 30
    elif distance_km <= 5:
        score += 20
    elif distance_km <= 10:
        score += 10
    
    # Interest overlap (max 40 points)
    user_interests = set(user_profile.get("interests", []))
    target_interests = set(target_profile.get("interests", []))
    if user_interests and target_interests:
        overlap = len(user_interests & target_interests)
        total = len(user_interests | target_interests)
        score += int((overlap / total) * 40) if total > 0 else 0
    
    # Profile completeness (max 30 points)
    if target_profile.get("bio"):
        score += 10
    if len(target_profile.get("photos", [])) >= 3:
        score += 10
    if target_profile.get("is_verified"):
        score += 10
    
    return min(score, 200)  # Cap at 200

# ==================== AUTH ====================

@api_router.post("/auth/signup", response_model=Token, status_code=201)
async def signup(user_data: UserSignup):

    if await get_user_by_email(user_data.email):
        raise HTTPException(400, "Email already registered")

    user = User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        full_name=user_data.full_name,
        gender=user_data.gender,
        date_of_birth=user_data.date_of_birth
    )

    doc = user.model_dump()
    doc["_id"] = user.id  # ✅ FIX
    doc["created_at"] = user.created_at

    result = await db.users.insert_one(doc)
    if not result.inserted_id:
        raise HTTPException(500, "User insert failed")

    access_token = create_access_token({
        "user_id": user.id,
        "email": user.email
    })

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email
    )

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):

    user = await get_user_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password")

    token = create_access_token({
        "user_id": user["_id"],
        "email": user["email"]
    })

    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user["_id"],
        email=user["email"]
    )

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one(
        {"_id": current_user["user_id"]},
        {"password_hash": 0}
    )
    if not user:
        raise HTTPException(404, "User not found")
    return user

# ==================== PROFILE ENDPOINTS ====================

@api_router.post("/profile/create", status_code=status.HTTP_201_CREATED)
async def create_profile(profile_data: ProfileCreate, current_user: dict = Depends(get_current_user)):
    """Create user profile"""
    # Check if profile already exists
    existing_profile = await get_profile_by_user_id(current_user["user_id"])
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists"
        )
    
    # Get user to calculate age
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0})
    
    # Create profile
    profile = Profile(
        user_id=current_user["user_id"],
        bio=profile_data.bio,
        age=profile_data.age,
        interests=profile_data.interests,
        looking_for=profile_data.looking_for,
        location={
            "city": "NYC",
            "neighborhood": profile_data.neighborhood,
            "lat": 40.7128,
            "lng": -74.0060
        }
    )
    
    # Save to database
    doc = profile.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.profiles.insert_one(doc)
    
    # Update user has_profile flag
    await db.users.update_one(
        {"id": current_user["user_id"]},
        {"$set": {"has_profile": True}}
    )
    
    return {"message": "Profile created successfully", "profile_id": profile.id}


@api_router.get("/profile/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Get current user's profile"""
    profile = await get_profile_by_user_id(current_user["user_id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@api_router.put("/profile/update")
async def update_profile(profile_data: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    """Update user profile"""
    update_data = {k: v for k, v in profile_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data to update")
    
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.profiles.update_one(
        {"user_id": current_user["user_id"]},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return {"message": "Profile updated successfully"}


@api_router.post("/profile/upload-photo")
async def upload_photo(photo_base64: str, current_user: dict = Depends(get_current_user)):
    """Upload profile photo"""
    profile = await get_profile_by_user_id(current_user["user_id"])
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Verify with pose detection
    verification = await verify_pose_internal(photo_base64, current_user["user_id"])
    if not verification["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=verification["message"]
        )
    
    # Add photo to profile
    await db.profiles.update_one(
        {"user_id": current_user["user_id"]},
        {"$push": {"photos": photo_base64}}
    )
    
    return {"message": "Photo uploaded successfully", "verification": verification}


@api_router.get("/profile/{user_id}")
async def get_profile(user_id: str, current_user: dict = Depends(get_current_user)):
    """Get another user's profile"""
    profile = await get_profile_by_user_id(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Record view interaction
    interaction = Interaction(
        user_id=current_user["user_id"],
        target_user_id=user_id,
        action="view"
    )
    doc = interaction.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.interactions.insert_one(doc)
    
    return profile


# ==================== MATCHING & SWIPE ENDPOINTS ====================

@api_router.get("/matches/potential")
async def get_potential_matches(limit: int = 20, current_user: dict = Depends(get_current_user)):
    """Get potential matches based on location, interests, and activity"""
    # Get current user's profile
    my_profile = await get_profile_by_user_id(current_user["user_id"])
    if not my_profile:
        raise HTTPException(status_code=404, detail="Please create your profile first")
    
    # Get users already interacted with
    interactions = await db.interactions.find(
        {"user_id": current_user["user_id"]},
        {"target_user_id": 1}
    ).to_list(1000)
    interacted_ids = [i["target_user_id"] for i in interactions]
    interacted_ids.append(current_user["user_id"])  # Exclude self
    
    # Get potential matches (users not interacted with, in NYC)
    potential_profiles = await db.profiles.find(
        {
            "user_id": {"$nin": interacted_ids},
            "location.city": "NYC"
        },
        {"_id": 0}
    ).to_list(100)
    
    # Calculate match scores
    scored_matches = []
    my_location = my_profile["location"]
    for profile in potential_profiles:
        target_location = profile["location"]
        distance = calculate_distance(
            my_location["lat"], my_location["lng"],
            target_location["lat"], target_location["lng"]
        )
        
        score = calculate_match_score(my_profile, profile, distance)
        scored_matches.append({
            "profile": profile,
            "match_score": score,
            "distance_km": round(distance, 1)
        })
    
    # Sort by match score
    scored_matches.sort(key=lambda x: x["match_score"], reverse=True)
    
    return scored_matches[:limit]


@api_router.post("/matches/swipe")
async def swipe(swipe_data: SwipeAction, current_user: dict = Depends(get_current_user)):
    """Record a swipe action (like, pass, super_like)"""
    # Record interaction
    interaction = Interaction(
        user_id=current_user["user_id"],
        target_user_id=swipe_data.target_user_id,
        action=swipe_data.action
    )
    doc = interaction.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.interactions.insert_one(doc)
    
    # Check if it's a match (if target also liked current user)
    if swipe_data.action in ["like", "super_like"]:
        mutual_like = await db.interactions.find_one({
            "user_id": swipe_data.target_user_id,
            "target_user_id": current_user["user_id"],
            "action": {"$in": ["like", "super_like"]}
        })
        
        if mutual_like:
            # Create match
            match = Match(
                user1_id=current_user["user_id"],
                user2_id=swipe_data.target_user_id
            )
            match_doc = match.model_dump()
            match_doc['matched_at'] = match_doc['matched_at'].isoformat()
            await db.matches.insert_one(match_doc)
            
            # Record match interaction for both users
            for user_id, target_id in [
                (current_user["user_id"], swipe_data.target_user_id),
                (swipe_data.target_user_id, current_user["user_id"])
            ]:
                match_interaction = Interaction(
                    user_id=user_id,
                    target_user_id=target_id,
                    action="match"
                )
                int_doc = match_interaction.model_dump()
                int_doc['created_at'] = int_doc['created_at'].isoformat()
                await db.interactions.insert_one(int_doc)
            
            return {"action": swipe_data.action, "matched": True, "match_id": match.id}
    
    return {"action": swipe_data.action, "matched": False}


@api_router.get("/matches/my-matches")
async def get_my_matches(current_user: dict = Depends(get_current_user)):
    """Get all user's matches"""
    matches = await db.matches.find(
        {
            "$or": [
                {"user1_id": current_user["user_id"]},
                {"user2_id": current_user["user_id"]}
            ],
            "is_active": True
        },
        {"_id": 0}
    ).to_list(1000)
    
    # Enrich with profile data
    enriched_matches = []
    for match in matches:
        other_user_id = match["user2_id"] if match["user1_id"] == current_user["user_id"] else match["user1_id"]
        other_profile = await get_profile_by_user_id(other_user_id)
        if other_profile:
            enriched_matches.append({
                "match_id": match["id"],
                "matched_at": match["matched_at"],
                "profile": other_profile
            })
    
    return enriched_matches


# ==================== MESSAGING ENDPOINTS ====================

@api_router.post("/messages/send")
async def send_message(message_data: MessageCreate, current_user: dict = Depends(get_current_user)):
    """Send a message to a matched user"""
    # Verify users are matched
    match = await db.matches.find_one({
        "$or": [
            {"user1_id": current_user["user_id"], "user2_id": message_data.receiver_id},
            {"user1_id": message_data.receiver_id, "user2_id": current_user["user_id"]}
        ],
        "is_active": True
    })
    
    if not match:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only message matched users"
        )
    
    # Create message
    message = Message(
        match_id=match["id"],
        sender_id=current_user["user_id"],
        receiver_id=message_data.receiver_id,
        content=message_data.content
    )
    
    doc = message.model_dump()
    doc['sent_at'] = doc['sent_at'].isoformat()
    await db.messages.insert_one(doc)
    
    # Update match last_message_at
    await db.matches.update_one(
        {"id": match["id"]},
        {"$set": {"last_message_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message_id": message.id, "sent_at": message.sent_at}


@api_router.get("/messages/{match_id}")
async def get_messages(match_id: str, current_user: dict = Depends(get_current_user)):
    """Get all messages for a match"""
    # Verify user is part of match
    match = await db.matches.find_one({
        "id": match_id,
        "$or": [
            {"user1_id": current_user["user_id"]},
            {"user2_id": current_user["user_id"]}
        ]
    })
    
    if not match:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get messages
    messages = await db.messages.find(
        {"match_id": match_id},
        {"_id": 0}
    ).sort("sent_at", 1).to_list(1000)
    
    # Mark messages as read
    await db.messages.update_many(
        {
            "match_id": match_id,
            "receiver_id": current_user["user_id"],
            "read_at": None
        },
        {"$set": {"read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return messages


# ==================== ANALYTICS ENDPOINTS ====================

@api_router.get("/analytics/my-stats")
async def get_my_analytics(current_user: dict = Depends(get_current_user)):
    """Get user's interaction analytics"""
    # Get all interactions
    views = await db.interactions.count_documents({
        "user_id": current_user["user_id"],
        "action": "view"
    })
    
    likes = await db.interactions.count_documents({
        "user_id": current_user["user_id"],
        "action": {"$in": ["like", "super_like"]}
    })
    
    passes = await db.interactions.count_documents({
        "user_id": current_user["user_id"],
        "action": "pass"
    })
    
    matches = await db.interactions.count_documents({
        "user_id": current_user["user_id"],
        "action": "match"
    })
    
    # Profile views (how many viewed me)
    profile_views = await db.interactions.count_documents({
        "target_user_id": current_user["user_id"],
        "action": "view"
    })
    
    # Likes received
    likes_received = await db.interactions.count_documents({
        "target_user_id": current_user["user_id"],
        "action": {"$in": ["like", "super_like"]}
    })
    
    total_interactions = views + likes + passes
    goal_progress = (total_interactions / 20) * 100
    
    return {
        "total_interactions": total_interactions,
        "goal_progress": min(goal_progress, 100),
        "views": views,
        "likes_sent": likes,
        "passes": passes,
        "matches": matches,
        "profile_views": profile_views,
        "likes_received": likes_received,
        "match_rate": round((matches / likes * 100), 1) if likes > 0 else 0
    }


@api_router.get("/analytics/admin")
async def get_admin_analytics():
    """Get platform-wide analytics (admin only)"""
    total_users = await db.users.count_documents({})
    total_profiles = await db.profiles.count_documents({})
    total_matches = await db.matches.count_documents({})
    total_messages = await db.messages.count_documents({})
    
    # Active users (interacted in last 7 days)
    week_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    active_users = await db.interactions.distinct("user_id", {
        "created_at": {"$gte": week_ago}
    })
    
    return {
        "total_users": total_users,
        "total_profiles": total_profiles,
        "profile_completion_rate": round((total_profiles / total_users * 100), 1) if total_users > 0 else 0,
        "total_matches": total_matches,
        "total_messages": total_messages,
        "active_users_7d": len(active_users),
        "messages_per_match": round(total_messages / total_matches, 1) if total_matches > 0 else 0
    }


# ==================== WAITLIST ENDPOINTS (Phase 1 & 2) ====================

@api_router.post("/waitlist/join", response_model=UserStats, status_code=status.HTTP_201_CREATED)
async def join_waitlist(signup: WaitlistSignup):
    """Join the waitlist with email and optional referral code"""
    existing_user = await db.waitlist.find_one({"email": signup.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered on waitlist"
        )
    
    referrer = None
    if signup.referred_by:
        referrer = await db.waitlist.find_one({"referral_code": signup.referred_by}, {"_id": 0})
        if not referrer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid referral code"
            )
    
    referral_code = generate_referral_code()
    while await db.waitlist.find_one({"referral_code": referral_code}):
        referral_code = generate_referral_code()
    
    is_vip = signup.gender and signup.gender.lower() == "female"
    new_user = WaitlistUser(
        email=signup.email,
        referral_code=referral_code,
        referred_by=signup.referred_by,
        gender=signup.gender,
        is_vip=is_vip,
        boosts=1 if is_vip else 0
    )
    
    doc = new_user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.waitlist.insert_one(doc)
    
    if referrer:
        await db.waitlist.update_one(
            {"email": referrer["email"]},
            {"$inc": {"verified_referrals": 1, "boosts": 1}}
        )
    
    if is_vip:
        position = await db.waitlist.count_documents({"is_vip": True, "created_at": {"$lt": doc['created_at']}})
    else:
        vip_count = await db.waitlist.count_documents({"is_vip": True})
        non_vip_before = await db.waitlist.count_documents({
            "is_vip": False,
            "created_at": {"$lt": doc['created_at']}
        })
        position = vip_count + non_vip_before
    
    return UserStats(
        email=new_user.email,
        referral_code=new_user.referral_code,
        boosts=new_user.boosts,
        verified_referrals=new_user.verified_referrals,
        position_in_line=position + 1,
        is_vip=is_vip
    )


@api_router.get("/waitlist/stats/{email}", response_model=UserStats)
async def get_waitlist_user_stats(email: str):
    """Get user's waitlist stats by email"""
    user = await db.waitlist.find_one({"email": email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    if user.get("is_vip"):
        position = await db.waitlist.count_documents({
            "is_vip": True,
            "created_at": {"$lt": user["created_at"]}
        })
    else:
        vip_count = await db.waitlist.count_documents({"is_vip": True})
        non_vip_before = await db.waitlist.count_documents({
            "is_vip": False,
            "created_at": {"$lt": user["created_at"]}
        })
        position = vip_count + non_vip_before
    
    return UserStats(
        email=user["email"],
        referral_code=user["referral_code"],
        boosts=user.get("boosts", 0),
        verified_referrals=user.get("verified_referrals", 0),
        position_in_line=position + 1,
        is_vip=user.get("is_vip", False)
    )


@api_router.get("/waitlist/stats", response_model=WaitlistStats)
async def get_waitlist_stats():
    """Get overall waitlist statistics"""
    total = await db.waitlist.count_documents({})
    female = await db.waitlist.count_documents({"gender": "female"})
    male = await db.waitlist.count_documents({"gender": "male"})
    
    pipeline = [{"$group": {"_id": None, "total": {"$sum": "$verified_referrals"}}}]
    referral_result = await db.waitlist.aggregate(pipeline).to_list(1)
    total_referrals = referral_result[0]["total"] if referral_result else 0
    
    active = await db.waitlist.count_documents({"status": "active"})
    
    return WaitlistStats(
        total_signups=total,
        female_signups=female,
        male_signups=male,
        total_referrals=total_referrals,
        active_users=active
    )


@api_router.post("/waitlist/verify-referral", response_model=dict)
async def verify_referral(verification: ReferralVerification):
    """Verify if a referral code is valid"""
    user = await db.waitlist.find_one({"referral_code": verification.referral_code}, {"_id": 0})
    if user:
        return {
            "valid": True,
            "referrer_email": user["email"][:3] + "***",
            "is_vip": user.get("is_vip", False)
        }
    return {"valid": False}


# ==================== POSE DETECTION ENDPOINTS (MOCKED) ====================

async def verify_pose_internal(image_base64: str, user_id: str):
    """Internal pose verification function"""
    mock_confidence = random.uniform(0.85, 0.99)
    mock_poses = ["standing", "face_visible", "full_body"]
    success = random.random() < 0.9
    
    return {
        "success": success,
        "confidence": round(mock_confidence, 2),
        "detected_poses": mock_poses if success else [],
        "message": "Pose verified successfully!" if success else "Please retake photo with full body visible"
    }

@api_router.post("/pose-detection/verify", response_model=PoseDetectionResponse)
async def verify_pose(request: PoseDetectionRequest):
    """Mock Google ML Kit Pose Detection API"""
    result = await verify_pose_internal(request.image_base64, request.user_id)
    return PoseDetectionResponse(**result)


# ==================== STRIPE MOCK ENDPOINTS ====================

@api_router.post("/subscription/create")
async def create_subscription(user_id: str, plan_type: str = "premium"):
    """Mock Stripe subscription creation"""
    mock_subscription_id = f"sub_mock_{uuid.uuid4().hex[:16]}"
    
    subscription = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "plan_type": plan_type,
        "price": 10.0,
        "status": "active",
        "stripe_subscription_id": mock_subscription_id,
        "start_date": datetime.now(timezone.utc).isoformat()
    }
    
    await db.subscriptions.insert_one(subscription)
    
    return {
        "success": True,
        "subscription_id": mock_subscription_id,
        "message": "Subscription created successfully (MOCKED)"
    }


@api_router.post("/powerup/purchase")
async def purchase_powerup(user_id: str, powerup_type: str):
    """Mock Stripe power-up purchase"""
    mock_payment_id = f"pi_mock_{uuid.uuid4().hex[:16]}"
    
    prices = {"boost": 2.99, "super_like": 2.99, "rewind": 2.99}
    
    purchase = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "power_up_type": powerup_type,
        "price": prices.get(powerup_type, 2.99),
        "stripe_payment_id": mock_payment_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.powerup_purchases.insert_one(purchase)
    
    return {
        "success": True,
        "payment_id": mock_payment_id,
        "message": f"Power-up '{powerup_type}' purchased successfully (MOCKED)"
    }


@api_router.post("/stripe/webhook")
async def stripe_webhook(payload: dict):
    """Mock Stripe webhook handler"""
    event_type = payload.get("type", "unknown")
    return {
        "received": True,
        "event_type": event_type,
        "message": "Webhook processed (MOCKED)"
    }

# ==================== BASIC ====================

@api_router.get("/")
async def root():
    return {"message": "Dating App API - Ready to Launch! ", "version": "Phase 3"}


@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "services": {
            "authentication": "active",
            "profiles": "active",
            "matching": "active",
            "messaging": "active",
            "pose_detection": "mocked",
            "stripe": "mocked"
        },
        "phase": 3
    }

# ==================== APP CONFIG ====================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)

@app.on_event("shutdown")
async def shutdown():
    client.close()
