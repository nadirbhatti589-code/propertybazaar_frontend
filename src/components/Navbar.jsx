import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-primary-600">
          PropertyBazaar
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-gray-700 hover:text-primary-600">
            Browse
          </Link>

          {user ? (
            <>
              <Link to="/post-property" className="text-sm text-gray-700 hover:text-primary-600">
                Post Property
              </Link>
              <Link to="/my-listings" className="text-sm text-gray-700 hover:text-primary-600">
                My Listings
              </Link>
              <Link to="/favorites" className="text-sm text-gray-700 hover:text-primary-600">
                Favorites
              </Link>
              <span className="text-sm text-gray-500 hidden sm:inline">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-700 hover:text-primary-600">
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
