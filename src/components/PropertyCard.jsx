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
      className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
        {images && images.length > 0 ? (
          <img src={images[0]} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">No image</span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs uppercase font-semibold text-primary-600">
            {listingType === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          <span className="text-xs text-gray-400 capitalize">{category}</span>
        </div>

        <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
        <p className="text-sm text-gray-500 mb-2">
          {area}, {city}
        </p>

        <p className="text-lg font-bold text-gray-900 mb-2">
          PKR {formatPrice(price)}
          {priceUnit && <span className="text-sm font-normal text-gray-500"> /{priceUnit}</span>}
        </p>

        <div className="flex gap-3 text-sm text-gray-600 border-t pt-2">
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
