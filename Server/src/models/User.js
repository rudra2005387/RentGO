const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: 2
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: 2
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false // Don't return password by default
    },
    phone: {
      type: String,
      trim: true
    },

    // Profile Information
    profileImage: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: 500
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    dateOfBirth: {
      type: Date
    },

    // User Role
    role: {
      type: String,
      enum: ['guest', 'host', 'admin'],
      default: 'guest'
    },

    // Host Information
    hostInfo: {
      aboutSpace: String,
      responseRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      responseTime: String,
      joinDate: Date,
      identityVerified: {
        type: Boolean,
        default: false
      },
      superhost: {
        type: Boolean,
        default: false
      }
    },

    // Account Status
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isIdentityVerified: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },

    // Preferences
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
      },
      currency: {
        type: String,
        default: 'USD'
      },
      language: {
        type: String,
        default: 'en'
      }
    },

    // Statistics
    stats: {
      totalBookings: { type: Number, default: 0 },
      totalRatings: { type: Number, default: 0 },
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 }
    },

    // Wishlist
    wishlist: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing'
    }],

    // Payment Methods
    paymentMethods: [{
      type: {
        type: String,
        enum: ['card', 'bank_account', 'paypal'],
        required: true
      },
      isDefault: Boolean,
      last4: String,
      expiryMonth: Number,
      expiryYear: Number
    }],

    // Security
    failedLoginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: Date,
    lastLogin: Date
  },
  {
    timestamps: true
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user profile (without sensitive data)
userSchema.methods.getProfile = function() {
  const userObj = this.toObject();
  delete userObj.password;
  delete userObj.failedLoginAttempts;
  delete userObj.lockUntil;
  return userObj;
};

module.exports = mongoose.model('User', userSchema);
