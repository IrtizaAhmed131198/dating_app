# 🚀 Quick Start Guide - Dating App

## 🎯 What's Been Built

A playful, AI-powered dating app with **Phase 1 & 2** complete:
- ✅ Waitlist landing page with VIP "Ladies First" system
- ✅ Referral tracking with boost rewards
- ✅ Mock Google ML Kit pose detection API
- ✅ Mock Stripe payment system
- ✅ Admin dashboard for metrics


## 🏃 Running the App

### Prerequisites
All dependencies are already installed! Services are running via Supervisor.

### Check Services Status
```bash
sudo supervisorctl status
```

### Restart Services (if needed)
```bash
sudo supervisorctl restart all
```

### Access the App
- **Landing Page:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/dashboard
- **API Health Check:** http://localhost:8001/api/health
- **API Documentation:** http://localhost:8001/docs


## 📋 API Testing Examples

### 1. Join Waitlist (Female - VIP)
```bash
curl -X POST http://localhost:8001/api/waitlist/join \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "gender": "female"
  }'
```
**Expected:** User gets VIP status + 1 free boost + position #1 in VIP lane

### 2. Join with Referral Code
```bash
curl -X POST http://localhost:8001/api/waitlist/join \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "gender": "male",
    "referred_by": "ABC12345"
  }'
```
**Expected:** Both users get +1 boost, referrer's verified_referrals +1

### 3. Get User Stats
```bash
curl http://localhost:8001/api/waitlist/stats/alice@example.com
```

### 4. Get Overall Stats
```bash
curl http://localhost:8001/api/waitlist/stats
```

### 5. Test Pose Detection (Mock)
```bash
curl -X POST http://localhost:8001/api/pose-detection/verify \
  -H "Content-Type: application/json" \
  -d '{
    "image_base64": "fake_base64_image_data",
    "user_id": "user123"
  }'
```

### 6. Create Subscription (Mock)
```bash
curl -X POST "http://localhost:8001/api/subscription/create?user_id=user123&plan_type=premium"
```

### 7. Purchase Power-up (Mock)
```bash
curl -X POST "http://localhost:8001/api/powerup/purchase?user_id=user123&powerup_type=boost"
```


## 🧪 Frontend Testing Flow

### Test the Complete User Journey:

1. **Open Landing Page:**
   - Visit: http://localhost:3000
   - See playful gradient design with animated blobs
   - Notice "Ladies First" VIP badge

2. **Sign Up as VIP (Female):**
   - Enter email
   - Select "Woman" tab
   - Click "Join The Waitlist"
   - See success toast: "🎉 Welcome VIP! You're in the fast lane!"

3. **View Your Dashboard:**
   - See position in line (VIP lane)
   - See 1 free boost
   - Get unique referral code
   - Copy and share referral link

4. **Test Referral System:**
   - Open incognito window
   - Paste referral link
   - Sign up with different email
   - Original user gets +1 boost

5. **View Admin Dashboard:**
   - Visit: http://localhost:3000/dashboard
   - See real-time metrics:
     - Total signups
     - Female/Male breakdown
     - Referral rate
     - Female/Male ratio


## 🎨 Design Features

### Playful Elements:
- **Gradient backgrounds** - Pink, purple, blue animations
- **Blob animations** - Floating background shapes
- **Toast notifications** - Success/error messages
- **VIP badges** - Special crown icons for women
- **Emoji icons** - Throughout the interface
- **Smooth transitions** - CSS animations everywhere

### Color Scheme:
- Pink: `#ec4899` - Primary CTA, VIP elements
- Purple: `#a855f7` - Secondary accent
- Blue: `#3b82f6` - Info elements
- Gradients: Smooth transitions between all colors


## 🗂️ File Structure

```
/app/
├── backend/
│   ├── server.py           # Main FastAPI app with all endpoints
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Backend config (MongoDB, CORS)
│
├── frontend/
│   ├── src/
│   │   ├── App.js         # Main app with routing
│   │   ├── App.css        # Global styles & animations
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Waitlist signup page
│   │   │   └── Dashboard.jsx     # Admin metrics page
│   │   └── components/ui/  # Reusable UI components
│   ├── package.json       # Node dependencies
│   └── .env              # Frontend config (backend URL)
│
└── PROJECT_STATUS.md      # Comprehensive documentation
```


