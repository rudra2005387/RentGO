const mongoose = require("mongoose");
require("dotenv").config();
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const User = require("./src/models/User");
const Listing = require("./src/models/Listing");

const INDIAN_LISTINGS = [
  { title: "Modern Flat in Salt Lake", city: "Kolkata", state: "West Bengal", price: 45, type: "apartment", lat: 22.5726, lng: 88.4319, rating: 4.7, img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800" },
  { title: "Heritage Bungalow in Ballygunge", city: "Kolkata", state: "West Bengal", price: 80, type: "house", lat: 22.5261, lng: 88.3639, rating: 4.9, img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800" },
  { title: "Cozy Studio near Park Street", city: "Kolkata", state: "West Bengal", price: 35, type: "apartment", lat: 22.5510, lng: 88.3505, rating: 4.6, img: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800" },
  { title: "Luxury Penthouse in New Town", city: "Kolkata", state: "West Bengal", price: 150, type: "apartment", lat: 22.6065, lng: 88.4618, rating: 5.0, img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800" },
  { title: "Sea-view Villa in Juhu", city: "Mumbai", state: "Maharashtra", price: 300, type: "villa", lat: 19.1035, lng: 72.8265, rating: 5.0, img: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800" },
  { title: "Cosy Flat in Bandra West", city: "Mumbai", state: "Maharashtra", price: 120, type: "apartment", lat: 19.0596, lng: 72.8295, rating: 4.8, img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800" },
  { title: "Modern Condo in Powai", city: "Mumbai", state: "Maharashtra", price: 95, type: "condo", lat: 19.1197, lng: 72.9050, rating: 4.7, img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800" },
  { title: "Traditional Home in Indiranagar", city: "Bangalore", state: "Karnataka", price: 70, type: "house", lat: 12.9784, lng: 77.6408, rating: 4.8, img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800" },
  { title: "Tech Park Apartment in Whitefield", city: "Bangalore", state: "Karnataka", price: 55, type: "apartment", lat: 12.9698, lng: 77.7499, rating: 4.6, img: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800" },
  { title: "Luxury Villa in DLF Phase 5", city: "Gurgaon", state: "Haryana", price: 200, type: "villa", lat: 28.4089, lng: 77.0423, rating: 4.9, img: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800" },
  { title: "Elegant Flat in Connaught Place", city: "Delhi", state: "Delhi", price: 90, type: "apartment", lat: 28.6315, lng: 77.2167, rating: 4.7, img: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800" },
  { title: "Heritage Haveli in Hauz Khas", city: "Delhi", state: "Delhi", price: 130, type: "house", lat: 28.5535, lng: 77.2020, rating: 4.9, img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800" },
  { title: "Beachfront Cottage in Calangute", city: "Goa", state: "Goa", price: 110, type: "house", lat: 15.5440, lng: 73.7525, rating: 4.8, img: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800" },
  { title: "Private Villa in Anjuna", city: "Goa", state: "Goa", price: 180, type: "villa", lat: 15.5736, lng: 73.7404, rating: 5.0, img: "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=800" },
  { title: "Mountain View Cottage in Manali", city: "Manali", state: "Himachal Pradesh", price: 60, type: "house", lat: 32.2396, lng: 77.1887, rating: 4.8, img: "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800" },
  { title: "Lakeside Retreat in Nainital", city: "Nainital", state: "Uttarakhand", price: 75, type: "house", lat: 29.3803, lng: 79.4636, rating: 4.9, img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800" },
  { title: "Heritage Apartment in T Nagar", city: "Chennai", state: "Tamil Nadu", price: 50, type: "apartment", lat: 13.0418, lng: 80.2341, rating: 4.6, img: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800" },
  { title: "Townhouse in Jubilee Hills", city: "Hyderabad", state: "Telangana", price: 85, type: "townhouse", lat: 17.4225, lng: 78.4068, rating: 4.7, img: "https://images.unsplash.com/photo-1520342868574-5fa3804e551c?w=800" },
];

async function addIndian() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected");
    let host = await User.findOne({ role: "host" });
    let ok = 0;
    for (let i = 0; i < INDIAN_LISTINGS.length; i++) {
      const l = INDIAN_LISTINGS[i];
      try {
        await Listing.create({
          title: l.title,
          description: "A beautiful property in " + l.city + ", " + l.state + ". Perfect for your stay with modern amenities and great hospitality.",
          propertyType: l.type, roomType: "entire_place", host: host._id,
          guests: 4, bedrooms: 2, beds: 2, bathrooms: 1,
          location: { address: "Near " + l.city + " Center", city: l.city, state: l.state, country: "India", zipCode: "700001", latitude: l.lat, longitude: l.lng },
          pricing: { basePrice: l.price, currency: "USD", cleaningFee: 10, serviceFee: 8 },
          images: [{ url: l.img, isCover: true }],
          amenities: { basics: { wifi: true, kitchen: true, airConditioning: true, heating: true }, features: { tv: true, washer: true }, safety: { smokeDetector: true } },
          status: "published", averageRating: l.rating, totalReviews: Math.floor(Math.random() * 40) + 5,
        });
        ok++;
        process.stdout.write(".");
      } catch(e) { console.error("\nSkip:", l.title, e.message); }
    }
    console.log("\nAdded " + ok + " Indian listings. Total now includes Kolkata, Mumbai, Delhi, Goa etc.");
  } catch(e) { console.error(e.message); }
  finally { await mongoose.disconnect(); process.exit(0); }
}
addIndian();
