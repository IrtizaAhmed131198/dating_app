# 📡 API Documentation - Dating App

## Base URL
- **Development:** http://localhost:8001/api
- **Production:** https://date-launch-plan.preview.emergentagent.com/api

---

## 🔐 Authentication
Currently no authentication required (waitlist phase).
Future phases will use JWT tokens for protected endpoints.

---

## 📋 Waitlist Endpoints

### 1. Join Waitlist
Create a new waitlist entry with optional referral code.

**Endpoint:** `POST /api/waitlist/join`

**Request Body:**
```json
{
  "email": "user@example.com",
  "gender": "female",  // Optional: "female", "male", "other"
  "referred_by": "ABC12345"  // Optional: referral code
}
```

**Response (201 Created):**
```json
{
  "email": "user@example.com",
  "referral_code": "XYZ98765",
  "boosts": 1,
  "verified_referrals": 0,
  "position_in_line": 1,
  "is_vip": true
}
```

**Business Logic:**
- Female users automatically get `is_vip: true`
- VIP users get 1 free boost on signup
- VIP users are prioritized in queue
- If `referred_by` is valid, referrer gets +1 boost
- Each referral generates a unique 8-character code

**Error Responses:**
- `400 Bad Request` - Email already registered
- `400 Bad Request` - Invalid referral code


### 2. Get User Stats
Retrieve waitlist statistics for a specific user.

**Endpoint:** `GET /api/waitlist/stats/{email}`

**Path Parameters:**
- `email` (string, required) - User's email address

**Response (200 OK):**
```json
{
  "email": "user@example.com",
  "referral_code": "XYZ98765",
  "boosts": 3,
  "verified_referrals": 2,
  "position_in_line": 1,
  "is_vip": true
}
```

**Error Responses:**
- `404 Not Found` - User not found


### 3. Get Overall Waitlist Stats
Retrieve aggregated statistics for admin dashboard.

**Endpoint:** `GET /api/waitlist/stats`

**Response (200 OK):**
```json
{
  "total_signups": 150,
  "female_signups": 90,
  "male_signups": 60,
  "total_referrals": 45,
  "active_users": 0
}
```

**Metrics Explained:**
- `total_signups` - Total users on waitlist
- `female_signups` - Number of VIP women
- `male_signups` - Number of men
- `total_referrals` - Sum of all verified referrals
- `active_users` - Users with status "active"


### 4. Verify Referral Code
Check if a referral code is valid before signup.

**Endpoint:** `POST /api/waitlist/verify-referral`

**Request Body:**
```json
{
  "referral_code": "ABC12345"
}
```

**Response (200 OK) - Valid Code:**
```json
{
  "valid": true,
  "referrer_email": "use***",
  "is_vip": true
}
```

**Response (200 OK) - Invalid Code:**
```json
{
  "valid": false
}
```

---

## 🤖 AI Pose Detection Endpoints (MOCKED)

### Verify Pose
Analyze user photo for pose detection and verification.

**Endpoint:** `POST /api/pose-detection/verify`

**Request Body:**
```json
{
  "image_base64": "base64_encoded_image_string",
  "user_id": "user_uuid"
}
```

**Response (200 OK) - Success:**
```json
{
  "success": true,
  "confidence": 0.94,
  "detected_poses": [
    "standing",
    "face_visible",
    "full_body"
  ],
  "message": "Pose verified successfully!"
}
```

**Response (200 OK) - Failed Verification:**
```json
{
  "success": false,
  "confidence": 0.43,
  "detected_poses": [],
  "message": "Please retake photo with full body visible"
}
```

**Mock Behavior:**
- 90% success rate
- Random confidence between 0.85-0.99
- Returns common pose indicators

**Real Integration TODO:**
- Replace with Google ML Kit API
- Add image processing logic
- Store verification results
- Add retry mechanism

---

## 💳 Stripe Payment Endpoints (MOCKED)

### 1. Create Subscription
Create a new subscription for premium features.

**Endpoint:** `POST /api/subscription/create`

**Query Parameters:**
- `user_id` (string, required) - User's UUID
- `plan_type` (string, optional) - "premium" (default) or "basic"

**Response (200 OK):**
```json
{
  "success": true,
  "subscription_id": "sub_mock_a1b2c3d4e5f6",
  "message": "Subscription created successfully (MOCKED)"
}
```

**Subscription Details:**
- **Plan:** Premium
- **Price:** $10.00/month
- **Status:** Active
- **Duration:** Recurring monthly


### 2. Purchase Power-Up
Buy one-time power-ups for enhanced features.

**Endpoint:** `POST /api/powerup/purchase`

**Query Parameters:**
- `user_id` (string, required) - User's UUID
- `powerup_type` (string, required) - "boost", "super_like", or "rewind"

**Response (200 OK):**
```json
{
  "success": true,
  "payment_id": "pi_mock_1234567890abcdef",
  "message": "Power-up 'boost' purchased successfully (MOCKED)"
}
```

**Power-Up Types & Prices:**
- **Boost** - $2.99 - Increase profile visibility
- **Super Like** - $2.99 - Stand out to potential matches
- **Rewind** - $2.99 - Undo last swipe


### 3. Stripe Webhook Handler
Handle Stripe webhook events for payment processing.

**Endpoint:** `POST /api/stripe/webhook`

**Request Body:**
```json
{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      // Stripe event data
    }
  }
}
```

**Response (200 OK):**
```json
{
  "received": true,
  "event_type": "payment_intent.succeeded",
  "message": "Webhook processed (MOCKED)"
}
```

