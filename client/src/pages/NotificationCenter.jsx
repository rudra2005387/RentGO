import { createContext, useContext, useState, useCallback, useEffect } from 'react';

export const NotificationContext = createContext(null);

const STORAGE_KEY = 'rg_notifications';

const loadFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveToStorage = (notifications) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {}
};

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState(() => loadFromStorage());

  // Persist to localStorage on every change
  useEffect(() => {
    saveToStorage(notifications);
  }, [notifications]);

  const addNotification = useCallback((notif) => {
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      isRead: false,
      read: false,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    return newNotif;
  }, []);

  /**
   * Call this right after a successful booking API response.
   * Pass in the booking object returned by the server.
   */
  const notifyBookingConfirmed = useCallback(
    (booking, listingTitle, city) => {
      const checkIn = booking.checkInDate || booking.checkIn;
      const checkOut = booking.checkOutDate || booking.checkOut;
      const ref = booking.bookingReference || (booking._id || '').slice(-8).toUpperCase();
      const nights = booking.pricing?.nights ||
        (checkIn && checkOut
          ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / 86400000)
          : 1);
      const fmt = (d) =>
        d
          ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '—';

      return addNotification({
        type: 'booking',
        title: `Booking confirmed! 🎉`,
        message: `Your trip to ${city || listingTitle || 'your destination'} is confirmed.`,
        body: `${listingTitle ? listingTitle + ' · ' : ''}${fmt(checkIn)} → ${fmt(checkOut)} · ${nights} night${nights !== 1 ? 's' : ''} · Ref #${ref}`,
        details: `Check-in: ${fmt(checkIn)} · Check-out: ${fmt(checkOut)}`,
        bookingId: booking._id,
        listingTitle,
        city,
      });
    },
    [addNotification]
  );

  const notifyBookingCancelled = useCallback(
    (booking, listingTitle) => {
      const ref = booking.bookingReference || (booking._id || '').slice(-8).toUpperCase();
      return addNotification({
        type: 'cancellation',
        title: `Booking cancelled`,
        message: `Your booking for ${listingTitle || 'your stay'} has been cancelled.`,
        body: `Ref #${ref} has been cancelled. Any applicable refunds will be processed within 5–7 business days.`,
        bookingId: booking._id,
        listingTitle,
      });
    },
    [addNotification]
  );

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id || n._id === id ? { ...n, isRead: true, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })));
  }, []);

  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id && n._id !== id));
  }, []);

  const deleteAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead && !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        notifyBookingConfirmed,
        notifyBookingCancelled,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// Convenience hook
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
}