const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/RentGo";
const User = require("./src/models/User");
const Listing = require("./src/models/Listing");
const LISTINGS = [
  { title: "Modern Apartment with Skyline View", city: "New York", state: "NY", price: 150, type: "apartment", lat: 40.7128, lng: -74.0060, rating: 4.9, img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800" },
  { title: "Cozy Beach Cottage", city: "Santa Monica", state: "CA", price: 200, type: "house", lat: 34.0195, lng: -118.4912, rating: 4.8, img: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800" },
  { title: "Quiet Mountain Chalet", city: "Aspen", state: "CO", price: 350, type: "house", lat: 39.1911, lng: -106.8175, rating: 4.7, img: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800" },
  { title: "Large Family Home with Garden", city: "Austin", state: "TX", price: 180, type: "house", lat: 30.2672, lng: -97.7431, rating: 4.9, img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800" },
  { title: "Compact City Studio", city: "Seattle", state: "WA", price: 95, type: "apartment", lat: 47.6062, lng: -122.3321, rating: 4.6, img: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800" },
  { title: "Lakefront Apartment with Patio", city: "Lake Tahoe", state: "NV", price: 130, type: "apartment", lat: 39.0968, lng: -120.0324, rating: 4.8, img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800" },
  { title: "Designer Loft in Arts District", city: "Los Angeles", state: "CA", price: 175, type: "apartment", lat: 34.0522, lng: -118.2437, rating: 4.8, img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800" },
  { title: "Rustic Cabin in the Woods", city: "Bend", state: "OR", price: 90, type: "house", lat: 44.0582, lng: -121.3153, rating: 4.5, img: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800" },
  { title: "Penthouse Suite Downtown", city: "Chicago", state: "IL", price: 400, type: "apartment", lat: 41.8781, lng: -87.6298, rating: 5.0, img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800" },
  { title: "Beachfront Villa with Pool", city: "Miami", state: "FL", price: 550, type: "villa", lat: 25.7617, lng: -80.1918, rating: 5.0, img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800" },
  { title: "Mountain View Townhouse", city: "Park City", state: "UT", price: 220, type: "townhouse", lat: 40.6461, lng: -111.4980, rating: 4.9, img: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800" },
  { title: "Charming Townhouse", city: "San Francisco", state: "CA", price: 300, type: "townhouse", lat: 37.7749, lng: -122.4194, rating: 4.9, img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800" },
  { title: "Bright Minimalist Apartment", city: "Portland", state: "OR", price: 85, type: "apartment", lat: 45.5051, lng: -122.6750, rating: 4.7, img: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800" },
  { title: "Private Room Near Downtown", city: "Nashville", state: "TN", price: 75, type: "private_room", lat: 36.1627, lng: -86.7816, rating: 4.8, img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800" },
  { title: "Unique Desert House", city: "Sedona", state: "AZ", price: 110, type: "house", lat: 34.8697, lng: -111.7610, rating: 4.8, img: "https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?w=800" },
  { title: "Luxury Condo with Terrace", city: "San Diego", state: "CA", price: 280, type: "condo", lat: 32.7157, lng: -117.1611, rating: 4.9, img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800" },
  { title: "Oceanside Villa", city: "Maui", state: "HI", price: 420, type: "villa", lat: 20.7984, lng: -156.3319, rating: 5.0, img: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800" },
  { title: "Suburban Family House", city: "Denver", state: "CO", price: 165, type: "house", lat: 39.7392, lng: -104.9903, rating: 4.8, img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800" },
  { title: "Cozy Ski Lodge Apartment", city: "Jackson Hole", state: "WY", price: 195, type: "apartment", lat: 43.4799, lng: -110.7624, rating: 4.9, img: "https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=800" },
  { title: "Downtown Micro-Loft", city: "Boston", state: "MA", price: 120, type: "apartment", lat: 42.3601, lng: -71.0589, rating: 4.7, img: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800" },
  { title: "Boutique Hotel Room", city: "New Orleans", state: "LA", price: 160, type: "hotel", lat: 29.9511, lng: -90.0715, rating: 4.8, img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" },
  { title: "Shared Hostel Room", city: "Portland", state: "OR", price: 45, type: "hostel", lat: 45.5231, lng: -122.6765, rating: 4.5, img: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800" },
  { title: "Entire Place Near Beach", city: "San Diego", state: "CA", price: 200, type: "entire_place", lat: 32.7637, lng: -117.2340, rating: 4.7, img: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800" },
  { title: "Shared Room in Loft", city: "Brooklyn", state: "NY", price: 55, type: "shared_room", lat: 40.6782, lng: -73.9442, rating: 4.4, img: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800" },
];
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");
    let host = await User.findOne({ role: "host" });
    if (!host) {
      host = await User.create({ firstName: "Demo", lastName: "Host", email: "demo.host@rentgo.com", password: "DemoHost123", phone: 9876543210, role: "host", isActive: true });
      console.log("✅ Created demo host");
    } else {
      console.log("✅ Using existing host:", host.email);
    }
    await Listing.deleteMany({});
    console.log("🗑️  Cleared listings");
    let ok = 0;
    for (let i = 0; i < LISTINGS.length; i++) {
      const l = LISTINGS[i];
      try {
        await Listing.create({
          title: l.title,
          description: "A wonderful property in " + l.city + ". Perfect for your next stay with all amenities you need for a comfortable experience.",
          propertyType: l.type, roomType: "entire_place", host: host._id,
          guests: 4, bedrooms: 2, beds: 2, bathrooms: 1,
          location: { address: (100 + i) + " Main Street", city: l.city, state: l.state, country: "USA", zipCode: "10001", latitude: l.lat, longitude: l.lng },
          pricing: { basePrice: l.price, currency: "USD", cleaningFee: 30, serviceFee: 15 },
          images: [{ url: l.img, isCover: true }],
          amenities: { basics: { wifi: true, kitchen: true, airConditioning: true, heating: true }, features: { tv: true, washer: true }, safety: { smokeDetector: true } },
          status: "published", averageRating: l.rating, totalReviews: Math.floor(Math.random() * 50) + 5,
        });
        ok++;
        process.stdout.write(".");
      } catch(e) { console.error("\n❌ " + l.title + ": " + e.message); }
    }
    console.log("\n✅ Created " + ok + "/" + LISTINGS.length + " listings");
    console.log("🎉 Done! Refresh localhost:5173");
  } catch (e) { console.error("❌ Fatal:", e.message); }
  finally { await mongoose.disconnect(); process.exit(0); }
}
seed();
