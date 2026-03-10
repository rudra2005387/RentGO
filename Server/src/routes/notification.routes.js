const express = require('express');
const { verifyToken } = require('../middleware/auth.middleware');
const { Notification } = require('../models');
const { asyncHandler } = require('../middleware/error.middleware');

const router = express.Router();

/**
 * Get all notifications for the authenticated user
 * GET /api/notifications
 */
router.get('/', verifyToken, asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.userId })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    data: notifications
  });
}));

/**
 * Mark a single notification as read
 * PUT /api/notifications/:id/read
 */
router.put('/:id/read', verifyToken, asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }

  res.json({ success: true, data: notification });
}));

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
router.put('/read-all', verifyToken, asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user.userId, isRead: false },
    { isRead: true }
  );

  res.json({ success: true, message: 'All notifications marked as read' });
}));

module.exports = router;
