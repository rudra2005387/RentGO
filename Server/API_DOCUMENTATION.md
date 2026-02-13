# Complete API Routes Documentation

## Base URL
```
http://localhost:5000/api
```

---

## 📋 Table of Contents
- [Authentication Routes](#authentication-routes)
- [User Routes (Option A)](#user-routes-option-a)
- [Listing Routes (Option B)](#listing-routes-option-b)
- [Booking Routes (Option C)](#booking-routes-option-c)

---

## Authentication Routes

### 1. Register New User
**Endpoint:** `POST /auth/register`

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890",
  "role": "guest"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login
**Endpoint:** `POST /auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Current User
**Endpoint:** `GET /auth/me`  
**Auth Required:** ✅ Bearer Token

### 4. Logout
**Endpoint:** `POST /auth/logout`  
**Auth Required:** ✅ Bearer Token

### 5. Change Password
**Endpoint:** `POST /auth/change-password`  
**Auth Required:** ✅ Bearer Token

**Request:**
```json
{
  "currentPassword": "SecurePass123",
  "newPassword": "NewSecurePass456"
}
```

### 6. Forgot Password
**Endpoint:** `POST /auth/forgot-password`

**Request:**
```json
{
  "email": "john@example.com"
}
```

### 7. Verify Email
**Endpoint:** `POST /auth/verify-email`

**Request:**
```json
{
  "token": "verification_token_here"
}
```

### 8. Refresh Token
**Endpoint:** `POST /auth/refresh-token`

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

---

## User Routes (Option A)

### Get User Profile (Public)
**Endpoint:** `GET /users/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "guest",
      "profileImage": "https://...",
      "bio": "Love traveling!",
      "stats": {
        "totalRatings": 15,
        "averageRating": 4.8,
        "totalReviews": 15
      }
    }
  }
}
```

### Update User Profile
**Endpoint:** `PUT /users/:id`  
**Auth Required:** ✅ Bearer Token (Must be same user)

**Request:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890",
  "bio": "Travel enthusiast",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001"
  },
  "preferences": {
    "notifications": {
      "email": true,
      "sms": true,
      "push": false
    },
    "currency": "USD",
    "language": "en"
  }
}
```

### Upload Profile Image
**Endpoint:** `POST /users/:id/profile-image`  
**Auth Required:** ✅ Bearer Token

**Request:**
```json
{
  "imageUrl": "https://example.com/image.jpg"
}
```

### Get User Statistics
**Endpoint:** `GET /users/:id/stats`

**Response (Host):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "userId": "507f1f77bcf86cd799439011",
      "role": "host",
      "firstName": "John",
      "lastName": "Doe",
      "totalListings": 5,
      "completedBookings": 32,
      "totalEarnings": 15000,
      "superhost": true,
      "responseRate": 98,
      "averageRating": 4.8
    }
  }
}
```

### Get User Reviews
**Endpoint:** `GET /users/:id/reviews?page=1&limit=10&type=guest_to_host`

**Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "_id": "...",
        "author": {
          "firstName": "Alice",
          "lastName": "Smith",
          "profileImage": "..."
        },
        "overallRating": 5,
        "comment": "Excellent host!",
        "ratings": {
          "cleanliness": 5,
          "communication": 5,
          "checkin": 5
        },
        "createdAt": "2026-02-12T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2,
      "hasNextPage": true
    }
  }
}
```

### Get User Listings
**Endpoint:** `GET /users/:id/listings?page=1&limit=10&status=published`

