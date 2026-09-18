import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import { formatPrice, formatArea } from '../utils/areaConverter';

const PropertyCard = ({ property }) => {
  const {
    _id,
    title,
    price,
    priceUnit,
    city,
    area,
    category,
    listingType,
    bedrooms,
    bathrooms,
    areaSize,
    areaUnit,
    images,
    isFeatured,
    isVerified,
    possessionStatus,
    isFurnished,
    isCornerPlot,
  } = property;

  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare } = useCompare();

  const favorited = isFavorite(_id);
  const compared = isInCompare(_id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(_id);
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompare(property);
  };

  const coverUrl =
    images && images.length > 0
      ? typeof images[0] === 'string'
        ? images[0]
        : images[0].url
      : null;

  return (
    <div className="group relative flex flex-col overflow-hidden border border-sand-200 bg-white transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-1 hover:border-sand-400 hover:shadow-[0_16px_32px_rgba(43,36,32,0.10)]">
      {/* Top Media Container */}
      <Link to={`/property/${_id}`} className="relative block h-48 overflow-hidden bg-sand-100">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-sand-500">
            No image preview
          </div>
        )}

        {/* Top Badges (Left) */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
          {isFeatured && (
            <span className="rounded bg-gold-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink shadow-sm">
              ★ Featured
            </span>
          )}
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm ${
              listingType === 'rent'
                ? 'bg-ink text-white'
                : 'bg-brand-600 text-white'
            }`}
          >
            {listingType === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          {isVerified && (
            <span className="rounded bg-teal-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              ✓ Verified
            </span>
          )}
        </div>

        {/* Favorite Heart Button (Top Right) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className={`absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition-transform hover:scale-110 active:scale-95 ${
            favorited ? 'text-brand-600' : 'text-sand-400 hover:text-brand-500'
          }`}
          title={favorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 fill-current"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={favorited ? '0' : '2'}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Bottom image overlay badges (Possession / Corner) */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 z-10 pointer-events-none">
          {possessionStatus === 'ready' && (
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
              Ready to Move
            </span>
          )}
          {possessionStatus === 'under_construction' && (
            <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-gold-300 backdrop-blur">
              Under Construction
            </span>
          )}
          {isCornerPlot && (
            <span className="rounded bg-teal-800/80 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
              Corner Plot
            </span>
          )}
        </div>
      </Link>

      {/* Details Container */}
      <div className="flex flex-1 flex-col p-4">
        {/* Category & Location */}
        <div className="mb-1 flex items-center justify-between text-xs text-sand-600">
          <span className="capitalize font-medium text-teal-700">{category}</span>
          <span className="truncate max-w-[65%] text-right">{city}</span>
        </div>

        {/* Title */}
        <Link to={`/property/${_id}`}>
          <h3 className="font-display font-semibold text-ink line-clamp-1 group-hover:text-brand-600 transition-colors">
            {title}
          </h3>
        </Link>
        <p className="mb-2 text-xs text-sand-500 truncate">
          {area}, {city}
        </p>

        {/* Price in PKR with Lakh / Crore notation */}
        <div className="mb-3">
          <p className="font-display text-lg font-bold text-ink">
            PKR {formatPrice(price)}
            {priceUnit && (
              <span className="font-sans text-xs font-normal text-sand-600">
                {' '}/{priceUnit}
              </span>
            )}
          </p>
        </div>

        {/* Key Specs Bar (Beds, Baths, Area) */}
        <div className="mt-auto flex items-center gap-3 border-t border-sand-200 pt-2.5 text-xs text-sand-700">
          {category !== 'plot' && (
            <>
              <span>{bedrooms ?? '-'} Beds</span>
              <span>•</span>
              <span>{bathrooms ?? '-'} Baths</span>
              <span>•</span>
            </>
          )}
          <span className="font-medium text-ink">
            {formatArea(areaSize, areaUnit)}
          </span>
          {isFurnished && isFurnished !== 'unfurnished' && (
            <>
              <span>•</span>
              <span className="capitalize text-teal-700">{isFurnished.replace('_', ' ')}</span>
            </>
          )}
        </div>

        {/* Compare Checkbox Footer */}
        <div className="mt-2.5 flex items-center justify-between border-t border-dashed border-sand-200 pt-2 text-xs">
          <label
            onClick={handleCompareClick}
            className="flex items-center gap-1.5 cursor-pointer text-sand-600 hover:text-brand-600 transition-colors"
          >
            <input
              type="checkbox"
              checked={compared}
              onChange={() => {}} // handled by parent onClick
              className="h-3.5 w-3.5 rounded border-sand-300 text-brand-600 focus:ring-brand-500"
            />
            <span>{compared ? 'In Compare' : 'Add to Compare'}</span>
          </label>

          <Link
            to={`/property/${_id}`}
            className="font-medium text-brand-600 hover:text-brand-700 hover:underline"
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
