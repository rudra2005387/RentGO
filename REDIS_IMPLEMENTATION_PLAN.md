# 🔴 Redis Implementation Plan for RentGo

## Executive Summary
Redis will optimize RentGo for **high-traffic scenarios** by implementing intelligent caching, session management, rate limiting, and real-time features. Current setup: ioredis ready, graceful fallback enabled.

---

## 📊 Phase-Based Implementation Strategy

### **Phase 1: Core Infrastructure (Foundation)** ⚙️
*Timeline: 1-2 days | Priority: CRITICAL*

#### 1.1 Session Management
**What:** Cache user sessions after login
**Why:** Reduce database queries for every API request
**Impact:** 90% faster authentication checks

**Implementation:**
- Store JWT tokens in Redis with TTL
- Cache user profile data with session
- Invalidate on logout or password change

**Key Metrics:**
- Session TTL: 7 days (configurable)
- Database calls reduction: 100% → 5%
- Query time: 50ms → <1ms

---

#### 1.2 Token Blacklisting (Logout)
**What:** Cache blacklisted tokens for logout
**Why:** Prevent use of old tokens after logout
**Impact:** Secure session management

**Implementation:**
- Add logout tokens to Redis with remaining TTL
- Check blacklist on every protected route
- Auto-expire after token expiration

**Key Metrics:**
- Security: ✅ Immediate logout
- Performance: <1ms per check

---

### **Phase 2: High-Impact Caching** 📦
*Timeline: 2-3 days | Priority: HIGH*

#### 2.1 Listing Cache (50% Performance Gain)
**Current Problem:** Every search queries 1000s of listings from MongoDB

**What to Cache:**
- Individual listing details (by ID)
- Search results (filtered & paginated)
- Host listings
- Featured listings
- Category listings

**Caching Strategy:**

```
redis-cache-keys:
├── listing:{id}              ← Individual listing (24 hours)
├── listings:search:{filters} ← Search results (2 hours)
├── listings:host:{hostId}    ← Host's listings (6 hours)
├── listings:featured         ← Featured listings (12 hours)
└── listings:category:{type}  ← By property type (6 hours)
```

**TTL Strategy:**
- Individual listing: 24 hours (invalidate on update)
- Search results: 2 hours (frequently changing)
- Host listings: 6 hours
- Featured: 12 hours
- Categories: 6 hours

**Cache Invalidation:**
```
When listing is created/updated/deleted:
├── Clear listing:{id}
├── Clear listings:search:*
├── Clear listings:host:{hostId}
├── Clear listings:featured
└── Clear listings:category:{type}
```

**Expected Impact:**
- Query reduction: 80%
- Search time: 500ms → 50ms
- Database load: ↓ 40%

---

#### 2.2 User Profile Cache (30% Performance Gain)
**What to Cache:**
- User profile (name, email, bio, avatar)
- Host information (ratings, response rate)
- User preferences
- Favorites list

**Caching Strategy:**

```
redis-cache-keys:
├── user:{id}                 ← Full user profile (12 hours)
├── user:{id}:host-info      ← Host-specific data (12 hours)
├── user:{id}:favorites      ← User favorites (6 hours)
├── user:{id}:bookings       ← Recent bookings (3 hours)
└── user:{email}:exists      ← Email lookup (24 hours)
```

**Cache Invalidation:**
```
When user profile is updated:
├── Clear user:{id}
├── Clear user:{id}:host-info
└── Clear user:{email}:exists
```

**Expected Impact:**
- Profile queries: 70% reduction
- Profile load time: 100ms → 20ms

---

#### 2.3 Review/Rating Cache (20% Performance Gain)
**What to Cache:**
- Average ratings per listing
- Rating distribution
- Review list (paginated)
- Host ratings

**Caching Strategy:**

```
redis-cache-keys:
├── reviews:listing:{id}:avg       ← Average rating (24 hours)
├── reviews:listing:{id}:dist      ← Distribution (24 hours)
├── reviews:listing:{id}:page:{n}  ← Paginated reviews (12 hours)
└── reviews:host:{id}:avg          ← Host average (24 hours)
```

**Expected Impact:**
- Rating queries: 60% reduction
- Reviews page load: 300ms → 80ms

---

### **Phase 3: Advanced Features** 🚀
*Timeline: 3-5 days | Priority: MEDIUM-HIGH*

#### 3.1 Real-Time Notifications (Redis Pub/Sub)
**What:** Push notifications via Socket.io + Redis

**Architecture:**
```
Publisher (API) → Redis Pub/Sub → Subscribers (Socket.io clients)

Events:
├── booking:requested     → Host gets notification
├── booking:confirmed     → Guest gets notification
├── booking:cancelled     → Both get notification
├── review:posted         → Host gets notification
├── message:sent          → Guest/Host get notification
└── price:updated         → Interested guests get notification
```

