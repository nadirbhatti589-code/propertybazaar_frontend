import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { formatPrice, formatArea } from '../utils/areaConverter';

const Compare = () => {
  const { compareProperties, removeFromCompare, clearCompare } = useCompare();

  if (compareProperties.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16 text-center">
        <div className="border border-dashed border-sand-400 bg-sand-50/75 p-12">
          <span className="text-4xl">⚖️</span>
          <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
            No properties in comparison
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-sand-600">
            Browse through listings and check "Add to Compare" on up to 4 properties to view their features side-by-side.
          </p>
          <Link to="/" className="btn-primary mt-6 inline-block">
            Browse Properties
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
            Side-by-side evaluation
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Compare Properties ({compareProperties.length}/4)
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="rounded border border-sand-300 bg-white px-4 py-2 text-xs font-semibold text-sand-700 hover:bg-sand-100"
          >
            + Add Another Property
          </Link>
          <button
            type="button"
            onClick={clearCompare}
            className="text-xs font-semibold text-brand-600 hover:underline"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-lg border border-sand-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-left text-sm">
          <tbody>
            {/* Row 1: Image & Title */}
            <tr className="border-b border-sand-200 bg-sand-50/50">
              <td className="w-48 p-4 font-semibold text-sand-600 align-top">
                Property
              </td>
              {compareProperties.map((p) => {
                const cover =
                  p.images && p.images.length > 0
                    ? typeof p.images[0] === 'string'
                      ? p.images[0]
                      : p.images[0].url
                    : null;
                return (
                  <td key={p._id} className="w-64 p-4 align-top">
                    <div className="relative mb-2 h-36 overflow-hidden rounded bg-sand-100">
                      {cover ? (
                        <img
                          src={cover}
                          alt={p.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-sand-400">
                          No photo
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromCompare(p._id)}
                        className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white hover:bg-brand-600"
                        title="Remove from comparison"
                      >
                        ✕
                      </button>
                    </div>
                    <Link
                      to={`/property/${p._id}`}
                      className="font-display font-semibold text-ink line-clamp-2 hover:text-brand-600"
                    >
                      {p.title}
                    </Link>
                    <p className="mt-1 text-xs text-sand-500">
                      {p.area}, {p.city}
                    </p>
                  </td>
                );
              })}
            </tr>

            {/* Price */}
            <tr className="border-b border-sand-200">
              <td className="p-4 font-medium text-sand-600">Price (PKR)</td>
              {compareProperties.map((p) => (
                <td key={p._id} className="p-4 font-display text-lg font-bold text-ink">
                  PKR {formatPrice(p.price)}
                  {p.priceUnit && (
                    <span className="text-xs font-normal text-sand-500">
                      /{p.priceUnit}
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Purpose & Type */}
            <tr className="border-b border-sand-200 bg-sand-50/20">
              <td className="p-4 font-medium text-sand-600">Type / Purpose</td>
              {compareProperties.map((p) => (
                <td key={p._id} className="p-4 capitalize">
                  <span className="rounded bg-sand-100 px-2 py-1 text-xs font-semibold text-sand-800">
                    {p.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                  </span>{' '}
                  <span className="text-sand-700">({p.category})</span>
                </td>
              ))}
            </tr>

            {/* Area */}
            <tr className="border-b border-sand-200">
              <td className="p-4 font-medium text-sand-600">Area Size</td>
              {compareProperties.map((p) => (
                <td key={p._id} className="p-4 font-medium text-ink">
                  {formatArea(p.areaSize, p.areaUnit)}
                </td>
              ))}
            </tr>

            {/* Bedrooms & Bathrooms */}
            <tr className="border-b border-sand-200 bg-sand-50/20">
              <td className="p-4 font-medium text-sand-600">Bed / Bath</td>
              {compareProperties.map((p) => (
                <td key={p._id} className="p-4 text-sand-800">
                  {p.category === 'plot'
                    ? 'N/A (Plot)'
                    : `${p.bedrooms ?? '-'} Beds / ${p.bathrooms ?? '-'} Baths`}
                </td>
              ))}
            </tr>

            {/* Possession Status */}
            <tr className="border-b border-sand-200">
              <td className="p-4 font-medium text-sand-600">Possession</td>
              {compareProperties.map((p) => (
                <td key={p._id} className="p-4 capitalize text-sand-800">
                  {p.possessionStatus
                    ? p.possessionStatus.replace('_', ' ')
                    : 'Ready'}
                </td>
              ))}
            </tr>

            {/* Furnishing */}
            <tr className="border-b border-sand-200 bg-sand-50/20">
              <td className="p-4 font-medium text-sand-600">Furnishing</td>
              {compareProperties.map((p) => (
                <td key={p._id} className="p-4 capitalize text-sand-800">
                  {p.isFurnished ? p.isFurnished.replace('_', ' ') : 'Unfurnished'}
                </td>
              ))}
            </tr>

            {/* Corner Plot */}
            <tr className="border-b border-sand-200">
              <td className="p-4 font-medium text-sand-600">Corner Plot</td>
              {compareProperties.map((p) => (
                <td key={p._id} className="p-4 text-sand-800">
                  {p.isCornerPlot ? (
                    <span className="font-semibold text-teal-700">✓ Yes (Corner)</span>
                  ) : (
                    'No'
                  )}
                </td>
              ))}
            </tr>

            {/* Amenities */}
            <tr className="border-b border-sand-200 bg-sand-50/20">
              <td className="p-4 font-medium text-sand-600">Amenities</td>
              {compareProperties.map((p) => (
                <td key={p._id} className="p-4 align-top">
                  {p.amenities && p.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {p.amenities.map((a, i) => (
                        <span
                          key={i}
                          className="rounded bg-sand-100 px-1.5 py-0.5 text-[11px] text-sand-700"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-sand-400">None listed</span>
                  )}
                </td>
              ))}
            </tr>

            {/* Action Buttons */}
            <tr>
              <td className="p-4 font-medium text-sand-600">Action</td>
              {compareProperties.map((p) => (
                <td key={p._id} className="p-4">
                  <Link
                    to={`/property/${p._id}`}
                    className="btn-primary block w-full text-center text-xs"
                  >
                    View Listing
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default Compare;
