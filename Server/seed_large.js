/**
 * Large seed script – populates ~200+ realistic listings across India, USA, Europe and Asia.
 * Run: node seed_large.js
 */
const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/RentGo";
const User = require("./src/models/User");
const Listing = require("./src/models/Listing");

// ─── Helper: pick random from array ─────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, dec = 1) => +(Math.random() * (max - min) + min).toFixed(dec);

// ─── Unsplash images (varied property photos) ───────────────────────────────
const IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
  "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
  "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
  "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
  "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800",
  "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800",
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
  "https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=800",
  "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
  "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800",
  "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800",
  "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
];

const TYPES = ["apartment", "house", "villa", "condo", "townhouse", "hotel", "hostel", "entire_place", "private_room", "shared_room"];

const ADJECTIVES = ["Modern", "Cozy", "Luxury", "Charming", "Elegant", "Spacious", "Bright", "Stylish", "Beautiful", "Premium", "Stunning", "Serene", "Rustic", "Contemporary", "Boutique", "Grand", "Chic", "Warm", "Peaceful", "Trendy"];
const NOUNS_MAP = {
  apartment: ["Apartment", "Flat", "Studio", "Loft", "Penthouse"],
  house: ["House", "Home", "Bungalow", "Cottage", "Residence"],
  villa: ["Villa", "Estate", "Retreat", "Mansion"],
  condo: ["Condo", "Condominium", "Suite"],
  townhouse: ["Townhouse", "Row House", "Duplex"],
  hotel: ["Hotel Room", "Boutique Hotel", "Hotel Suite"],
  hostel: ["Hostel Room", "Shared Space", "Hostel Bed"],
  entire_place: ["Entire Home", "Full Property", "Entire Apartment"],
  private_room: ["Private Room", "Guest Room", "Suite"],
  shared_room: ["Shared Room", "Bunk Space", "Shared Suite"],
};
const FEATURES = ["with Skyline View", "near the Beach", "in City Center", "with Garden", "with Pool", "in Historic District", "with Terrace", "near Park", "with Mountain View", "by the Lake", "with Rooftop", "near Metro", "with Balcony", "near Market", "with Parking"];

function genTitle(type, city) {
  const adj = pick(ADJECTIVES);
  const noun = pick(NOUNS_MAP[type] || ["Place"]);
  const feat = Math.random() > 0.4 ? " " + pick(FEATURES) : " in " + city;
  return (adj + " " + noun + feat).slice(0, 98);
}

const DESCRIPTIONS = [
  "Experience the perfect blend of comfort and style in this beautiful property. Fully equipped with modern amenities, high-speed wifi, and a welcoming ambiance that makes you feel right at home.",
  "A wonderful retreat nestled in a prime location. Enjoy stunning views, comfortable furnishings, and easy access to local attractions, restaurants, and public transport.",
  "This carefully curated space offers everything you need for a memorable stay. From the plush bedding to the fully stocked kitchen, every detail has been thoughtfully designed.",
  "Escape to this amazing property featuring spacious rooms, natural light, and a tranquil atmosphere. Perfect for couples, families, or solo travelers looking for comfort.",
  "Located in one of the most sought-after neighborhoods, this property combines convenience with luxury. Step outside to discover vibrant cafes, shops, and cultural landmarks.",
  "Wake up to breathtaking views and enjoy world-class amenities in this exceptional property. Whether you are here for work or leisure, this space exceeds expectations.",
  "A hidden gem that offers privacy, comfort, and an authentic local experience. The tasteful decor and modern facilities make this the ideal base for exploring the area.",
  "Indulge in the ultimate staycation experience with premium furnishings, fast wifi, and a location that puts you at the heart of the action. Book now and create lasting memories.",
];