**Implementation:**
- Use Redis channels for event broadcasting
- Sync across multiple server instances
- Fallback to WebSocket if Redis unavailable

**Key Channels:**
```javascript
redis:channels
├── notifications:user:{userId}
├── listings:updates
├── bookings:updates
└── messages:chat:{conversationId}
```

**Expected Impact:**
- Real-time latency: <100ms
- Multi-server sync: ✅ Enabled
- Scalability: ✅ Horizontal scaling ready

---

#### 3.2 Booking Availability Cache
**What:** Cache available dates to prevent double-booking

**Caching Strategy:**

```
redis-cache-keys:
├── availability:listing:{id}:{date} ← Per-day availability (30 days)
└── bookings:listing:{id}            ← All bookings (real-time)
```

**Expected Impact:**
- Availability check: 1000ms → 5ms
- Double-booking incidents: ↓ 95%

---

#### 3.3 Rate Limiting with Redis
**What:** Track API requests per user/IP

**Current:** Express-rate-limit (memory-based)
**Upgraded:** Redis-backed rate limiting

**Strategy:**

```
redis-rate-limit-keys:
├── rate-limit:ip:{ip}              ← Per IP (15 min window)
├── rate-limit:user:{userId}        ← Per authenticated user (1 hour)
├── rate-limit:api:{endpoint}:{ip}  ← Per endpoint per IP
└── rate-limit:search:user:{userId} ← Search-specific limit
```

**Limits:**
- General API: 500 req/15min per IP
- Authenticated user: 1000 req/hour
- Search endpoint: 100 req/hour per user
- Booking endpoint: 20 req/hour per user

**Expected Impact:**
- DDoS protection: ✅ Enhanced
- Spam prevention: ✅ Enabled
- Rate limit accuracy: 100%

---

### **Phase 4: Optimization & Monitoring** 📈
*Timeline: 2-3 days | Priority: MEDIUM*

#### 4.1 Cache Analytics
**What to Track:**
- Cache hit/miss ratio
- Memory usage
- Key expiration patterns
- Hot keys (most accessed)

**Implementation:**
- Redis INFO command monitoring
- Custom analytics middleware
- Dashboard (optional)

**Target Metrics:**
- Hit ratio: > 80%
- Memory: < 2GB for 100K users
- Eviction rate: < 5%

---

#### 4.2 Key Expiration Strategy
**Auto-Cleanup:**
- TTL for all keys (no infinite keys)
- Lazy cleanup on access
- Periodic cleanup job

**Strategy:**
```javascript
// Every key must have TTL
redis.setex(key, ttl_seconds, value);

// Cleanup job runs hourly
├── Remove expired keys
├── Compact memory
└── Log statistics
```

---

## 🎯 Implementation Priority Matrix

| Feature | Phase | Priority | Complexity | Impact | Effort |
|---------|-------|----------|-----------|--------|--------|
| Session Management | 1 | 🔴 CRITICAL | Low | HIGH | 1 day |
| Token Blacklist | 1 | 🔴 CRITICAL | Low | MEDIUM | 0.5 day |
| Listing Cache | 2 | 🔴 CRITICAL | Medium | VERY HIGH | 1 day |
| User Profile Cache | 2 | 🟠 HIGH | Low | HIGH | 0.5 day |
| Review Cache | 2 | 🟠 HIGH | Low | MEDIUM | 0.5 day |
| Real-time Notifications | 3 | 🟡 MEDIUM-HIGH | High | HIGH | 2 days |
| Booking Availability | 3 | 🟡 MEDIUM-HIGH | Medium | HIGH | 1 day |
| Rate Limiting | 3 | 🟡 MEDIUM-HIGH | Low | MEDIUM | 0.5 day |
| Analytics | 4 | 🟢 MEDIUM | Low | LOW | 1 day |

---

## 📊 Data Flow Architecture

### **Current Flow (Without Redis)**
```
Client
  ↓
Express API
  ↓
MongoDB (every request)
  ↓
Response
```
**Problem:** High DB load, slow responses

### **Optimized Flow (With Redis)**
```
Client
  ↓
Express API
  ↓
Redis Cache ← Hit? Return ✅
  ↓ Miss
MongoDB
  ↓ Write to cache
Redis Cache
  ↓
Response (to client + cache next time)
```
**Benefit:** 90% faster for cached data, 50% fewer DB queries

---

## 🗂️ Redis Key Naming Convention

**Standard Format:** `namespace:type:id:subtype:timestamp`

