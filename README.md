# RentGo

A full-stack Airbnb-style property rental platform with interactive map search, Stripe payments, real-time messaging, and a complete review system.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React 19  +  Vite 7  +  Tailwind CSS v4               │
│  (client/)                                              │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Auth &  │ │ Listings │ │ Bookings │ │ Chat &     │  │
│  │ Profile │ │ & Search │ │ & Pay    │ │ Notifs     │  │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └─────┬──────┘  │
│       │           │            │              │         │
│       └───────────┴────────────┴──────────────┘         │
│                        │ Axios / Socket.io               │
└────────────────────────┼────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│  Express 4.18  (Server/)                                │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Auth     │ │ Listing │ │ Booking  │ │ Review     │  │
│  │ Routes   │ │ Routes  │ │ Routes   │ │ Routes     │  │
│  └──────────┘ └─────────┘ └──────────┘ └────────────┘  │
│  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌────────────┐  │
│  │ Payment  │ │ Admin   │ │ User     │ │ Middleware  │  │
│  │ Routes   │ │ Routes  │ │ Routes   │ │ (JWT/Rate) │  │
│  └──────────┘ └─────────┘ └──────────┘ └────────────┘  │
│                        │                                │
│  MongoDB  ·  Redis  ·  Cloudinary  ·  Stripe            │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend (`client/`)
| | |
|---|---|
| React 19.2 | UI framework |
| Vite 7 | Build tool |
| Tailwind CSS v4 | Styling |
| React Router 7.13 | Routing (lazy code splitting) |
| Framer Motion 12 | Animations |
| Leaflet + React Leaflet | Interactive maps |
| Socket.io Client | Real-time messaging |
| Axios | HTTP client |
| React Hook Form | Form handling |

### Backend (`Server/`)
| | |
|---|---|
| Express 4.18 | Web framework |
| Mongoose 7.5 | MongoDB ODM |
| JWT | Authentication |
| Stripe | Payment processing |
| Cloudinary | Image uploads |
| Redis (ioredis) | Response caching |
| Nodemailer | Email notifications |
| Multer | File upload handling |

---

## Quick Start

### 1. Clone & install
```bash
# Backend
cd Server
npm install
cp .env.example .env   # Configure MongoDB URI, JWT_SECRET, etc.

# Frontend
cd ../client
npm install
cp .env.example .env   # Configure VITE_API_URL, VITE_SOCKET_URL
```

### 2. Environment variables

**Server `.env`**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/rentgo
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Client `.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### 3. Seed sample data (optional)
```bash
cd Server
node seed.js
```

### 4. Run
```bash
# Terminal 1 — Backend
cd Server
npm run dev        # http://localhost:5000

