import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PostProperty from './pages/PostProperty';
import MyListings from './pages/MyListings';
import Favorites from './pages/Favorites';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/post-property"
          element={
            <ProtectedRoute>
              <PostProperty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-listings"
          element={
            <ProtectedRoute>
              <MyListings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
