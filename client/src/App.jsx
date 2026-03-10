import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import MainLayout from './layouts/MainLayout';
import Toast from './components/Toast.jsx';
// SkipNavigation removed — skip link hidden/caused layout issues
import BottomNavigation from './components/BottomNavigation.jsx';
import AirbnbHome from '../src/pages/AirbnbHome.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Lazy load pages for route-based code splitting
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const SearchResult = lazy(() => import('./pages/SearchResult.jsx'));
const ListingDetails = lazy(() => import('./pages/ListingDetails.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const CreateListing = lazy(() => import('./pages/CreateListing.jsx'));
const Reviews = lazy(() => import('./pages/Reviews.jsx'));
const AdvancedSearch = lazy(() => import('./pages/AdvancedSearch.jsx'));
const NotificationCenter = lazy(() => import('./pages/NotificationCenter.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const Services = lazy (() => import('./pages/Services.jsx'));
const Experiences = lazy(() => import('./pages/Experiences.jsx'));
const HostDashboard = lazy(() => import('./pages/HostDashboard.jsx'));
const BookingConfirmation = lazy(() => import('./pages/BookingConfirmation.jsx'));
const BookingDetail = lazy(() => import('./pages/BookingDetail.jsx'));
const PaymentPage = lazy(() => import('./pages/PaymentPage.jsx'));
const MessagesPage = lazy(() => import('./pages/MessagesPage.jsx'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage.jsx'));
const BecomeHost = lazy(() => import('./pages/BecomeHost.jsx'));

// Loading fallback component
function PageLoader() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
		</div>
	);
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <Toast />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  borderRadius: '16px',
                  background: '#fff',
                  color: '#222',
                  padding: '0',
                  boxShadow: '0 16px 48px rgba(0,0,0,.12), 0 4px 12px rgba(0,0,0,.06)',
                  border: '1px solid #f0f0f0',
                  maxWidth: '380px',
                },
                duration: 4000,
              }}
            />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected routes */}
                  <Route index element={<ProtectedRoute><AirbnbHome /></ProtectedRoute>} />
                  <Route path="/search" element={<ProtectedRoute><SearchResult /></ProtectedRoute>} />
                  <Route path="/advanced-search" element={<ProtectedRoute><AdvancedSearch /></ProtectedRoute>} />
                  <Route path="/listing/:id" element={<ProtectedRoute><ListingDetails /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
                  <Route path="/create-listing" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
                  <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                  <Route path="/experiences" element={<ProtectedRoute><Experiences /></ProtectedRoute>} />
                  <Route path="/host/dashboard" element={<ProtectedRoute><HostDashboard /></ProtectedRoute>} />
                  <Route path="/hosting" element={<ProtectedRoute><HostDashboard /></ProtectedRoute>} />
                  <Route path="/become-host" element={<ProtectedRoute><BecomeHost /></ProtectedRoute>} />
                  <Route path="/booking-confirmation/:bookingId" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
                  <Route path="/booking/:bookingId" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
                  <Route path="/payment/:bookingId" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
            <BottomNavigation />
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
