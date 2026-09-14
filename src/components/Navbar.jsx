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
    <nav className="sticky top-0 z-50 border-b border-sand-200 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="font-display text-xl font-semibold text-brand-500">
          Property<span className="text-teal-600">Bazaar</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <Link to="/" className="text-sm text-ink hover:text-brand-500">
            Browse
          </Link>

          {user ? (
            <>
              <Link to="/post-property" className="hidden text-sm text-ink hover:text-brand-500 sm:inline">
                Post Property
              </Link>
              <Link to="/my-listings" className="hidden text-sm text-ink hover:text-brand-500 md:inline">
                My Listings
              </Link>
              <Link to="/favorites" className="hidden text-sm text-ink hover:text-brand-500 sm:inline">
                Favorites
              </Link>
              <Link to="/agent-verification" className="hidden text-sm text-ink hover:text-brand-500 lg:inline">
                Become an Agent
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-sm font-medium text-teal-600 hover:text-teal-500">
                  Admin Panel
                </Link>
              )}
              <span className="hidden text-sm text-sand-600 xl:inline">Hi, {user.name.split(' ')[0]}</span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-sand-100 px-3 py-1.5 text-sm font-medium text-ink hover:bg-sand-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-ink hover:text-brand-500">
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
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