**Response:**
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "_id": "...",
        "title": "Beautiful Apartment in Downtown",
        "location": {
          "city": "New York",
          "address": "123 Main St"
        },
        "pricing": {
          "basePrice": 120,
          "currency": "USD"
        },
        "status": "published",
        "totalBookings": 25,
        "averageRating": 4.8
      }
    ],
    "pagination": { ... }
  }
}
```

### Get User Bookings
**Endpoint:** `GET /users/:id/bookings?page=1&limit=10&status=confirmed`  
**Auth Required:** ✅ Bearer Token (Must be same user or admin)

### Get User Wishlist
**Endpoint:** `GET /users/:id/wishlist?page=1&limit=10`  
**Auth Required:** ✅ Bearer Token

**Response:**
```json
{
  "success": true,
  "data": {
    "wishlist": [
      {
        "_id": "...",
        "title": "Cozy Studio",
        "location": {
          "city": "Paris",
          "address": "..."
        },
        "pricing": {
          "basePrice": 85
        }
      }
    ],
    "pagination": { ... }
  }
}
```

### Add to Wishlist
**Endpoint:** `POST /users/:id/wishlist`  
**Auth Required:** ✅ Bearer Token

**Request:**
```json
{
  "listingId": "507f1f77bcf86cd799439011"
}
```

### Remove from Wishlist
**Endpoint:** `DELETE /users/:id/wishlist/:listingId`  
**Auth Required:** ✅ Bearer Token

### Switch Role
**Endpoint:** `POST /users/:id/switch-role`  
**Auth Required:** ✅ Bearer Token

**Request:**
```json
{
  "newRole": "host"
}
```

### Deactivate Account
**Endpoint:** `POST /users/:id/deactivate`  
**Auth Required:** ✅ Bearer Token

---

## Listing Routes (Option B)

### Get All Listings (Search & Filter)
**Endpoint:** `GET /listings?page=1&limit=12&search=apartment&city=NewYork&propertyType=apartment&minPrice=50&maxPrice=300&guests=2&checkInDate=2026-02-15&checkOutDate=2026-02-20&rating=4&sortBy=newest`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 12)
- `search` - Search by title or description
- `city` - Filter by city
- `propertyType` - apartment, house, condo, etc.
- `minPrice` - Minimum nightly price
- `maxPrice` - Maximum nightly price
- `guests` - Number of guests
- `checkInDate` - Check-in date (YYYY-MM-DD)
- `checkOutDate` - Check-out date (YYYY-MM-DD)
- `rating` - Minimum rating (1-5)
- `sortBy` - newest, price_low, price_high, rating, popular

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "listings": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Modern Apartment Downtown",
        "description": "Beautiful modern apartment...",
        "location": {
          "city": "New York",
          "address": "123 Main St",
          "latitude": 40.7128,
          "longitude": -74.0060
        },
        "propertyType": "apartment",
        "guests": 4,
        "bedrooms": 2,
        "beds": 3,
        "bathrooms": 1.5,
        "pricing": {
          "basePrice": 150,
          "currency": "USD"
        },
        "images": [
          {
            "url": "https://...",
            "isCover": true
          }
        ],
        "amenities": {
          "basics": {
            "wifi": true,
            "kitchen": true
          }
        },
        "status": "published",
        "averageRating": 4.8,
        "totalReviews": 25
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 150,
      "totalPages": 13,
      "hasNextPage": true
    }
  }
}
```

### Get Trending Listings
**Endpoint:** `GET /listings/trending?limit=10`

### Get Featured Listings
**Endpoint:** `GET /listings/featured?limit=10`

### Get Single Listing Details
**Endpoint:** `GET /listings/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "listing": {
      "_id": "...",
      "title": "Modern Apartment Downtown",
      "description": "...",
      "host": {
        "_id": "...",
        "firstName": "John",
        "lastName": "Doe",
        "profileImage": "...",
        "hostInfo": {
          "superhost": true,
          "responseRate": 98
        },
        "stats": {
          "averageRating": 4.8,
          "totalReviews": 45
        }
      },
      "location": { ... },
      "pricing": { ... },
      "amenities": { ... },
      "images": [ ... ]
    },
    "reviews": [
      {
        "overallRating": 5,
        "comment": "Amazing place!",
        "author": {
          "firstName": "Alice",
          "lastName": "Smith"
        }
      }
    ],
    "reviewCount": 25
  }
}
```

### Create New Listing (Host Only)
**Endpoint:** `POST /listings`  
**Auth Required:** ✅ Bearer Token (Host role required)

