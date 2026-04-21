const Event = require('../models/Event');
const Application = require('../models/Application');

// Helper to calculate total positions from roles
const calculateTotalPositions = (rolesNeeded) => {
  return (rolesNeeded || []).reduce((sum, role) => sum + (role.count || 0), 0);
};

// Helper to build event meta
const buildEventMeta = async (event) => {
  if (!event) return null;

  const totalPositions = calculateTotalPositions(event.rolesNeeded);
  const acceptedCount = await Application.countDocuments({
    event: event._id,
    status: 'accepted'
  });

  return {
    ...event.toObject(),
    totalPositions,
    acceptedCount,
    filled: acceptedCount >= totalPositions
  };
};

// Get all events (public)
exports.getAllEvents = async (req, res, next) => {
  try {
    const { search, status, date, role, location, page = 1, limit = 10 } = req.query;
    let query = {};

    // Default to active status if not specified
    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }

    if (date) {
      query.eventDate = date;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter - check if any role in rolesNeeded matches
    if (role) {
      query['rolesNeeded.roleName'] = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [events, totalCount] = await Promise.all([
      Event.find(query)
        .populate('organizer', 'name email rating totalReviews avatar')
        .sort({ eventDate: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Event.countDocuments(query)
    ]);

    const eventsWithMeta = await Promise.all(events.map(buildEventMeta));

    res.json({
      events: eventsWithMeta,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNextPage: skip + events.length < totalCount,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get organizer's events
exports.getOrganizerEvents = async (req, res, next) => {
  try {
    const events = await Event.find({ organizer: req.user.id })
      .sort({ createdAt: -1 });

    const eventsWithMeta = await Promise.all(events.map(async (event) => {
      const applicationCount = await Application.countDocuments({ event: event._id });
      const acceptedCount = await Application.countDocuments({
        event: event._id,
        status: 'accepted'
      });
      const totalPositions = calculateTotalPositions(event.rolesNeeded);

      return {
        ...event.toObject(),
        applicationCount,
        acceptedCount,
        totalPositions,
        filled: acceptedCount >= totalPositions
      };
    }));

    res.json(eventsWithMeta);
  } catch (error) {
    next(error);
  }
};

// Get single event by ID
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email rating totalReviews avatar bio phone');

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventWithMeta = await buildEventMeta(event);
    res.json(eventWithMeta);
  } catch (error) {
    next(error);
  }
};

// Create event (organizer only)
exports.createEvent = async (req, res, next) => {
  try {
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only organizers can create events' });
    }

    const { title, description, location, eventDate, startTime, endTime, rolesNeeded, coordinates, imageUrl } = req.body;

    const totalPositions = calculateTotalPositions(rolesNeeded);

    const event = new Event({
      title,
      description,
      location,
      eventDate,
      startTime,
      endTime,
      rolesNeeded,
      organizer: req.user.id,
      coordinates: coordinates || { lat: 27.7172, lng: 85.3240 },
      totalPositions,
      imageUrl: imageUrl || ''
    });

    await event.save();
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

// Update event
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, location, eventDate, startTime, endTime, rolesNeeded, status, coordinates, imageUrl } = req.body;

    // Update fields
    if (title) event.title = title;
    if (description) event.description = description;
    if (location) event.location = location;
    if (eventDate) event.eventDate = eventDate;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (rolesNeeded) {
      event.rolesNeeded = rolesNeeded;
      event.totalPositions = calculateTotalPositions(rolesNeeded);
    }
    if (status) event.status = status;
    if (coordinates) event.coordinates = coordinates;
    if (imageUrl !== undefined) event.imageUrl = imageUrl;

    await event.save();
    res.json(event);
  } catch (error) {
    next(error);
  }
};

// Delete event
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Delete event and related applications
    await Promise.all([
      Event.findByIdAndDelete(req.params.id),
      Application.deleteMany({ event: req.params.id })
    ]);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};