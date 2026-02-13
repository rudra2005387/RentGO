const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    console.log("⏳ Attempting to connect to MongoDB...");

    const maskedURI = mongoURI.includes("@")
      ? mongoURI.split("@")[0] + "@***"
      : mongoURI;

    console.log(`📍 Connection string: ${maskedURI}`);

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB connected successfully!");
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("\n❌ MongoDB connection failed!");
    console.error("Error:", error.message);

    process.exit(1); // stop server instead of infinite retry
  }
};

module.exports = connectDB;
