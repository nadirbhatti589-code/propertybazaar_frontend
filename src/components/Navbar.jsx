import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { useFavorites } from '../context/FavoritesContext';
import { useMessages } from '../context/MessagesContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { compareProperties, clearCompare } = useCompare();
  const { favoriteIds } = useFavorites();
  const { unreadTotal } = useMessages();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-sand-200 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="font-display text-xl font-semibold text-brand-500" onClick={closeMenu}>
          Property<span className="text-teal-600">Bazaar</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop nav links */}
          <Link to="/" className="hidden text-sm text-ink hover:text-brand-500 md:inline">
            Browse
          </Link>

          {compareProperties.length > 0 && (
            <Link
              to="/compare"
              className="hidden items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-100 sm:flex"
              title="Compare selected properties"
            >
              <span>⚖️ Compare</span>
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">
                {compareProperties.length}
              </span>
            </Link>
          )}

          {user ? (
            <>
              <Link
                to="/post-property"
                className="hidden text-sm text-ink hover:text-brand-500 lg:inline"
              >
                Post Property
              </Link>
              <Link
                to="/my-listings"
                className="hidden text-sm text-ink hover:text-brand-500 lg:inline"
              >
                My Listings
              </Link>
              <Link
                to="/favorites"
                className="hidden items-center gap-1.5 text-sm text-ink hover:text-brand-500 sm:flex"
                title="View your favorites"
              >
                <span>Favorites</span>
                {favoriteIds.size > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
                    {favoriteIds.size}
                  </span>
                )}
              </Link>
              <Link
                to="/messages"
                className="hidden items-center gap-1.5 text-sm text-ink hover:text-brand-500 sm:flex"
                title="Messages & appointments"
              >
                <span>Messages</span>
                {unreadTotal > 0 && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
                    {unreadTotal}
                  </span>
                )}
              </Link>
              <Link
                to="/agent-verification"
                className="hidden text-sm text-ink hover:text-brand-500 xl:inline"
              >
                Become an Agent
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="hidden text-sm font-medium text-teal-600 hover:text-teal-500 lg:inline"
                >
                  Admin Panel
                </Link>
              )}
              <span className="hidden text-sm text-sand-600 xl:inline">
                Hi, {user.name.split(' ')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-md bg-sand-100 px-3 py-1.5 text-sm font-medium text-ink hover:bg-sand-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm text-ink hover:text-brand-500 sm:inline">
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

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-sand-300 text-ink md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="border-t border-sand-200 bg-paper md:hidden">
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-3">
            <Link
              to="/"
              onClick={closeMenu}
              className="block rounded px-3 py-2 text-sm text-ink hover:bg-sand-100"
            >
              Browse Properties
            </Link>

            {compareProperties.length > 0 && (
              <Link
                to="/compare"
                onClick={closeMenu}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm text-ink hover:bg-sand-100"
              >
                <span>⚖️ Compare</span>
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] text-white">
                  {compareProperties.length}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    clearCompare();
                  }}
                  className="ml-auto text-xs text-sand-500 hover:text-brand-600"
                >
                  Clear
                </button>
              </Link>
            )}

            {user ? (
              <>
                <Link
                  to="/post-property"
                  onClick={closeMenu}
                  className="block rounded px-3 py-2 text-sm text-ink hover:bg-sand-100"
                >
                  Post Property
                </Link>
                <Link
                  to="/my-listings"
                  onClick={closeMenu}
                  className="block rounded px-3 py-2 text-sm text-ink hover:bg-sand-100"
                >
                  My Listings
                </Link>
                <Link
                  to="/favorites"
                  onClick={closeMenu}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-ink hover:bg-sand-100"
                >
                  <span>Favorites</span>
                  {favoriteIds.size > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
                      {favoriteIds.size}
                    </span>
                  )}
                </Link>
                <Link
                  to="/messages"
                  onClick={closeMenu}
                  className="flex items-center gap-2 rounded px-3 py-2 text-sm text-ink hover:bg-sand-100"
                >
                  <span>Messages</span>
                  {unreadTotal > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] text-white">
                      {unreadTotal}
                    </span>
                  )}
                </Link>
                <Link
                  to="/agent-verification"
                  onClick={closeMenu}
                  className="block rounded px-3 py-2 text-sm text-ink hover:bg-sand-100"
                >
                  Become an Agent
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="block rounded px-3 py-2 text-sm font-medium text-teal-600 hover:bg-sand-100"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded px-3 py-2 text-left text-sm font-medium text-ink hover:bg-sand-100"
                >
                  Logout ({user.name.split(' ')[0]})
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="block rounded px-3 py-2 text-sm text-ink hover:bg-sand-100"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="block rounded bg-brand-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-brand-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;