// ─── Cities with coordinates ─────────────────────────────────────────────────
// Each city generates multiple listings with slight coordinate jitter
const CITIES = [
  // INDIA (major focus)
  { city: "Kolkata", state: "West Bengal", country: "India", lat: 22.5726, lng: 88.3639, count: 15 },
  { city: "Mumbai", state: "Maharashtra", country: "India", lat: 19.0760, lng: 72.8777, count: 15 },
  { city: "Delhi", state: "Delhi", country: "India", lat: 28.6139, lng: 77.2090, count: 15 },
  { city: "Bangalore", state: "Karnataka", country: "India", lat: 12.9716, lng: 77.5946, count: 12 },
  { city: "Chennai", state: "Tamil Nadu", country: "India", lat: 13.0827, lng: 80.2707, count: 10 },
  { city: "Hyderabad", state: "Telangana", country: "India", lat: 17.3850, lng: 78.4867, count: 10 },
  { city: "Goa", state: "Goa", country: "India", lat: 15.2993, lng: 74.1240, count: 10 },
  { city: "Jaipur", state: "Rajasthan", country: "India", lat: 26.9124, lng: 75.7873, count: 8 },
  { city: "Pune", state: "Maharashtra", country: "India", lat: 18.5204, lng: 73.8567, count: 8 },
  { city: "Manali", state: "Himachal Pradesh", country: "India", lat: 32.2396, lng: 77.1887, count: 6 },
  { city: "Shimla", state: "Himachal Pradesh", country: "India", lat: 31.1048, lng: 77.1734, count: 5 },
  { city: "Udaipur", state: "Rajasthan", country: "India", lat: 24.5854, lng: 73.7125, count: 5 },
  { city: "Varanasi", state: "Uttar Pradesh", country: "India", lat: 25.3176, lng: 82.9739, count: 5 },
  { city: "Kochi", state: "Kerala", country: "India", lat: 9.9312, lng: 76.2673, count: 5 },
  { city: "Rishikesh", state: "Uttarakhand", country: "India", lat: 30.0869, lng: 78.2676, count: 4 },
  { city: "Darjeeling", state: "West Bengal", country: "India", lat: 27.0360, lng: 88.2627, count: 4 },
  { city: "Amritsar", state: "Punjab", country: "India", lat: 31.6340, lng: 74.8723, count: 4 },
  { city: "Ooty", state: "Tamil Nadu", country: "India", lat: 11.4102, lng: 76.6950, count: 3 },
  { city: "Nainital", state: "Uttarakhand", country: "India", lat: 29.3803, lng: 79.4636, count: 3 },
  { city: "Mysore", state: "Karnataka", country: "India", lat: 12.2958, lng: 76.6394, count: 3 },

  // USA
  { city: "New York", state: "NY", country: "USA", lat: 40.7128, lng: -74.0060, count: 10 },
  { city: "Los Angeles", state: "CA", country: "USA", lat: 34.0522, lng: -118.2437, count: 8 },
  { city: "San Francisco", state: "CA", country: "USA", lat: 37.7749, lng: -122.4194, count: 6 },
  { city: "Miami", state: "FL", country: "USA", lat: 25.7617, lng: -80.1918, count: 6 },
  { city: "Chicago", state: "IL", country: "USA", lat: 41.8781, lng: -87.6298, count: 5 },
  { city: "Seattle", state: "WA", country: "USA", lat: 47.6062, lng: -122.3321, count: 4 },
  { city: "Austin", state: "TX", country: "USA", lat: 30.2672, lng: -97.7431, count: 4 },
  { city: "Boston", state: "MA", country: "USA", lat: 42.3601, lng: -71.0589, count: 3 },
  { city: "Denver", state: "CO", country: "USA", lat: 39.7392, lng: -104.9903, count: 3 },
  { city: "Nashville", state: "TN", country: "USA", lat: 36.1627, lng: -86.7816, count: 3 },

  // EUROPE
  { city: "London", state: "England", country: "UK", lat: 51.5074, lng: -0.1278, count: 5 },
  { city: "Paris", state: "Ile-de-France", country: "France", lat: 48.8566, lng: 2.3522, count: 5 },
  { city: "Barcelona", state: "Catalonia", country: "Spain", lat: 41.3874, lng: 2.1686, count: 4 },
  { city: "Rome", state: "Lazio", country: "Italy", lat: 41.9028, lng: 12.4964, count: 4 },
  { city: "Amsterdam", state: "North Holland", country: "Netherlands", lat: 52.3676, lng: 4.9041, count: 3 },
  { city: "Berlin", state: "Berlin", country: "Germany", lat: 52.5200, lng: 13.4050, count: 3 },

  // ASIA
  { city: "Tokyo", state: "Kanto", country: "Japan", lat: 35.6762, lng: 139.6503, count: 4 },
  { city: "Bangkok", state: "Bangkok", country: "Thailand", lat: 13.7563, lng: 100.5018, count: 4 },
  { city: "Bali", state: "Bali", country: "Indonesia", lat: -8.3405, lng: 115.0920, count: 4 },
  { city: "Dubai", state: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, count: 4 },
  { city: "Singapore", state: "Singapore", country: "Singapore", lat: 1.3521, lng: 103.8198, count: 3 },
];

// Price ranges by type
const PRICE_RANGES = {
  apartment: [40, 250],
  house: [60, 400],
  villa: [150, 800],
  condo: [50, 300],
  townhouse: [70, 350],
  hotel: [80, 500],
  hostel: [15, 60],
  entire_place: [50, 400],
  private_room: [20, 120],
  shared_room: [10, 50],
};

