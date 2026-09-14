import { Link } from 'react-router-dom';

const formatPrice = (price) => {
  if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Crore`;
  if (price >= 100000) return `${(price / 100000).toFixed(2)} Lakh`;
  return price.toLocaleString();
};

const PropertyCard = ({ property }) => {
  const { _id, title, price, priceUnit, city, area, category, listingType, bedrooms, bathrooms, areaSize, areaUnit, images } =
    property;

  return (
    <Link
      to={`/property/${_id}`}
      className="group block overflow-hidden border border-sand-200 bg-white transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-sand-400 hover:shadow-[0_14px_28px_rgba(43,36,32,0.09)]"
    >
      <div className="flex h-44 items-center justify-center overflow-hidden bg-sand-100">
        {images && images.length > 0 ? (
          <img src={images[0]} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm text-sand-600">No image</span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-600">
            {listingType === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          <span className="text-xs text-sand-600 capitalize">{category}</span>
        </div>

        <h3 className="font-display font-semibold text-ink truncate group-hover:text-brand-500">{title}</h3>
        <p className="mb-2 text-sm text-sand-600">
          {area}, {city}
        </p>

        <p className="mb-2 font-display text-xl font-semibold text-ink">
          PKR {formatPrice(price)}
          {priceUnit && <span className="font-sans text-sm font-normal text-sand-600"> /{priceUnit}</span>}
        </p>

        <div className="flex gap-3 border-t border-sand-200 pt-2 text-sm text-sand-600">
          {category !== 'plot' && (
            <>
              <span>{bedrooms ?? '-'} Beds</span>
              <span>{bathrooms ?? '-'} Baths</span>
            </>
          )}
          <span>
            {areaSize} {areaUnit}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
