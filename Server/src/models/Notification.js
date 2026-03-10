const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['booking', 'payment', 'message', 'review', 'system', 'listing', 'cancellation'],
    default: 'booking'
  },
  title: {
    type: String,
    required: true
  },
  message: String,
  body: String,
  isRead: {
    type: Boolean,
    default: false
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
