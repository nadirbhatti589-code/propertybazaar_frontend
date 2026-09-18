import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const MessagesContext = createContext(null);

export const MessagesProvider = ({ children }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshConversations = useCallback(async () => {
    if (!user) {
      setConversations([]);
      setUnreadTotal(0);
      return;
    }
    try {
      const { data } = await api.get('/conversations');
      setConversations(data.conversations || []);
      const unread = (data.conversations || []).reduce(
        (sum, c) => sum + (c.unreadCount || 0),
        0
      );
      setUnreadTotal(unread);
    } catch (err) {
      /* silent — page itself shows errors */
    }
  }, [user]);

  const refreshUnread = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/conversations/unread');
      setUnreadTotal(data.unread ?? 0);
    } catch (err) {
      /* silent */
    }
  }, [user]);

  // Load once when a user logs in.
  useEffect(() => {
    if (user) refreshConversations();
  }, [user, refreshConversations]);

  // Poll the unread badge every 12 seconds so the navbar stays fresh.
  useEffect(() => {
    if (!user) return undefined;
    const timer = setInterval(refreshUnread, 12000);
    return () => clearInterval(timer);
  }, [user, refreshUnread]);

  return (
    <MessagesContext.Provider
      value={{ conversations, unreadTotal, refreshConversations, loading, setLoading }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => useContext(MessagesContext);