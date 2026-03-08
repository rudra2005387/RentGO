# RentGo — Frontend Client

A modern Airbnb-style property rental platform built with **React 19**, **Vite 7**, and **Tailwind CSS v4**. Features lazy-loaded routes, interactive map search, a complete booking/payment flow, real-time messaging, and a full review system.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19.2 |
| Build Tool | Vite 7.x + Terser minification |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite` plugin) |
| Routing | React Router 7.13 (lazy-loaded code splitting) |
| Animations | Framer Motion 12.30 |
| Forms | React Hook Form 7.71 |
| Icons | React Icons 5.5 (Font Awesome 5 set) |
| HTTP | Axios 1.13 |
| Maps | Leaflet 1.9 + React Leaflet 5.0 |
| Real-Time | Socket.io Client 4.8 |
| Utilities | clsx |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Backend server running (see `Server/README.md`)

### Installation
```bash
cd client
npm install
```

### Environment Variables
Create a `.env` file in `client/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

### Development
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

---

## Project Structure

```
src/
├── App.jsx                    # Root routes & providers
├── main.jsx                   # Entry point
├── index.css                  # Tailwind import + global styles
│
├── pages/                     # Route-level page components
│   ├── AirbnbHome.jsx         # Landing page — category filter, trending, featured
│   ├── Login.jsx              # JWT login form
│   ├── Register.jsx           # Registration form
│   ├── Profile.jsx            # User profile & settings
│   ├── Dashboard.jsx          # Guest dashboard (bookings, wishlist, reviews)
│   ├── HostDashboard.jsx      # Host dashboard (listings, earnings, stats)
│   ├── CreateListing.jsx      # Multi-step listing creation wizard
│   ├── ListingDetails.jsx     # Property detail page + booking widget + reviews
│   ├── SearchResult.jsx       # Search results — grid/map toggle, filters, sorting
│   ├── AdvancedSearch.jsx     # Advanced search with extra filter options
│   ├── BookingConfirmation.jsx# Post-payment booking confirmation
│   ├── BookingDetail.jsx      # Individual booking details & messaging
│   ├── PaymentPage.jsx        # Stripe checkout with price breakdown
│   ├── MessagesPage.jsx       # Real-time messaging (split-pane chat)
│   ├── NotificationsPage.jsx  # Notification list with read/unread filtering
│   ├── Reviews.jsx            # Global reviews page
│   ├── Services.jsx           # Services/categories listing
│   ├── Experiences.jsx        # Experiences listing
│   └── NotFound.jsx           # 404 page
│
├── components/
│   ├── navbar/
│   │   └── AirbnbStyleNavbar.jsx  # Fixed navbar — logo, search, bell, messages, user menu
│   ├── SearchBar/                 # Pill-style search bar (location, dates, guests)
│   ├── CategoryFilter/            # Horizontal category scroll
│   ├── PropertyCard/              # Listing card (grid view)
│   ├── MapView.jsx                # Leaflet map with price pins & popups
│   ├── PricePin.jsx               # Map marker label factory
│   ├── StarRating.jsx             # Interactive/read-only star rating
│   ├── ReviewForm.jsx             # Review submission modal (category ratings)
│   ├── ReviewList.jsx             # Review display with breakdown & host responses
│   ├── ChatWindow.jsx             # Message bubbles UI with auto-scroll
│   ├── BookingCalendar.jsx        # Date range picker for bookings
│   ├── CheckoutSummary.jsx        # Price breakdown widget
│   ├── HostInfo.jsx               # Host profile card
│   ├── PropertyGallery.jsx        # Image gallery with lightbox
│   ├── SwipeableGallery.jsx       # Touch-friendly swipeable gallery
│   ├── LazyImage.jsx              # Intersection observer lazy loading
│   ├── ResponsiveImage.jsx        # Responsive srcset images
│   ├── BottomNavigation.jsx       # Mobile bottom nav bar
│   ├── BottomSheet.jsx            # Mobile bottom sheet component
│   ├── MobileBookingSheet.jsx     # Mobile booking action sheet
│   ├── NotificationBell.jsx       # Notification icon with badge
│   ├── ProtectedRoute.jsx         # Auth guard wrapper
│   ├── Toast.jsx                  # Toast notification component
│   ├── SkipNavigation.jsx         # Accessibility skip link
│   ├── WebVitalsDashboard.jsx     # Core Web Vitals overlay (dev)
│   ├── filters/                   # Filter panel components
│   ├── modals/                    # Modal/dialog components
│   ├── pagination/                # Pagination controls
│   ├── booking/                   # Booking flow sub-components
│   ├── createListing/             # Listing creation step components
│   ├── dashboard/                 # Dashboard sub-components
│   ├── reviews/                   # Review sub-components
│   ├── search/                    # Search sub-components
│   ├── advancedSearch/            # Advanced search sub-components
│   └── ui/                        # Shared UI primitives
│
├── context/
│   ├── AuthContext.jsx            # JWT auth state & token management
│   ├── ThemeContext.jsx           # Light/dark theme toggle
│   ├── ToastContext.jsx           # Global toast notifications
│   └── NotificationContext.jsx    # Notification state
│
├── hooks/
│   ├── useAuth.js                 # Auth context consumer hook
│   ├── useNotification.js         # Notification context consumer hook
│   ├── usePerformance.js          # Performance monitoring hook
│   └── useSocket.js               # Socket.io connection manager
│
├── services/
│   ├── auth.service.js            # Auth API calls (login, register, etc.)
│   ├── booking.service.js         # Booking API calls
│   └── listing.service.js         # Listing API calls
│
├── layouts/
│   └── MainLayout.jsx             # Navbar + Outlet + padding
│
├── config/
│   └── designSystem.js            # Design tokens
│
├── styles/
│   ├── airbnb-design-system.css   # Custom design system CSS
│   └── consistency.css            # UI consistency overrides
│
└── utils/
    ├── accessibility.js           # A11y helpers
    ├── apiCache.js                # API response caching
    ├── formatDate.js              # Date formatting utilities
    ├── performance.js             # Performance utilities
    └── webVitals.js               # Core Web Vitals reporting
```

