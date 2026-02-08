import { Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import MainLayout from './layouts/MainLayout';
import Toast from './components/Toast.jsx';
// SkipNavigation removed — skip link hidden/caused layout issues
import BottomNavigation from './components/BottomNavigation.jsx';
import WebVitalsDashboard from './components/WebVitalsDashboard.jsx';
import AirbnbHome from '../src/pages/AirbnbHome.jsx';

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
            {/* SkipNavigation removed per UX cleanup */}
            <Toast />
            <WebVitalsDashboard />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<AirbnbHome />} />
                  <Route path="/search" element={<SearchResult />} />
                  <Route path="/advanced-search" element={<AdvancedSearch />} />
                  <Route path="/listing/:id" element={<ListingDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/create-listing" element={<CreateListing />} />
                  <Route path="/reviews" element={<Reviews />} />
                  <Route path="/notifications" element={<NotificationCenter />} />
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
