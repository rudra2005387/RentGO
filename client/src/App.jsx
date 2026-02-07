import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
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
import NotFound from '../src/pages/NotFound.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
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
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
