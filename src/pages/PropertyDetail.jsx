import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import { formatPrice, formatArea } from '../utils/areaConverter';
import { waMeLink } from '../utils/whatsapp';

const imageUrl = (image) => (typeof image === 'string' ? image : image?.url);

const statusStyles = {
  pending: 'bg-gold-400/20 text-gold-600',
  accepted: 'bg-teal-100 text-teal-700',
  declined: 'bg-brand-50 text-brand-600',
  cancelled: 'bg-sand-100 text-sand-600',
};

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isInCompare, toggleCompare } = useCompare();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  // Appointment scheduler state (buyer side)
  const [apptDate, setApptDate] = useState('');
  const [apptNotes, setApptNotes] = useState('');
  const [apptStatus, setApptStatus] = useState('');
  const [apptSending, setApptSending] = useState(false);
  const [myAppointments, setMyAppointments] = useState([]);

  // Owner-side: viewing requests for this listing
  const [listingAppointments, setListingAppointments] = useState([]);
  const [ownerApptLoading, setOwnerApptLoading] = useState(false);
  const [ownerApptError, setOwnerApptError] = useState('');
  const [apptActionId, setApptActionId] = useState('');

  const isOwner = property
    ? String(property.postedBy?._id || property.postedBy) === String(user?.id)
    : false;

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const { data } = await api.get(`/properties/${id}`);
        setProperty(data.property);
      } catch (err) {
        // rendered as unavailable
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleInquiry = async (event) => {
    event.preventDefault();
    setInquiryStatus('');
    setInquiryStatus('Opening chat…');
    try {
      const { data } = await api.post('/conversations', { listingId: id });
      await api.post(`/conversations/${data.conversation._id}/messages`, { text: message });
      setInquiryStatus('Message sent! You can continue the chat from Messages.');
      setMessage('');
    } catch (err) {
      setInquiryStatus(err.response?.data?.message || 'Failed to send message');
    }
  };

  // ---- Appointments: buyer creates, owner manages ----
  const fetchMyAppointments = useCallback(async () => {
    if (!user || isOwner) return;
    try {
      const { data } = await api.get(`/appointments?listingId=${id}`);
      setMyAppointments(data.appointments || []);
    } catch (err) {
      /* silent */
    }
  }, [user, isOwner, id]);

  const fetchListingAppointments = useCallback(async () => {
    if (!user || !isOwner) return;
    setOwnerApptLoading(true);
    setOwnerApptError('');
    try {
      const { data } = await api.get(`/appointments?listingId=${id}`);
      setListingAppointments(data.appointments || []);
    } catch (err) {
      setOwnerApptError(err.response?.data?.message || 'Failed to load viewing requests');
    } finally {
      setOwnerApptLoading(false);
    }
  }, [user, isOwner, id]);

  useEffect(() => {
    if (user) {
      fetchMyAppointments();
      fetchListingAppointments();
    }
  }, [user, fetchMyAppointments, fetchListingAppointments]);

  const handleCreateAppointment = async (event) => {
    event.preventDefault();
    setApptStatus('');
    if (!apptDate) {
      setApptStatus('Please pick a date and time.');
      return;
    }
    setApptSending(true);
    try {
      await api.post('/appointments', {
        listingId: id,
        requestedTime: new Date(apptDate).toISOString(),
        notes: apptNotes,
      });
      setApptStatus('Appointment requested! The owner will confirm shortly.');
      setApptDate('');
      setApptNotes('');
      fetchMyAppointments();
    } catch (err) {
      setApptStatus(err.response?.data?.message || 'Failed to request appointment');
    } finally {
      setApptSending(false);
    }
  };

  const handleAppointmentAction = async (appt, status) => {
    setApptActionId(appt._id);
    setOwnerApptError('');
    try {
      const { data } = await api.patch(`/appointments/${appt._id}`, { status });
      setListingAppointments((prev) =>
        prev.map((a) => (a._id === appt._id ? data.appointment : a))
      );
    } catch (err) {
      setOwnerApptError(err.response?.data?.message || 'Failed to update appointment');
    } finally {
      setApptActionId('');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sand-400 border-t-teal-600" />
        <p className="mt-3 text-sm text-sand-600">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-lg py-24 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink">Property Not Found</h2>
        <p className="mt-2 text-sm text-sand-600">
          This listing may have expired or been removed by its owner.
        </p>
        <Link to="/" className="btn-primary mt-5 inline-block">
          Browse Active Listings
        </Link>
      </div>
    );
  }

  const images = property.images || [];
  const favorited = isFavorite(property._id);
  const compared = isInCompare(property._id);

  return (
    <main className="mx-auto max-w-7xl px-4 py-7 sm:py-10">
      {/* Top Media Gallery */}
      <div className="mb-8">
        <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-lg bg-sand-100 sm:h-[28rem]">
          {images.length ? (
            <img
              src={imageUrl(images[activeImage])}
              alt={`${property.title} - Photo ${activeImage + 1}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center text-sand-600">
              <span className="font-display text-2xl">No Images Available</span>
              <p className="mt-1 text-sm">Photos have not been uploaded for this listing.</p>
            </div>
          )}

          {images.length > 1 && (
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/75 px-3 py-1 text-xs font-medium text-paper backdrop-blur">
              {activeImage + 1} / {images.length}
            </span>
          )}

          {/* Badges on detail photo */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {property.isFeatured && (
              <span className="rounded bg-gold-500 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-ink shadow">
                ★ Featured
              </span>
            )}
            <span className="rounded bg-brand-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
              {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
            </span>
            {property.isVerified && (
              <span className="rounded bg-teal-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                ✓ Verified
              </span>
            )}
          </div>
        </div>

        {/* Thumbnails row */}
        {images.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={`${imageUrl(image)}-${index}`}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
                className={`h-16 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors sm:h-20 sm:w-28 ${
                  activeImage === index ? 'border-teal-500' : 'border-transparent hover:border-sand-400'
                }`}
              >
                <img src={imageUrl(image)} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content & Sidebar Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Left Column: Details */}
        <article>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
              {property.listingType === 'rent' ? 'For Rent' : 'For Sale'} · {property.category}
            </p>

            <div className="flex items-center gap-2">
              {/* Compare toggle button */}
              <button
                type="button"
                onClick={() => toggleCompare(property)}
                className={`flex items-center gap-1 rounded border px-3 py-1 text-xs font-medium transition-colors ${
                  compared
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-sand-300 bg-white text-sand-700 hover:bg-sand-50'
                }`}
              >
                <span>⚖️</span>
                <span>{compared ? 'In Compare' : 'Add to Compare'}</span>
              </button>

              {/* Heart Favorite button */}
              <button
                type="button"
                onClick={() => toggleFavorite(property._id)}
                className={`flex items-center gap-1.5 rounded border px-3 py-1 text-xs font-semibold transition-colors ${
                  favorited
                    ? 'border-brand-300 bg-brand-50 text-brand-600'
                    : 'border-sand-300 bg-white text-sand-700 hover:text-brand-600'
                }`}
              >
                <span className="text-sm">{favorited ? '♥' : '♡'}</span>
                <span>{favorited ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            {property.title}
          </h1>
          <p className="mt-2 text-sm text-sand-600">
            {property.address ? `${property.address}, ` : ''}
            {property.area}, {property.city}
          </p>

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-2">
            <p className="font-display text-3xl font-bold text-ink sm:text-4xl">
              PKR {formatPrice(property.price)}
            </p>
            {property.priceUnit && (
              <span className="font-sans text-base font-normal text-sand-600">
                /{property.priceUnit}
              </span>
            )}
            <span className="ml-2 text-xs text-sand-400">
              (Raw: PKR {Number(property.price || 0).toLocaleString()})
            </span>
          </div>

          {/* Property Key Specs Grid */}
          <div className="my-7 grid grid-cols-2 gap-y-3 border-y border-sand-200 py-4 sm:grid-cols-4">
            {property.category !== 'plot' && (
              <>
                <div>
                  <p className="text-lg font-semibold text-ink">{property.bedrooms ?? '-'}</p>
                  <p className="text-xs uppercase tracking-wide text-sand-500">Bedrooms</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-ink">{property.bathrooms ?? '-'}</p>
                  <p className="text-xs uppercase tracking-wide text-sand-500">Bathrooms</p>
                </div>
              </>
            )}
            <div>
              <p className="text-lg font-semibold text-ink">
                {formatArea(property.areaSize, property.areaUnit)}
              </p>
              <p className="text-xs uppercase tracking-wide text-sand-500">Area Size</p>
            </div>
            <div>
              <p className="text-lg font-semibold capitalize text-ink">{property.category}</p>
              <p className="text-xs uppercase tracking-wide text-sand-500">Property Type</p>
            </div>

            {/* Phase 2 Specs */}
            {property.possessionStatus && (
              <div>
                <p className="text-base font-semibold capitalize text-teal-800">
                  {property.possessionStatus.replace('_', ' ')}
                </p>
                <p className="text-xs uppercase tracking-wide text-sand-500">Possession</p>
              </div>
            )}
            {property.isFurnished && (
              <div>
                <p className="text-base font-semibold capitalize text-teal-800">
                  {property.isFurnished.replace('_', ' ')}
                </p>
                <p className="text-xs uppercase tracking-wide text-sand-500">Furnishing</p>
              </div>
            )}
            {property.isCornerPlot && (
              <div>
                <p className="text-base font-semibold text-teal-800">Corner Plot (Yes)</p>
                <p className="text-xs uppercase tracking-wide text-sand-500">Location Type</p>
              </div>
            )}
          </div>

          {/* Description */}
          <section className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-ink">About This Property</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-sand-700">
              {property.description}
            </p>
          </section>

          {/* Amenities */}
          {property.amenities?.length > 0 && (
            <section className="mt-8 border-t border-sand-200 pt-6">
              <h2 className="font-display text-2xl font-semibold text-ink">Features & Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((amenity, index) => (
                  <span
                    key={`${amenity}-${index}`}
                    className="rounded-full bg-sand-100 px-3.5 py-1.5 text-xs font-medium text-ink"
                  >
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Right Sidebar: Contact & Inquire */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="border border-sand-200 bg-white p-5 shadow-sm">
            <div className="border-b border-sand-200 pb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
                Contact Listing Agent / Owner
              </p>
              <h3 className="mt-1 font-display text-xl font-semibold text-ink">
                {property.postedBy?.name || 'Property Owner'}
              </h3>
              {property.postedByRole === 'agent' && (
                <span className="mt-1 inline-block rounded bg-teal-100 px-2 py-0.5 text-[11px] font-bold text-teal-800">
                  Real Estate Agent
                </span>
              )}

              {waMeLink(property.postedBy?.phone) ? (
                <a
                  href={waMeLink(property.postedBy.phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-md border-2 border-[#25D366] bg-[#25D366] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1EBE5A]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Chat on WhatsApp
                </a>
              ) : (
                <p className="mt-3 rounded border border-sand-200 bg-sand-50 px-3 py-2 text-center text-xs text-sand-500">
                  Owner has not shared a WhatsApp number.
                </p>
              )}
            </div>

            {user && isOwner ? (
              <div className="pt-5">
                <h3 className="font-display text-lg font-semibold text-ink">Viewing Requests</h3>
                <p className="mt-1 text-xs text-sand-600">
                  Buyers interested in visiting this property.
                </p>

                {ownerApptLoading ? (
                  <p className="mt-4 text-sm text-sand-500">Loading requests…</p>
                ) : ownerApptError ? (
                  <p className="mt-4 rounded bg-brand-50 p-2 text-xs text-brand-700">{ownerApptError}</p>
                ) : listingAppointments.length === 0 ? (
                  <p className="mt-4 rounded border border-dashed border-sand-300 bg-sand-50 p-3 text-center text-xs text-sand-500">
                    No viewing requests yet.
                  </p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {listingAppointments.map((appt) => (
                      <div key={appt._id} className="rounded border border-sand-200 bg-sand-50/60 p-3">
                        <p className="text-sm font-semibold text-ink">
                          {appt.buyer?.name || 'Buyer'}
                          {appt.buyer?.phone && (
                            <span className="ml-2 text-xs font-normal text-sand-500">
                              {appt.buyer.phone}
                            </span>
                          )}
                        </p>
                        <p className="mt-1 text-xs text-sand-600">
                          📅 {new Date(appt.requestedTime).toLocaleString(undefined, {
                            weekday: 'short', day: 'numeric', month: 'short',
                            hour: 'numeric', minute: '2-digit',
                          })}
                        </p>
                        {appt.notes && (
                          <p className="mt-1 text-xs text-sand-500">“{appt.notes}”</p>
                        )}
                        <div className="mt-2">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[appt.status] || 'bg-sand-100 text-sand-600'}`}
                          >
                            {appt.status}
                          </span>
                        </div>
                        {appt.status === 'pending' && (
                          <div className="mt-2.5 flex gap-2">
                            <button
                              type="button"
                              disabled={apptActionId === appt._id}
                              onClick={() => handleAppointmentAction(appt, 'accepted')}
                              className="rounded bg-teal-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal-500 disabled:opacity-50"
                            >
                              {apptActionId === appt._id ? '…' : 'Accept'}
                            </button>
                            <button
                              type="button"
                              disabled={apptActionId === appt._id}
                              onClick={() => handleAppointmentAction(appt, 'declined')}
                              className="rounded border border-brand-300 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : user ? (
              <>
                <div className="pt-5">
                  <h3 className="font-display text-lg font-semibold text-ink">Send an Inquiry</h3>
                  <p className="mt-1 text-xs text-sand-600">
                    Direct message through PropertyBazaar platform.
                  </p>
                  <form onSubmit={handleInquiry} className="mt-4 space-y-3">
                    <textarea
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Hello, I am interested in this property. Please let me know the best time to visit..."
                      required
                      rows={3}
                      className="form-input resize-none text-sm"
                    />
                    <button type="submit" className="btn-primary w-full text-sm">
                      Send Message
                    </button>
                  </form>
                  {inquiryStatus && (
                    <p className="mt-3 rounded bg-teal-50 p-2 text-xs text-teal-700">
                      {inquiryStatus}
                    </p>
                  )}
                  {inquiryStatus.startsWith('Message sent') && (
                    <Link to="/messages" className="mt-2 block text-center text-xs font-semibold text-teal-700 underline">
                      Open Chat →
                    </Link>
                  )}
                </div>

                {/* Appointment scheduler */}
                <div className="mt-6 border-t border-sand-200 pt-5">
                  <h3 className="font-display text-lg font-semibold text-ink">Request a Viewing</h3>
                  <p className="mt-1 text-xs text-sand-600">
                    Pick a date & time and the owner will confirm.
                  </p>
                  <form onSubmit={handleCreateAppointment} className="mt-4 space-y-3">
                    <input
                      type="datetime-local"
                      value={apptDate}
                      onChange={(e) => setApptDate(e.target.value)}
                      className="form-input w-full text-sm"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    <input
                      type="text"
                      value={apptNotes}
                      onChange={(e) => setApptNotes(e.target.value)}
                      placeholder="Any notes? e.g. Available after 5pm"
                      className="form-input w-full text-sm"
                    />
                    <button
                      type="submit"
                      disabled={apptSending}
                      className="w-full rounded border border-teal-600 bg-teal-50 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-100 disabled:opacity-50"
                    >
                      {apptSending ? 'Requesting…' : 'Request Appointment'}
                    </button>
                  </form>
                  {apptStatus && (
                    <p
                      className={`mt-3 rounded p-2 text-xs ${
                        apptStatus.includes('requested') || apptStatus.includes('sent')
                          ? 'bg-teal-50 text-teal-700'
                          : 'bg-brand-50 text-brand-700'
                      }`}
                    >
                      {apptStatus}
                    </p>
                  )}
                  {myAppointments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-sand-500">
                        Your requests
                      </p>
                      {myAppointments.map((appt) => (
                        <div key={appt._id} className="flex items-center justify-between gap-2 rounded border border-sand-200 bg-sand-50/60 px-3 py-2">
                          <span className="text-xs text-sand-700">
                            {new Date(appt.requestedTime).toLocaleString(undefined, {
                              day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit',
                            })}
                          </span>
                          <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[appt.status] || 'bg-sand-100 text-sand-600'}`}>
                            {appt.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="pt-5 text-center">
                <p className="text-sm text-sand-600">
                  Log in or sign up to contact the seller and arrange a private viewing.
                </p>
                <Link to="/login" className="btn-primary mt-4 block text-center text-sm">
                  Log In to Inquire
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-5 space-y-2 border-t border-sand-200 pt-4">
              <button
                type="button"
                onClick={() => toggleFavorite(property._id)}
                className={`btn-secondary w-full text-xs font-semibold ${
                  favorited ? 'bg-brand-50 text-brand-700' : ''
                }`}
              >
                {favorited ? '♥ Saved in Favorites' : '♡ Save to Favorites'}
              </button>

              <button
                type="button"
                onClick={() => toggleCompare(property)}
                className="w-full rounded border border-sand-300 bg-white py-2 text-xs font-medium text-sand-700 hover:bg-sand-50"
              >
                {compared ? '⚖️ Viewing in Comparison' : '⚖️ Add to Comparison'}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};

export default PropertyDetail;