# Terminal 2 — Frontend
cd client
npm run dev        # http://localhost:5173
```

---

## Features

### Authentication & Users
- JWT login/register with token refresh
- Profile management & image upload
- Role switching (guest ↔ host)
- Wishlist management
- Account deactivation & password reset

### Property Listings
- Multi-step listing creation wizard
- Image gallery with lightbox & swipeable mobile view
- Category filtering & horizontal scroll
- Advanced search (location, dates, guests, price, type, amenities, rating)
- Trending & featured sections

### Map Search
- Grid/map toggle on search results
- Leaflet map with custom price-pin markers
- Popup cards with listing preview
- Viewport-based fetching with debounce
- GeoJSON coordinate support (2dsphere index)

### Booking & Payments
- Date range picker with availability calendar
- Dynamic pricing with price breakdown
- Stripe Checkout payment flow
- Booking lifecycle (pending → confirmed → completed → cancelled)
- Cancellation with refund calculation
- Guest dashboard with booking history

### Reviews
- Star rating (overall + category: cleanliness, communication, location, value)
- Review submission with modal form
- Rating breakdown bars
- Host responses & helpful voting
- Review prompts for completed bookings

### Real-Time Chat
- Split-pane messaging interface
- Socket.io real-time delivery
- REST persistence for history
- Per-booking & direct messaging

### Notifications
- Full notification center with All/Unread tabs
- Mark-read / mark-all-read
- Type-based icons (booking, payment, review, message, system)
- Navbar bell badge with 30s polling

### Host Dashboard
- Listing management (create, edit, publish, archive)
- Earnings overview & statistics
- Booking management & approvals

---

## API Overview

**47 endpoints** across 7 route groups:

| Group | Base Path | Key Operations |
|-------|-----------|---------------|
| Auth | `/api/auth` | Register, login, logout, refresh, verify email, change/forgot password |
| Users | `/api/users` | Profile CRUD, wishlist, stats, role switch, image upload |
| Listings | `/api/listings` | CRUD, search/filter, images, publish/archive, availability |
| Bookings | `/api/bookings` | Create, status changes, cancel, complete, in-booking messages |
| Reviews | `/api/reviews` | Create, list, host response, helpful vote |
| Payments | `/api/payments` | Stripe checkout, webhooks, payment status |
| Admin | `/api/admin` | User/listing/booking management, platform stats |

Full API reference: [Server/API_DOCUMENTATION.md](Server/API_DOCUMENTATION.md)

---

## Frontend Routes

| Path | Description |
|------|-------------|
| `/` | Landing page — categories, trending, featured |
| `/login` | Sign in |
| `/register` | Create account |
| `/search` | Search results (grid/map toggle, filters, sorting) |
| `/listing/:id` | Property details, gallery, booking, reviews |
| `/dashboard` | Guest dashboard (bookings, wishlist, reviews) |
| `/host/dashboard` | Host dashboard (listings, earnings) |
| `/create-listing` | Listing creation wizard |
| `/booking-confirmation/:bookingId` | Post-payment confirmation |
| `/booking/:bookingId` | Booking details |
| `/payment/:bookingId` | Stripe checkout |
| `/messages` | Real-time messaging |
| `/notifications` | Notification center |
| `/profile` | User profile & settings |

---

## Database Models

| Model | Key Fields |
|-------|-----------|
| **User** | name, email, password (bcrypt), role (guest/host/admin), wishlist, stats |
| **Listing** | title, description, type, price, location (GeoJSON), images, amenities, availability |
| **Booking** | listing, guest, host, dates, totalPrice, status, payment, messages |
| **Review** | author, listing, booking, ratings (overall + categories), comment, hostResponse |
| **Payment** | booking, user, amount, method, stripeSessionId, status |

---

## Project Structure

```
RentGo/
├── README.md                  ← This file
├── client/                    ← React frontend
│   ├── README.md              ← Frontend documentation
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx            # Routes & providers
│       ├── pages/             # 19 page components
│       ├── components/        # 30+ UI components
│       ├── context/           # Auth, Theme, Toast, Notification
│       ├── hooks/             # useAuth, useSocket, useNotification
│       ├── services/          # API service layers
│       ├── layouts/           # MainLayout
│       └── utils/             # Helpers & utilities
│
└── Server/                    ← Express backend
    ├── README.md              ← Backend documentation
    ├── API_DOCUMENTATION.md   ← Full API reference
    ├── QUICK_START.md         ← Setup guide
    ├── package.json
    ├── index.js               # Entry point
    ├── seed.js                # Sample data seeder
    └── src/
        ├── app.js             # Express app config
        ├── config/            # DB, Redis, Cloudinary, Stripe
        ├── controllers/       # Route handlers (7 controllers)
        ├── middleware/         # Auth, cache, error, upload, rate limit
        ├── models/            # Mongoose schemas (5 models)
        ├── routes/            # API route definitions
        └── utils/             # Helpers & utilities
```

---

## Implementation Status

| Phase | Status | Scope |
|-------|--------|-------|
| Phase 1 | **Complete** | Core UI, auth, landing page, profile, dashboard, listing creation, theme, toasts |
| Phase 2 | **Complete** | Search with filters, booking flow, confirmation, booking detail, wishlist, SearchBar |
| Phase 3 | **Complete** | Map search (Leaflet), review system, Stripe payments, real-time chat (Socket.io), notifications |
| Backend | **Complete** | 47 API endpoints, 5 models, JWT auth, Redis caching, Stripe, Cloudinary, rate limiting |
