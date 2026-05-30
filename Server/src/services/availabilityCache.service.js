const redisService = require('./redis.service');

const TTL = {
  availability: 30 * 24 * 60 * 60,
  bookings: 30 * 24 * 60 * 60
};

class AvailabilityCacheService {
  getBookingsKey(listingId) {
    return `bookings:listing:${listingId}`;
  }

  getAvailabilityKey(listingId, startDate, endDate) {
    const start = startDate || 'all';
    const end = endDate || 'all';
    return `availability:listing:${listingId}:${start}:${end}`;
  }

  getAvailabilityDayKey(listingId, date) {
    return `availability:listing:${listingId}:${date}`;
  }

  async getBookings(listingId) {
    return redisService.get(this.getBookingsKey(listingId));
  }

  async setBookings(listingId, bookings) {
    return redisService.set(this.getBookingsKey(listingId), bookings, TTL.bookings);
  }

  async getAvailability(listingId, startDate, endDate) {
    return redisService.get(this.getAvailabilityKey(listingId, startDate, endDate));
  }

  async setAvailability(listingId, startDate, endDate, payload) {
    return redisService.set(this.getAvailabilityKey(listingId, startDate, endDate), payload, TTL.availability);
  }

  async setAvailabilityDays(listingId, startDate, endDate, bookedRanges = [], unavailableRanges = []) {
    if (!startDate || !endDate) return;

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

    const booked = bookedRanges.map((range) => ({
      start: new Date(range.checkInDate),
      end: new Date(range.checkOutDate)
    }));

    const unavailable = unavailableRanges.map((range) => ({
      start: new Date(range.checkInDate),
      end: new Date(range.checkOutDate)
    }));

    const setKey = async (date, available) => {
      const dateKey = this.getAvailabilityDayKey(listingId, date);
      await redisService.set(dateKey, { available }, TTL.availability);
    };

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = d.toISOString().slice(0, 10);
      const isBooked = booked.some((range) => d >= range.start && d < range.end);
      const isUnavailable = unavailable.some((range) => d >= range.start && d < range.end);
      await setKey(day, !(isBooked || isUnavailable));
    }
  }

  async invalidateListing(listingId) {
    await redisService.del(this.getBookingsKey(listingId));
    await redisService.deletePattern(`availability:listing:${listingId}:*`);
  }
}

module.exports = new AvailabilityCacheService();
