import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600">
        Error 404
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-ink">
        Page not found
      </h1>
      <p className="mt-3 text-sm leading-6 text-sand-600">
        The page you are looking for does not exist, may have been moved, or the link is
        broken.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link to="/" className="btn-primary text-sm">
          Browse Properties
        </Link>
        <Link to="/" className="btn-secondary text-sm">
          Go Home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;