---

## Routes

| Path | Page | Auth | Description |
|------|------|------|-------------|
| `/` | AirbnbHome | Yes | Landing — categories, trending, featured listings |
| `/login` | Login | No | Sign in |
| `/register` | Register | No | Create account |
| `/search` | SearchResult | Yes | Search results with grid/map toggle & filters |
| `/advanced-search` | AdvancedSearch | Yes | Advanced search with extra filters |
| `/listing/:id` | ListingDetails | Yes | Property details, gallery, booking widget, reviews |
| `/profile` | Profile | Yes | User profile & settings |
| `/dashboard` | Dashboard | Yes | Guest dashboard (bookings, wishlist, reviews) |
| `/host/dashboard` | HostDashboard | Yes | Host dashboard (listings, earnings) |
| `/hosting` | HostDashboard | Yes | Alias for host dashboard |
| `/create-listing` | CreateListing | Yes | Multi-step listing creation |
| `/booking-confirmation/:bookingId` | BookingConfirmation | Yes | Post-payment confirmation |
| `/booking/:bookingId` | BookingDetail | Yes | Booking details & host messaging |
| `/payment/:bookingId` | PaymentPage | Yes | Stripe checkout page |
| `/messages` | MessagesPage | Yes | Real-time chat interface |
| `/notifications` | NotificationsPage | Yes | Notification center |
| `/reviews` | Reviews | Yes | Reviews page |
| `/services` | Services | Yes | Service categories |
| `/experiences` | Experiences | Yes | Experiences listing |
| `*` | NotFound | No | 404 page |

---

## Features by Phase

### Phase 1 — Core UI & Authentication
- JWT-based authentication (login, register, persist session)
- Protected route guard (`ProtectedRoute`)
- Airbnb-style landing page with category filter chips
- Responsive navbar with search, user menu, mobile hamburger
- User profile page with edit capability
- Guest dashboard skeleton (stats, bookings, wishlist tabs)
- Multi-step listing creation wizard
- 404 Not Found page
- Toast notification system
- Light/dark theme toggle
- Bottom navigation for mobile
- Lazy-loaded route-based code splitting

### Phase 2 — Booking System & Search
- **SearchResult** — full search page with:
  - Text search, location, date range, guest count
  - Price range, property type, amenity, rating filters
  - Sort by price, rating, newest
  - Pagination with URL-synced state
- **SearchBar** — pill-style Airbnb search bar (location → dates → guests)
- **ListingDetails** — complete property page:
  - Image gallery with lightbox & swipeable mobile view
  - Host info card, amenities grid, location description
  - Date picker booking widget with price breakdown
  - Reserve → create booking → redirect to payment
- **BookingConfirmation** — success page after payment
- **BookingDetail** — individual booking view with host messaging
- **Dashboard** enhancements:
  - Clickable booking rows linking to `/booking/:id`
  - Wishlist tab with toggle/remove
  - Real booking data from API
- **AirbnbHome** — working wishlist heart toggle on property cards

### Phase 3 — Map, Reviews, Payments, Chat & Notifications
- **Map Search** (Leaflet):
  - Grid/map toggle on search results
  - Interactive map with custom price-pin markers
  - Popup cards with listing preview
  - Viewport-based listing fetching with debounce
- **Review System**:
  - Star rating component (interactive + read-only)
  - Review submission modal with category ratings (cleanliness, communication, location, value)
  - Review list with rating breakdown bars, host responses, helpful button
  - Review prompts on dashboard for completed bookings
- **Stripe Payment**:
  - Payment page with booking summary & price breakdown
  - Stripe Checkout session redirect
  - Fallback to booking confirmation
- **Real-Time Chat** (Socket.io):
  - Split-pane messages page (conversation list + chat window)
  - Real-time message delivery via WebSocket
  - REST persistence for message history
  - Auto-scroll, Enter-to-send, mobile-responsive
  - `useSocket` hook for connection management
- **Notifications**:
  - Full notification page with All/Unread filter tabs
  - Mark-read / mark-all-read actions
  - Type-based icons (booking, payment, review, message, system)
  - Animated notification list
  - Navbar bell icon with unread count badge (polls every 30s)
  - Messages icon in navbar

---

## Key Patterns

- **Auth**: `useAuth()` hook → `{ user, token, logout }`; user ID via `user?._id || user?.id`
- **API Base**: `import.meta.env.VITE_API_URL || 'http://localhost:5000/api'`
- **Layout**: `MainLayout` wraps `AirbnbStyleNavbar` (fixed, h-20, z-50) + `<Outlet />` with `pt-20`
- **Icons**: FA5 only from `react-icons/fa` (no FA6 names)
- **Tailwind v4**: Entry is `@import "tailwindcss"` in `index.css`; CSS files using `@apply` need `@reference "tailwindcss"` at top
- **Code Splitting**: All pages except `AirbnbHome` are `lazy()` loaded with `<Suspense>` fallback