function jitter(val, amount) {
  return +(val + (Math.random() - 0.5) * 2 * amount).toFixed(5);
}

function buildListing(cityDef, idx) {
  const type = pick(TYPES);
  const priceRange = PRICE_RANGES[type];
  const price = rand(priceRange[0], priceRange[1]);
  const guests = type === "shared_room" ? rand(1, 2) : type === "private_room" ? rand(1, 3) : rand(1, 10);
  const bedrooms = type === "shared_room" ? 1 : rand(1, 5);
  const beds = Math.max(1, bedrooms + rand(-1, 2));
  const bathrooms = Math.max(0.5, rand(1, bedrooms + 1));

  return {
    title: genTitle(type, cityDef.city),
    description: pick(DESCRIPTIONS),
    propertyType: type,
    roomType: type === "private_room" ? "private_room" : type === "shared_room" ? "shared_room" : "entire_place",
    guests,
    bedrooms,
    beds,
    bathrooms,
    location: {
      address: `${rand(1, 999)} ${pick(["Main St", "Park Ave", "Lake Rd", "Hill View", "Market Lane", "Temple Rd", "Beach Rd", "MG Road", "Station Rd", "Ring Rd"])}`,
      city: cityDef.city,
      state: cityDef.state,
      country: cityDef.country,
      zipCode: String(rand(10000, 99999)),
      latitude: jitter(cityDef.lat, 0.06),
      longitude: jitter(cityDef.lng, 0.06),
    },
    pricing: {
      basePrice: price,
      currency: "USD",
      cleaningFee: rand(5, 50),
      serviceFee: rand(5, 30),
      weeklyDiscount: Math.random() > 0.6 ? rand(5, 20) : 0,
      monthlyDiscount: Math.random() > 0.7 ? rand(10, 35) : 0,
    },
    images: [
      { url: IMAGES[(idx * 3) % IMAGES.length], isCover: true },
      { url: IMAGES[(idx * 3 + 1) % IMAGES.length], isCover: false },
      { url: IMAGES[(idx * 3 + 2) % IMAGES.length], isCover: false },
    ],
    amenities: {
      basics: {
        wifi: Math.random() > 0.1,
        kitchen: Math.random() > 0.3,
        airConditioning: Math.random() > 0.2,
        heating: Math.random() > 0.4,
        parking: Math.random() > 0.5,
      },
      features: {
        pool: Math.random() > 0.7,
        hotTub: Math.random() > 0.85,
        gym: Math.random() > 0.7,
        washer: Math.random() > 0.4,
        dryer: Math.random() > 0.5,
        tv: Math.random() > 0.2,
        workSpace: Math.random() > 0.4,
        petFriendly: Math.random() > 0.6,
      },
      safety: {
        smokeDetector: Math.random() > 0.2,
        fireExtinguisher: Math.random() > 0.4,
        firstAidKit: Math.random() > 0.5,
      },
    },
    status: "published",
    averageRating: randFloat(3.8, 5.0),
    totalReviews: rand(3, 120),
    totalBookings: rand(0, 80),
  };
}

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Get or create host
    let host = await User.findOne({ role: "host" });
    if (!host) {
      host = await User.create({
        firstName: "Demo", lastName: "Host",
        email: "demo.host@rentgo.com", password: "DemoHost123",
        phone: 9876543210, role: "host", isActive: true,
      });
      console.log("✅ Created demo host");
    } else {
      console.log("✅ Using existing host:", host.email);
    }

    await Listing.deleteMany({});
    console.log("🗑️  Cleared all listings");

    let totalCreated = 0;
    let globalIdx = 0;

    for (const cityDef of CITIES) {
      let cityOk = 0;
      for (let i = 0; i < cityDef.count; i++) {
        try {
          const data = buildListing(cityDef, globalIdx);
          data.host = host._id;
          await Listing.create(data);
          cityOk++;
          globalIdx++;
          process.stdout.write(".");
        } catch (e) {
          console.error(`\n❌ ${cityDef.city} #${i}: ${e.message}`);
        }
      }
      totalCreated += cityOk;
    }

    const totalInDb = await Listing.countDocuments({ status: "published" });
    console.log(`\n✅ Created ${totalCreated} listings across ${CITIES.length} cities`);
    console.log(`📊 Total published listings in DB: ${totalInDb}`);
    console.log("🎉 Done! Refresh localhost:5173");
  } catch (e) {
    console.error("❌ Fatal:", e.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
