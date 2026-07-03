const Invitation = require('../models/Invitation');
const Event = require('../models/Event');
const User = require('../models/User');

exports.createInvitation = async (req, res, next) => {
  try {
    const { eventId, workerId, message } = req.body;
    
    // Validate roles
    if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only organizers can send invitations' });
    }

    // Verify event exists and belongs to organizer
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only invite staff to your own events' });
    }

    // Check if worker exists
    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Check if invitation already exists
    const existingInv = await Invitation.findOne({ event: eventId, worker: workerId });
    if (existingInv) {
      return res.status(400).json({ message: 'Worker has already been invited to this event' });
    }

    const invitation = new Invitation({
      event: eventId,
      worker: workerId,
      organizer: req.user.id,
      message
    });

    await invitation.save();
    
    // Optionally create a notification here
    
    res.status(201).json({
      success: true,
      data: invitation
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Worker has already been invited to this event' });
    }
    next(error);
  }
};