**Supported Event Types:**
- `payment_intent.succeeded` - Payment completed
- `subscription.created` - New subscription
- `subscription.updated` - Subscription changed
- `subscription.deleted` - Subscription cancelled
- `invoice.payment_failed` - Payment failed

**Real Integration TODO:**
- Verify webhook signature
- Process real payment events
- Update database based on events
- Handle edge cases and failures

---

## 🏥 System Endpoints

### 1. Root Endpoint
Basic API status check.

**Endpoint:** `GET /api/`

**Response (200 OK):**
```json
{
  "message": "Dating App API - Ready to Launch! 💘"
}
```


### 2. Health Check
Comprehensive system health status.

**Endpoint:** `GET /api/health`

**Response (200 OK):**
```json
{
  "status": "healthy",
  "database": "connected",
  "services": {
    "pose_detection": "mocked",
    "stripe": "mocked"
  }
}
```

**Status Indicators:**
- `status` - Overall API health
- `database` - MongoDB connection status
- `services` - External service status

---

## 🗄️ Data Models

### WaitlistUser
```typescript
{
  id: string;                    // UUID v4
  email: string;                 // Valid email
  referral_code: string;         // 8-char unique code
  referred_by: string | null;    // Referrer's code
  boosts: number;                // Boost count (starts at 0 or 1)
  gender: string | null;         // "female", "male", "other"
  is_vip: boolean;               // VIP status (auto for female)
  status: string;                // "pending", "invited", "active"
  city: string;                  // Default: "NYC"
  created_at: string;            // ISO datetime
  verified_referrals: number;    // Count of successful invites
}
```

### SubscriptionPlan
```typescript
{
  id: string;                      // UUID v4
  user_id: string;                 // User's UUID
  plan_type: string;               // "basic" or "premium"
  price: number;                   // Monthly price
  status: string;                  // "active", "cancelled", "expired"
  stripe_subscription_id: string;  // Stripe sub ID
  start_date: string;              // ISO datetime
  end_date: string | null;         // ISO datetime or null
}
```

### PowerUpPurchase
```typescript
{
  id: string;                   // UUID v4
  user_id: string;              // User's UUID
  power_up_type: string;        // "boost", "super_like", "rewind"
  price: number;                // Purchase price
  stripe_payment_id: string;    // Stripe payment ID
  created_at: string;           // ISO datetime
}
```

---

## 🔄 Common Workflows

### Workflow 1: New User Signup
```
1. User visits landing page
2. User fills out email + gender
3. Frontend: POST /api/waitlist/join
4. Backend: Generates referral code, calculates position
5. Frontend: Shows dashboard with stats
6. User shares referral link
```

### Workflow 2: Referral Signup
```
1. Friend clicks referral link with code
2. Code pre-filled in signup form
3. Frontend: POST /api/waitlist/join (with referred_by)
4. Backend: Validates code, adds boost to both users
5. Frontend: Shows success + new user stats
6. Original user's stats automatically updated
```

### Workflow 3: Admin Monitoring
```
1. Admin visits /dashboard
2. Frontend: GET /api/waitlist/stats
3. Backend: Aggregates all metrics
4. Frontend: Displays in cards
5. Auto-refreshes every 30 seconds
```

---

## 🚨 Error Handling

### Standard Error Response
```json
{
  "detail": "Error message here"
}
```

### Common HTTP Status Codes
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Server error

---

## 🧪 Testing Examples

### cURL Examples

**Join waitlist:**
```bash
curl -X POST http://localhost:8001/api/waitlist/join \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","gender":"female"}'
```

**Get user stats:**
```bash
curl http://localhost:8001/api/waitlist/stats/test@example.com
```

**Test pose detection:**
```bash
curl -X POST http://localhost:8001/api/pose-detection/verify \
  -H "Content-Type: application/json" \
  -d '{"image_base64":"test","user_id":"123"}'
```

### JavaScript/Axios Examples

**Join waitlist:**
```javascript
const response = await axios.post(`${API}/waitlist/join`, {
  email: 'test@example.com',
  gender: 'female',
  referred_by: 'ABC12345'
});
console.log(response.data);
```

**Get stats:**
```javascript
const stats = await axios.get(`${API}/waitlist/stats`);
console.log(stats.data);
```

---

## 📊 Rate Limits
Currently no rate limits implemented (waitlist phase).

**Recommended for Production:**
- 10 requests/minute per IP for signup
- 60 requests/minute for stats endpoints
- 100 requests/minute for authenticated users

---

## 🔐 Security Considerations

**Current State (Waitlist):**
- ✅ Email validation
- ✅ Input sanitization
- ✅ CORS configured
- ❌ No authentication
- ❌ No rate limiting

**TODO for Production:**
- [ ] Add JWT authentication
- [ ] Implement rate limiting
- [ ] Add request validation middleware
- [ ] Enable HTTPS only
- [ ] Add CSRF protection
- [ ] Implement proper error logging

---

## 📝 Interactive API Docs

FastAPI provides automatic interactive documentation:

**Swagger UI:**
- URL: http://localhost:8001/docs
- Test all endpoints directly
- See request/response schemas

**ReDoc:**
- URL: http://localhost:8001/redoc
- Alternative documentation view

---

## 🔄 Version History

**v1.0 - Current (Phase 1 & 2)**
- Waitlist management
- Referral system
- VIP "Ladies First"
- Mock integrations
- Admin dashboard

**v2.0 - Planned (Phase 3)**
- User authentication
- Profile management
- Photo verification
- Matching system

**v3.0 - Planned (Phase 4)**
- Real Stripe integration
- Subscription management
- Power-ups store
- Analytics API

---

**Last Updated:** January 5, 2025  
**API Version:** 1.0  
**Status:** ✅ Operational