```javascript
// Examples:
session:user:${userId}:${token}
user:${id}
user:${id}:profile
user:${id}:preferences
user:${email}:exists

listing:${id}
listings:search:${hash(filters)}
listings:host:${hostId}
listings:featured

booking:${id}
availability:${listingId}:${date}

notification:${userId}:${notificationId}
favorites:${userId}

rate-limit:ip:${ip}
rate-limit:user:${userId}
```

---

## 🔧 Implementation Steps

### **Step 1: Create Redis Service Layer**
```javascript
// services/redis.service.js
- get(key)
- set(key, value, ttl)
- del(key)
- incr(key)
- publish(channel, message)
- subscribe(channel)
```

### **Step 2: Add Cache Middleware**
```javascript
// middleware/cache.middleware.js
- cacheMiddleware(key, ttl)
- clearCache(pattern)
- getCacheStats()
```

### **Step 3: Update Controllers**
```javascript
// controllers/*.js
- Check cache first
- Set cache after DB query
- Clear cache on update/delete
```

### **Step 4: Add Real-Time Features**
```javascript
// socket handlers
- Pub/sub for notifications
- Real-time availability
- Live updates
```

---

## 💾 Storage Estimation

| Feature | Est. Keys | Avg Size | Total Size |
|---------|-----------|----------|-----------|
| Sessions (10K users) | 10K | 500B | 5MB |
| Listings (5K) | 15K* | 3KB | 45MB |
| Users (10K) | 20K* | 2KB | 40MB |
| Reviews | 30K* | 1KB | 30MB |
| Rate limits | 50K | 100B | 5MB |
| Notifications | 10K | 500B | 5MB |
| **Total** | **135K** | - | **~130MB** |

*Includes search results, filters, pagination

---

## 🎯 Success Metrics (Post-Implementation)

### **Performance**
- Average response time: 500ms → 200ms (60% faster)
- Database queries: -50%
- Cache hit rate: > 80%
- P95 response time: < 500ms

### **Scalability**
- Support 10,000 concurrent users (vs 1,000 currently)
- Horizontal scaling enabled
- Real-time sync across instances

### **Reliability**
- Session consistency: 99.9%
- No double-bookings
- Instant logout

### **Resource Utilization**
- Database CPU: ↓ 40%
- Memory: +200MB (Redis)
- Network: ↓ 35%

---

## ⚠️ Risk Mitigation

| Risk | Mitigation | Priority |
|------|-----------|----------|
| Redis unavailable | Graceful degradation (already in code) | HIGH |
| Cache staleness | Implement TTL strategy | HIGH |
| Memory overflow | Auto-eviction + cleanup jobs | MEDIUM |
| Complex invalidation | Use cache tagging system | MEDIUM |
| Data inconsistency | Validation layer | LOW |

---

## 📋 Quick Reference: Feature by Feature

### **Feature 1: Session Caching**
- Duration: 1 day
- Complexity: ⭐ (Easy)
- Performance gain: 90% faster auth

### **Feature 2: Listing Search**
- Duration: 2 days
- Complexity: ⭐⭐ (Medium)
- Performance gain: 80% faster searches

### **Feature 3: User Profiles**
- Duration: 1 day
- Complexity: ⭐ (Easy)
- Performance gain: 70% faster profile loads

### **Feature 4: Real-Time Notifications**
- Duration: 2 days
- Complexity: ⭐⭐⭐ (Hard)
- Performance gain: Instant updates

### **Feature 5: Booking Availability**
- Duration: 1 day
- Complexity: ⭐⭐ (Medium)
- Performance gain: 99% reduction in double-bookings

---

## 🚀 Next Steps

1. **Review this plan** - Confirm Phase 1-2 are approved
2. **Setup .env** - Add REDIS_URL if not present
3. **Create redis.service.js** - Core service layer
4. **Implement cache middleware** - Universal caching
5. **Update controllers** - Phase by phase
6. **Add real-time features** - Socket.io + Redis
7. **Monitor & optimize** - Hit/miss ratios, memory usage

---

## ❓ Questions to Clarify

1. **Redis Setup:** Local Redis or cloud (Redis Cloud, AWS ElastiCache)?
2. **Budget:** Any constraints on Redis instance size?
3. **Scale Target:** How many concurrent users in 6 months?
4. **Real-time Priority:** How important are live notifications?
5. **Data Retention:** How long to keep cached data?

---

## 📞 Ready to Implement?

Would you like me to start with **Phase 1** (Session Management + Token Blacklist)?

This will give you:
- ✅ Instant logout capability
- ✅ 90% faster authentication
- ✅ Foundation for Phase 2

**Ready? → Reply `yes` to start Phase 1 implementation**