**Request:**
```json
{
  "title": "Cozy Apartment in Downtown",
  "description": "Beautiful 2-bedroom apartment with amazing city views...",
  "propertyType": "apartment",
  "roomType": "entire_place",
  "guests": 4,
  "bedrooms": 2,
  "beds": 3,
  "bathrooms": 1.5,
  "location": {
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "zipCode": "10001",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "pricing": {
    "basePrice": 150,
    "currency": "USD",
    "cleaningFee": 50,
    "serviceFee": 20,
    "weeklyDiscount": 10,
    "monthlyDiscount": 15
  },
  "amenities": {
    "basics": {
      "wifi": true,
      "airConditioning": true,
      "heating": true,
      "kitchen": true,
      "parking": false
    },
    "features": {
      "pool": false,
      "hotTub": false,
      "gym": true,
      "washer": true,
      "dryer": true,
      "tv": true,
      "workSpace": true,
      "petFriendly": false
    },
    "safety": {
      "smokeDetector": true,
      "fireExtinguisher": true,
      "firstAidKit": true,
      "lockOnBedroomDoor": true
    }
  },
  "bookingRules": {
    "instantBooking": false,
    "requiresApproval": true,
    "allowPets": false,
    "allowSmoking": false,
    "allowPartiesEvents": false,
    "cancellationPolicy": "moderate"
  },
  "tags": ["downtown", "modern", "wifi"]
}
```

### Update Listing
**Endpoint:** `PUT /listings/:id`  
**Auth Required:** ✅ Bearer Token (Host only)

**Request:** (Any fields from create request)

### Upload Listing Images
**Endpoint:** `POST /listings/:id/images`  
**Auth Required:** ✅ Bearer Token (Host only)

**Request:**
```json
{
  "imageUrls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "isCover": true
}
```

### Delete Listing Image
**Endpoint:** `DELETE /listings/:id/images/:imageIndex`  
**Auth Required:** ✅ Bearer Token (Host only)

### Get Availability Calendar
**Endpoint:** `GET /listings/:id/availability?startDate=2026-02-15&endDate=2026-03-15`

**Response:**
```json
{
  "success": true,
  "data": {
    "listing": {
      "id": "...",
      "title": "Modern Apartment",
      "minimumStay": 1,
      "maximumStay": 30
    },
    "bookedDates": [
      {
        "checkInDate": "2026-02-15",
        "checkOutDate": "2026-02-19"
      }
    ],
    "unavailableDates": [
      {
        "checkInDate": "2026-02-20",
        "checkOutDate": "2026-02-22"
      }
    ]
  }
}
```

### Set Availability
**Endpoint:** `POST /listings/:id/availability`  
**Auth Required:** ✅ Bearer Token (Host only)

**Request:**
```json
{
  "startDate": "2026-03-01",
  "endDate": "2026-03-10",
  "available": false
}
```

### Publish Listing
**Endpoint:** `POST /listings/:id/publish`  
**Auth Required:** ✅ Bearer Token (Host only)

### Archive Listing
**Endpoint:** `POST /listings/:id/archive`  
**Auth Required:** ✅ Bearer Token (Host only)

### Delete Listing
**Endpoint:** `DELETE /listings/:id`  
**Auth Required:** ✅ Bearer Token (Host only)

---

## Booking Routes (Option C)

### Create Booking
**Endpoint:** `POST /bookings`  
**Auth Required:** ✅ Bearer Token

**Request:**
```json
{
  "listingId": "507f1f77bcf86cd799439011",
  "checkInDate": "2026-02-20",
  "checkOutDate": "2026-02-23",
  "numberOfGuests": 2,
  "specialRequests": "High floor preferred, prefer morning check-in"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "_id": "507f1f77bcf86cd799439012",
      "listing": {
        "_id": "...",
        "title": "Modern Apartment",
        "images": [ ... ]
      },
      "guest": {
        "_id": "...",
        "firstName": "Alice",
        "lastName": "Smith",
        "email": "alice@example.com"
      },
      "host": {
        "_id": "...",
        "firstName": "John",
        "lastName": "Doe"
      },
      "checkInDate": "2026-02-20",
      "checkOutDate": "2026-02-23",
      "numberOfNights": 3,
      "numberOfGuests": 2,
      "pricing": {
        "nightly_rate": 150,
        "subtotal": 450,
        "cleaningFee": 50,
        "serviceFee": 20,
        "discount": 0,
        "taxes": 52,
        "total": 572,
        "currency": "USD"
      },
      "status": "pending",
      "paymentStatus": "pending",
      "createdAt": "2026-02-12T10:30:00Z"
    },
    "bookingReference": "BK-ABC12345"
  }
}
```

