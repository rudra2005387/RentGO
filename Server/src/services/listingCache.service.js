const crypto = require('crypto');
const redisService = require('./redis.service');

const TTL = {
  listing: 24 * 60 * 60,
  search: 2 * 60 * 60,
  host: 6 * 60 * 60,
  featured: 12 * 60 * 60,
  category: 6 * 60 * 60,
  trending: 6 * 60 * 60,
  similar: 6 * 60 * 60,
  nearby: 2 * 60 * 60,
  suggestions: 6 * 60 * 60
};

const stableStringify = (value) => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => `${key}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return String(value);
};

const hashObject = (obj) => {
  const raw = stableStringify(obj);
  return crypto.createHash('sha256').update(raw).digest('hex');
};

class ListingCacheService {
  getListingKey(listingId) {
    return `listing:${listingId}`;
  }

  getSearchKey(filters) {
    return `listings:search:${hashObject(filters)}`;
  }

  getHostKey(hostId, params) {
    return `listings:host:${hostId}:${hashObject(params)}`;
  }

  getFeaturedKey(params) {
    return `listings:featured:${hashObject(params)}`;
  }

  getTrendingKey(params) {
    return `listings:trending:${hashObject(params)}`;
  }

  getSimilarKey(listingId, params) {
    return `listings:similar:${listingId}:${hashObject(params)}`;
  }

  getNearbyKey(params) {
    return `listings:nearby:${hashObject(params)}`;
  }

  getSuggestionsKey(params) {
    return `listings:suggestions:${hashObject(params)}`;
  }

  async getListing(listingId) {
    return redisService.get(this.getListingKey(listingId));
  }

  async setListing(listingId, payload) {
    return redisService.set(this.getListingKey(listingId), payload, TTL.listing);
  }

  async getSearchResults(filters) {
    return redisService.get(this.getSearchKey(filters));
  }

  async setSearchResults(filters, payload) {
    return redisService.set(this.getSearchKey(filters), payload, TTL.search);
  }

  async getHostListings(hostId, params) {
    return redisService.get(this.getHostKey(hostId, params));
  }

  async setHostListings(hostId, params, payload) {
    return redisService.set(this.getHostKey(hostId, params), payload, TTL.host);
  }

  async getFeatured(params) {
    return redisService.get(this.getFeaturedKey(params));
  }

  async setFeatured(params, payload) {
    return redisService.set(this.getFeaturedKey(params), payload, TTL.featured);
  }

  async getTrending(params) {
    return redisService.get(this.getTrendingKey(params));
  }

  async setTrending(params, payload) {
    return redisService.set(this.getTrendingKey(params), payload, TTL.trending);
  }

  async getSimilar(listingId, params) {
    return redisService.get(this.getSimilarKey(listingId, params));
  }

  async setSimilar(listingId, params, payload) {
    return redisService.set(this.getSimilarKey(listingId, params), payload, TTL.similar);
  }

  async getNearby(params) {
    return redisService.get(this.getNearbyKey(params));
  }

  async setNearby(params, payload) {
    return redisService.set(this.getNearbyKey(params), payload, TTL.nearby);
  }

  async getSuggestions(params) {
    return redisService.get(this.getSuggestionsKey(params));
  }

  async setSuggestions(params, payload) {
    return redisService.set(this.getSuggestionsKey(params), payload, TTL.suggestions);
  }

  async invalidateListing({ listingId, hostId }) {
    if (listingId) {
      await redisService.del(this.getListingKey(listingId));
      await redisService.deletePattern(`listings:similar:${listingId}:*`);
    }

    if (hostId) {
      await redisService.deletePattern(`listings:host:${hostId}:*`);
    }

    await redisService.deletePattern('listings:search:*');
    await redisService.deletePattern('listings:featured:*');
    await redisService.deletePattern('listings:trending:*');
    await redisService.deletePattern('listings:nearby:*');
  }
}

module.exports = new ListingCacheService();
