const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Event = require('../models/Event');
const Application = require('../models/Application');
const { auth, adminOnly } = require('../middleware/auth');

// Get admin dashboard stats
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalWorkers, totalOrganizers, totalEvents, activeEvents, totalApplications, pendingApplications] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'worker' }),
      User.countDocuments({ role: 'organizer' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'active' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' })
    ]);

    const totalRevenue = await Application.aggregate([
      { $match: { status: 'accepted' } },
      { $group: { _id: null, total: { $sum: '$proposedPay' } } }
    ]);

    res.json({
      totalUsers,
      totalWorkers,
      totalOrganizers,
      totalEvents,
      activeEvents,
      totalApplications,
      pendingApplications,
      totalRevenue: totalRevenue[0]?.total || 0
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events
router.get('/events', auth, adminOnly, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    res.json({ events });
  } catch (error) {
    console.error('Admin events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify a user
router.put('/users/:id/verify', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isVerified: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/events/:id', auth, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;