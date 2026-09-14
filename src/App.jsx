import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import PropertyDetail from './pages/PropertyDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PostProperty from './pages/PostProperty';
import MyListings from './pages/MyListings';
import Favorites from './pages/Favorites';
import AgentVerification from './pages/AgentVerification';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />

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
        <Route
          path="/agent-verification"
          element={
            <ProtectedRoute>
              <AgentVerification />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
