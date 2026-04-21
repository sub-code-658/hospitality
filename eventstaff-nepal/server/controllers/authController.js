const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, skills, experience, organizationName, phone } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user (password will be hashed by pre-save hook)
    const userData = {
      name,
      email,
      password,
      role,
      skills: role === 'worker' ? skills : undefined,
      experience: role === 'worker' ? experience : undefined,
      organizationName: role === 'organizer' ? organizationName : undefined,
      phone: phone || ''
    };

    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        experience: user.experience,
        avatar: user.avatar,
        rating: user.rating
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
        experience: user.experience,
        avatar: user.avatar,
        bio: user.bio,
        phone: user.phone,
        organizationName: user.organizationName,
        rating: user.rating,
        totalReviews: user.totalReviews,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      experience: user.experience,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      organizationName: user.organizationName,
      rating: user.rating,
      totalReviews: user.totalReviews,
      isVerified: user.isVerified,
      isOnline: user.isOnline,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, bio, phone, skills, experience, avatar } = req.body;

    const updateData = { name };
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Worker-specific fields
    if (req.user.role === 'worker') {
      if (skills !== undefined) updateData.skills = skills;
      if (experience !== undefined) updateData.experience = experience;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      skills: user.skills,
      experience: user.experience,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      organizationName: user.organizationName,
      rating: user.rating,
      totalReviews: user.totalReviews,
      isVerified: user.isVerified
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

// Get user by ID (public profile)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      role: user.role,
      skills: user.skills,
      experience: user.experience,
      avatar: user.avatar,
      bio: user.bio,
      rating: user.rating,
      totalReviews: user.totalReviews,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};