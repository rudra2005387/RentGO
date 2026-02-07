import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import MainLayout from './layouts/MainLayout';
import Toast from './components/Toast.jsx';
import SkipNavigation from './components/SkipNavigation.jsx';
import BottomNavigation from './components/BottomNavigation.jsx';
import Home from '../src/pages/Home.jsx';
import Login from '../src/pages/Login.jsx';
import Register from '../src/pages/Register.jsx';
import SearchResult from '../src/pages/SearchResult.jsx';
import ListingDetails from '../src/pages/ListingDetails.jsx';
import Profile from '../src/pages/Profile.jsx';
import Dashboard from '../src/pages/Dashboard.jsx';
import CreateListing from '../src/pages/CreateListing.jsx';
import Reviews from '../src/pages/Reviews.jsx';
import AdvancedSearch from '../src/pages/AdvancedSearch.jsx';
import NotificationCenter from '../src/pages/NotificationCenter.jsx';
import NotFound from '../src/pages/NotFound.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <ToastProvider>
            <SkipNavigation />
            <Toast />
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
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
            <BottomNavigation />
          </ToastProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
