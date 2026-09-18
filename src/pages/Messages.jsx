import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import { formatPrice } from '../utils/areaConverter';

const imageUrl = (img) => (typeof img === 'string' ? img : img?.url);

const timeAgo = (date) => {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  return new Date(date).toLocaleDateString();
};

const fullDateTime = (date) =>
  new Date(date).toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const Messages = () => {
  const { user } = useAuth();
  const { conversations, refreshConversations } = useMessages();

  const [tab, setTab] = useState('chat');
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [text, setText] = useState('');
  const [sendError, setSendError] = useState('');
  const [otherParty, setOtherParty] = useState(null);

  const [appointments, setAppointments] = useState([]);
  const [apptLoading, setApptLoading] = useState(false);
  const [apptError, setApptError] = useState('');
  const [apptActionId, setApptActionId] = useState('');

  const bottomRef = useRef(null);
  const listErrorRef = useRef(null);
  const [listError, setListError] = useState('');

  const activeConversation = conversations.find((c) => c._id === activeId) || null;
  const other = activeConversation
    ? (activeConversation.buyer?._id || activeConversation.buyer) === user.id
      ? activeConversation.seller
      : activeConversation.buyer
    : null;

  // ---- Conversation list ----
  useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  // ---- Load a thread ----
  const loadThread = useCallback(async (conversationId) => {
    setThreadLoading(true);
    try {
      const { data } = await api.get(`/conversations/${conversationId}/messages`);
      setMessages(data.messages || []);
      setOtherParty(data.otherParty || null);
    } catch (err) {
      setListError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setThreadLoading(false);
      setListError('');
    }
  }, []);

  // ---- Poll the active thread every 6 seconds ----
  useEffect(() => {
    if (!activeId) return undefined;
    loadThread(activeId);
    const timer = setInterval(() => {
      loadThread(activeId);
      refreshConversations();
    }, 6000);
    return () => clearInterval(timer);
  }, [activeId, loadThread, refreshConversations]);

  // Re-select conversation when it disappears from list
  useEffect(() => {
    if (activeId && !activeConversation) setActiveId(null);
  }, [conversations, activeId, activeConversation]);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, activeId]);

  // ---- Send a message ----
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!text.trim() || !activeId) return;
    const body = text.trim();
    setText('');
    setSendError('');

    const optimistic = {
      _id: `temp-${Date.now()}`,
      conversation: activeId,
      sender: user.id,
      senderObj: { _id: user.id, name: user.name },
      text: body,
      createdAt: new Date().toISOString(),
      readAt: null,
    };
    setMessages((prev) => [...prev, optimistic]);
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });

    try {
      const { data } = await api.post(`/conversations/${activeId}/messages`, { text: body });
      setMessages((prev) => prev.map((m) => (m._id === optimistic._id ? data.message : m)));
      refreshConversations();
    } catch (err) {
      setSendError(err.response?.data?.message || 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m._id !== optimistic._id));
      setText(body);
    }
  };

  // ---- Appointments ----
  const loadAppointments = useCallback(async () => {
    setApptLoading(true);
    setApptError('');
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data.appointments || []);
    } catch (err) {
      setApptError(err.response?.data?.message || 'Failed to load appointments');
    } finally {
      setApptLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'appointments') loadAppointments();
  }, [tab, loadAppointments]);

  const handleAppointmentAction = async (appt, status) => {
    setApptActionId(appt._id);
    setApptError('');
    try {
      const { data } = await api.patch(`/appointments/${appt._id}`, { status });
      setAppointments((prev) =>
        prev.map((a) => (a._id === appt._id ? data.appointment : a))
      );
    } catch (err) {
      setApptError(err.response?.data?.message || 'Failed to update appointment');
    } finally {
      setApptActionId('');
    }
  };

  const selectConversation = (id) => {
    setActiveId(id);
    setMessages([]);
    setListError('');
  };

  const appointmentRole = (appt) =>
    (appt.buyer?._id || appt.buyer) === user.id ? 'buyer' : 'seller';

  const statusStyles = {
    pending: 'bg-gold-400/20 text-gold-600',
    accepted: 'bg-teal-100 text-teal-700',
    declined: 'bg-brand-50 text-brand-600',
    cancelled: 'bg-sand-100 text-sand-600',
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">
            Talk to owners & schedule visits
          </p>
          <h1 className="section-heading mt-1">Messages & Appointments</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab('chat')}
            className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === 'chat'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'border border-sand-300 bg-white text-sand-600 hover:bg-sand-50'
            }`}
          >
            Chats
          </button>
          <button
            type="button"
            onClick={() => setTab('appointments')}
            className={`rounded px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              tab === 'appointments'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'border border-sand-300 bg-white text-sand-600 hover:bg-sand-50'
            }`}
          >
            Appointments
          </button>
        </div>
      </div>

      {tab === 'chat' ? (
        <div className="grid grid-cols-1 overflow-hidden rounded-lg border border-sand-200 bg-white shadow-sm lg:grid-cols-[20rem_minmax(0,1fr)]">
          {/* Conversation list */}
          <div className={`${activeId ? 'hidden lg:block' : ''} border-r border-sand-200`}>
            <div className="flex items-center justify-between border-b border-sand-200 bg-sand-50/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-sand-600">
                Conversations ({conversations.length})
              </p>
              <button
                type="button"
                onClick={refreshConversations}
                className="text-xs text-teal-600 hover:text-teal-700"
              >
                Refresh
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm font-medium text-ink">No conversations yet</p>
                  <p className="mx-auto mt-1 max-w-[16rem] text-xs text-sand-500">
                    Open any listing and send a message to start chatting with the owner.
                  </p>
                  <Link to="/" className="btn-primary mt-4 inline-block text-xs">
                    Browse Properties
                  </Link>
                </div>
              ) : (
                conversations.map((conv) => {
                  const convOther = (conv.buyer?._id || conv.buyer) === user.id ? conv.seller : conv.buyer;
                  const cover = conv.listing?.images?.[0] ? imageUrl(conv.listing.images[0]) : null;
                  const isActive = conv._id === activeId;
                  return (
                    <button
                      key={conv._id}
                      type="button"
                      onClick={() => selectConversation(conv._id)}
                      className={`flex w-full items-start gap-3 border-b border-sand-100 px-4 py-3 text-left transition-colors ${
                        isActive ? 'bg-teal-50/60' : 'hover:bg-sand-50'
                      }`}
                    >
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded bg-sand-100">
                        {cover ? (
                          <img src={cover} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-sand-400">
                            {conv.listing?.category?.slice(0, 4) || 'Prop'}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-ink">
                            {convOther?.name || 'User'}
                          </p>
                          <span className="shrink-0 text-[10px] text-sand-400">
                            {timeAgo(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p className="truncate text-xs text-sand-500">
                          {conv.listing?.area}, {conv.listing?.city}
                        </p>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-sand-600">
                            {conv.lastMessage || 'Start the conversation'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Thread */}
          <div className={`${activeId ? '' : 'hidden lg:flex'} flex min-h-[60vh] flex-col`}>
            {!activeConversation ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <span className="text-3xl">💬</span>
                <p className="mt-3 font-display text-lg font-semibold text-ink">
                  Select a conversation
                </p>
                <p className="mx-auto max-w-xs text-xs leading-5 text-sand-500">
                  Choose a thread on the left to read and reply to messages about a listing.
                </p>
              </div>
            ) : (
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 border-b border-sand-200 bg-sand-50/60 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setActiveId(null)}
                    className="rounded border border-sand-300 px-2 py-1 text-xs text-sand-600 hover:bg-sand-100 lg:hidden"
                  >
                    ← Back
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">
                      {other?.name || 'User'} · {activeConversation.listing?.area},{' '}
                      {activeConversation.listing?.city}
                    </p>
                    <p className="truncate text-xs text-sand-500">
                      PKR {formatPrice(activeConversation.listing?.price || 0)}
                    </p>
                  </div>
                  {activeConversation.listing?._id && (
                    <Link
                      to={`/property/${activeConversation.listing._id}`}
                      className="shrink-0 rounded border border-sand-300 px-2.5 py-1 text-xs text-teal-700 hover:bg-teal-50"
                    >
                      View Listing
                    </Link>
                  )}
                </div>

                {/* Messages body */}
                <div className="flex-1 space-y-3 overflow-y-auto bg-paper px-4 py-4" style={{ maxHeight: '62vh' }}>
                  {threadLoading && messages.length === 0 ? (
                    <div className="py-10 text-center">
                      <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-sand-400 border-t-teal-600" />
                      <p className="mt-2 text-xs text-sand-500">Loading conversation…</p>
                    </div>
                  ) : listError ? (
                    <div className="rounded border border-brand-200 bg-brand-50 p-4 text-center text-sm text-brand-700">
                      {listError}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="py-10 text-center text-sm text-sand-500">
                      No messages yet. Say hello and ask about the property.
                    </div>
                  ) : (
                    messages.map((m) => {
                      const mine = (m.senderObj?._id || m.sender) === user.id;
                      return (
                        <div key={m._id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[78%] rounded-lg px-3.5 py-2 text-sm leading-6 shadow-sm ${
                              mine ? 'bg-teal-600 text-white' : 'bg-white text-ink border border-sand-200'
                            }`}
                          >
                            <p className="whitespace-pre-line">{m.text}</p>
                            <p
                              className={`mt-1 text-right text-[10px] ${
                                mine ? 'text-teal-100' : 'text-sand-400'
                              }`}
                            >
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                              {mine && m.readAt ? ' · ✓✓' : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Composer */}
                <div className="border-t border-sand-200 bg-white p-3">
                  {sendError && (
                    <p className="mb-2 rounded bg-brand-50 px-3 py-2 text-xs text-brand-700">
                      {sendError}
                    </p>
                  )}
                  <form onSubmit={handleSend} className="flex gap-2">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={`Reply to ${other?.name || 'the owner'}…`}
                      className="form-input flex-1 text-sm"
                      maxLength={2000}
                    />
                    <button
                      type="submit"
                      disabled={!text.trim()}
                      className="btn-primary shrink-0 px-5 text-sm disabled:opacity-40"
                    >
                      Send
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* ------- Appointments tab ------- */
        <div>
          {apptLoading ? (
            <div className="py-16 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-sand-400 border-t-teal-600" />
              <p className="mt-3 text-sm text-sand-600">Loading appointments…</p>
            </div>
          ) : apptError ? (
            <div className="my-10 rounded border border-brand-200 bg-brand-50 p-6 text-center text-sm text-brand-700">
              <p>{apptError}</p>
              <button type="button" onClick={loadAppointments} className="btn-secondary mt-3 text-xs">
                Retry
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="border border-dashed border-sand-400 bg-sand-50/60 px-6 py-14 text-center">
              <p className="font-display text-2xl font-semibold text-ink">No viewing appointments yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-sand-600">
                Request a viewing from any listing page. As an owner you can accept or decline
                requests here.
              </p>
              <Link to="/" className="btn-primary mt-6 inline-block">
                Find a Property
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt) => {
                const role = appointmentRole(appt);
                const otherUser = role === 'buyer' ? appt.seller : appt.buyer;
                const cover = appt.listing?.images?.[0] ? imageUrl(appt.listing.images[0]) : null;
                return (
                  <article
                    key={appt._id}
                    className="flex flex-col gap-4 border border-sand-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center"
                  >
                    <div className="h-20 w-full shrink-0 overflow-hidden rounded bg-sand-100 sm:w-28">
                      {cover ? (
                        <img src={cover} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-sand-400">
                          No photo
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/property/${appt.listing?._id}`}
                        className="font-display font-semibold text-ink hover:text-brand-600"
                      >
                        {appt.listing?.title || 'Property'}
                      </Link>
                      <p className="mt-1 text-xs text-sand-500">
                        {appt.listing?.area}, {appt.listing?.city} · {appt.listing?.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                      </p>
                      <p className="mt-1 text-sm font-medium text-ink">
                        📅 {fullDateTime(appt.requestedTime)}
                      </p>
                      {appt.notes && <p className="mt-1 text-xs text-sand-600">“{appt.notes}”</p>}
                      <p className="mt-1 text-xs text-sand-500">
                        {role === 'buyer'
                          ? `Owner: ${appt.seller?.name || '—'}`
                          : `Requested by: ${appt.buyer?.name || '—'} (${appt.buyer?.phone || 'no phone'})`}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-block rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${statusStyles[appt.status] || 'bg-sand-100 text-sand-600'}`}
                        >
                          {appt.status}
                        </span>
                      </div>
                    </div>

                    {(role === 'seller' || role === 'buyer') && appt.status === 'pending' && (
                      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                        {role === 'seller' ? (
                          <>
                            <button
                              type="button"
                              disabled={apptActionId === appt._id}
                              onClick={() => handleAppointmentAction(appt, 'accepted')}
                              className="btn-primary w-full sm:w-auto px-5 text-xs disabled:opacity-50"
                            >
                              {apptActionId === appt._id ? 'Saving…' : 'Accept'}
                            </button>
                            <button
                              type="button"
                              disabled={apptActionId === appt._id}
                              onClick={() => handleAppointmentAction(appt, 'declined')}
                              className="rounded border border-brand-300 px-5 py-2 text-xs font-semibold text-brand-600 hover:bg-brand-50 disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={apptActionId === appt._id}
                            onClick={() => handleAppointmentAction(appt, 'cancelled')}
                            className="rounded border border-sand-300 px-4 py-2 text-xs text-sand-600 hover:bg-sand-50 disabled:opacity-50"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Messages;