## 🔧 Development Commands

### Backend:
```bash
# View backend logs
tail -f /var/log/supervisor/backend.out.log
tail -f /var/log/supervisor/backend.err.log

# Restart backend
sudo supervisorctl restart backend

# Test API directly
curl http://localhost:8001/api/health
```

### Frontend:
```bash
# View frontend logs
tail -f /var/log/supervisor/frontend.out.log

# Restart frontend
sudo supervisorctl restart frontend

# Frontend is at: http://localhost:3000
```

### MongoDB:
```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/test_database

# View collections
db.waitlist.find().pretty()
db.subscriptions.find().pretty()
db.powerup_purchases.find().pretty()

# Count documents
db.waitlist.countDocuments()

# Clear waitlist (for testing)
db.waitlist.deleteMany({})
```


## 🎯 Key Features Implemented

### 1. VIP "Ladies First" System
- Women automatically get VIP status
- VIP users get 1 free boost on signup
- VIP users appear first in queue
- Special VIP badge in UI

### 2. Referral System
- Unique 8-character codes (e.g., "ABC12XY")
- Referrals tracked in database
- Both users get +1 boost per referral
- Referrer sees verified_referrals count

### 3. Position Tracking
- Smart queue: VIP users first, then others
- Real-time position calculation
- Shows "#2 in VIP lane" or "#15 in line"

### 4. Mock Integrations
- **Google ML Kit** - Pose detection ready
- **Stripe** - Subscriptions & power-ups ready
- Easy to swap with real APIs later


## 🚀 What's Next?

### Phase 3 (Weeks 9-12):
- [ ] User authentication system
- [ ] Photo upload with pose verification
- [ ] Profile creation (bio, interests)
- [ ] Location-based matching (NYC downtown)
- [ ] Swipe interface
- [ ] Match & chat system

### Phase 4 (Month 4+):
- [ ] Real Stripe integration
- [ ] $10/mo subscription activation
- [ ] $2.99 power-ups store
- [ ] Analytics dashboard
- [ ] Fundraising metrics


## 📊 Current Metrics (Example)

After testing, you should see:
- **Total Signups:** 3
- **Female Signups:** 2 (VIP)
- **Male Signups:** 1
- **Total Referrals:** 1
- **Referral Rate:** 33%
- **Female/Male Ratio:** 2.00:1


## 🎉 Success Criteria

✅ Landing page loads with playful design
✅ Users can join waitlist
✅ VIP system works for women
✅ Referral codes generated
✅ Boosts tracked correctly
✅ Position calculated properly
✅ Admin dashboard shows metrics
✅ Mock APIs responding
✅ Toast notifications working
✅ Clipboard sharing works


## 🐛 Troubleshooting

### Backend not starting?
```bash
# Check logs
tail -n 100 /var/log/supervisor/backend.err.log

# Common fix: restart MongoDB first
sudo supervisorctl restart mongodb
sleep 2
sudo supervisorctl restart backend
```

### Frontend not loading?
```bash
# Check logs
tail -n 50 /var/log/supervisor/frontend.err.log

# Restart frontend
sudo supervisorctl restart frontend
```

### Database issues?
```bash
# Check MongoDB status
sudo supervisorctl status mongodb

# Restart MongoDB
sudo supervisorctl restart mongodb
```

### API calls failing?
```bash
# Test backend health
curl http://localhost:8001/api/health

# Check CORS settings in backend/.env
cat /app/backend/.env
```


## 💡 Pro Tips

1. **Use Incognito Windows** - Test referral system without logout
2. **Check MongoDB** - View real data being stored
3. **Watch Logs** - Real-time debugging with `tail -f`
4. **Test Mobile** - Responsive design works on all screens
5. **Copy & Share** - Referral system is the viral loop!


## 📞 Need Help?

- **API Documentation:** http://localhost:8001/docs
- **Project Status:** See `/app/PROJECT_STATUS.md`
- **Console Logs:** Check browser developer tools
- **Backend Logs:** `/var/log/supervisor/backend.*.log`
- **Frontend Logs:** `/var/log/supervisor/frontend.*.log`


---

**🎊 You're all set! Start testing and prepare for the NYC launch!**

**Live URL:** https://date-launch-plan.preview.emergentagent.com
