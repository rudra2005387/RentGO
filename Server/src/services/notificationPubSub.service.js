const Redis = require('ioredis');
const { getRedisClient } = require('../config/redis');

const CHANNELS = {
  userNotification: (userId) => `notifications:user:${userId}`,
  bookingsUpdates: 'bookings:updates',
  listingsUpdates: 'listings:updates',
  messagesChat: (conversationId) => `messages:chat:${conversationId}`
};

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (_) {
    return value;
  }
};

const publish = async (channel, payload) => {
  const client = getRedisClient();
  if (!client) return false;

  const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
  await client.publish(channel, message);
  return true;
};

const publishUserNotification = async (io, userId, notificationPayload) => {
  const published = await publish(CHANNELS.userNotification(userId), {
    event: 'notification',
    data: notificationPayload
  });

  if (!published && io) {
    io.to(`user_${userId}`).emit('notification', notificationPayload);
  }
};

const publishBookingUpdate = async (io, payload) => {
  const published = await publish(CHANNELS.bookingsUpdates, {
    event: 'booking_update',
    data: payload
  });

  if (!published && io && payload && payload.userIds) {
    payload.userIds.forEach((userId) => {
      io.to(`user_${userId}`).emit('booking_update', payload);
    });
  }
};

const publishChatMessage = async (io, conversationId, payload) => {
  const published = await publish(CHANNELS.messagesChat(conversationId), {
    event: 'message',
    data: payload
  });

  if (!published && io) {
    io.to(`chat_${conversationId}`).emit('message', payload);
  }
};

const publishListingUpdate = async (io, payload) => {
  const published = await publish(CHANNELS.listingsUpdates, {
    event: 'listing_update',
    data: payload
  });

  if (!published && io && payload && payload.userIds) {
    payload.userIds.forEach((userId) => {
      io.to(`user_${userId}`).emit('listing_update', payload);
    });
  }
};

const initNotificationSubscriber = (io) => {
  if (!process.env.REDIS_URL) {
    return null;
  }

  const subscriber = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    }
  });

  subscriber.psubscribe(
    'notifications:user:*',
    'bookings:updates',
    'listings:updates',
    'messages:chat:*'
  );

  subscriber.on('pmessage', (_pattern, channel, message) => {
    const payload = safeJsonParse(message);

    if (channel.startsWith('notifications:user:')) {
      const userId = channel.split(':')[2];
      const data = payload?.data ?? payload;
      const event = payload?.event || 'notification';
      io.to(`user_${userId}`).emit(event, data);
      return;
    }

    if (channel.startsWith('messages:chat:')) {
      const conversationId = channel.split(':')[2];
      const data = payload?.data ?? payload;
      const event = payload?.event || 'message';
      io.to(`chat_${conversationId}`).emit(event, data);
      return;
    }

    if (channel === CHANNELS.bookingsUpdates) {
      const data = payload?.data ?? payload;
      const event = payload?.event || 'booking_update';
      if (data?.userIds) {
        data.userIds.forEach((userId) => {
          io.to(`user_${userId}`).emit(event, data);
        });
      }
      return;
    }

    if (channel === CHANNELS.listingsUpdates) {
      const data = payload?.data ?? payload;
      const event = payload?.event || 'listing_update';
      if (data?.userIds) {
        data.userIds.forEach((userId) => {
          io.to(`user_${userId}`).emit(event, data);
        });
      }
    }
  });

  subscriber.on('error', (err) => {
    console.warn(`⚠️  Redis notification subscriber error: ${err.message}`);
  });

  return subscriber;
};

module.exports = {
  CHANNELS,
  publishUserNotification,
  publishBookingUpdate,
  publishChatMessage,
  publishListingUpdate,
  initNotificationSubscriber
};