### Get All Bookings
**Endpoint:** `GET /bookings?page=1&limit=10&role=guest&status=confirmed`  
**Auth Required:** ✅ Bearer Token

**Query Parameters:**
- `page` - Page number
- `limit` - Results per page
- `role` - 'guest', 'host', or both
- `status` - pending, confirmed, completed, cancelled

### Get Booking Details
**Endpoint:** `GET /bookings/:id`  
**Auth Required:** ✅ Bearer Token

### Update Booking Status (Host)
**Endpoint:** `PUT /bookings/:id/status`  
**Auth Required:** ✅ Bearer Token (Host only)

**Request:**
```json
{
  "status": "confirmed",
  "rejectionReason": "(optional, if rejecting)"
}
```

### Update Payment Status
**Endpoint:** `PUT /bookings/:id/payment`  
**Auth Required:** ✅ Bearer Token

**Request:**
```json
{
  "paymentStatus": "paid",
  "paymentMethod": "credit_card",
  "transactionId": "stripe_tx_12345"
}
```

### Cancel Booking (Guest)
**Endpoint:** `POST /bookings/:id/cancel`  
**Auth Required:** ✅ Bearer Token (Guest only)

**Request:**
```json
{
  "reason": "Plans changed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking": { ... },
    "refund": {
      "amount": 450,
      "percentage": 100,
      "policy": "moderate"
    }
  }
}
```

### Mark Booking as Completed
**Endpoint:** `POST /bookings/:id/complete`  
**Auth Required:** ✅ Bearer Token (Host only)

### Send Booking Message
**Endpoint:** `POST /bookings/:id/messages`  
**Auth Required:** ✅ Bearer Token

**Request:**
```json
{
  "message": "Can I check in early?"
}
```

### Get Booking Messages
**Endpoint:** `GET /bookings/:id/messages`  
**Auth Required:** ✅ Bearer Token

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "sender": {
          "_id": "...",
          "firstName": "Alice",
          "lastName": "Smith",
          "profileImage": "..."
        },
        "message": "Can I check in early?",
        "createdAt": "2026-02-12T10:30:00Z"
      }
    ]
  }
}
```

### Get Booking Statistics
**Endpoint:** `GET /bookings/stats`  
**Auth Required:** ✅ Bearer Token

**Response:**
```json
{
  "success": true,
  "data": {
    "host": [
      {
        "_id": "confirmed",
        "count": 25,
        "totalRevenue": 18750
      },
      {
        "_id": "pending",
        "count": 3,
        "totalRevenue": 1200
      }
    ],
    "guest": [
      {
        "_id": "completed",
        "count": 8
      },
      {
        "_id": "confirmed",
        "count": 2
      }
    ]
  }
}
```

---

## Error Responses

All error responses follow this format:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No authentication token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Authentication

All protected endpoints require a bearer token in the header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Roles
- **guest** - Can book listings, leave reviews, manage wishlist
- **host** - Can create/manage listings, accept/reject bookings
- **admin** - Full access to all resources

---

## Rate Limiting

- **Global**: 100 requests per 15 minutes per IP
- **Login**: 5 failed attempts = 30 minutes lockout
- **General API**: Standard rate limits apply

---

## Testing with Postman

1. Import all endpoints from this documentation
2. Set up Environment Variables:
   - `baseURL` = http://localhost:5000/api
   - `token` = (set after login)
3. Use pre-request scripts to attach auth headers
4. Test each endpoint systematically

---

## Deployment Notes

For production deployment:
- Change `JWT_SECRET` to a strong random string
- Enable HTTPS only
- Set `NODE_ENV=production`
- Configure CORS with specific domains
- Enable request logging
- Set up monitoring and alerts
