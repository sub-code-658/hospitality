const Application = require('../models/Application');
const Event = require('../models/Event');
const Message = require('../models/Message');
const User = require('../models/User');
const Notification = require('../models/Notification');
const checkScheduleConflict = require('../utils/scheduleConflict');
const { sendEmailNotification, sendSMSNotification } = require('../utils/notificationService');

// Apply to an event (worker only)
exports.applyToEvent = async (req, res, next) => {
  try {
    if (req.user.role !== 'worker') {
      return res.status(403).json({ message: 'Only workers can apply to events' });
    }

    const { eventId, message, roleAppliedFor } = req.body;

    // Check if event exists
    const event = await Event.findById(eventId).populate('organizer', 'name email phone');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.status !== 'active') {
      return res.status(400).json({ message: 'This event is no longer accepting applications' });
    }

    // Check if event is fully staffed
    const acceptedCount = await Application.countDocuments({
      event: eventId,
      status: 'accepted'
    });
    if (acceptedCount >= event.totalPositions) {
      return res.status(400).json({ message: 'This event is fully staffed' });
    }

    // Check for existing application
    const existingApplication = await Application.findOne({
      worker: req.user.id,
      event: eventId
    });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied to this event' });
    }

    // Check for schedule conflict
    const { hasConflict, conflictingEvent } = await checkScheduleConflict(req.user.id, eventId);
    if (hasConflict) {
      return res.status(400).json({
        message: 'Schedule conflict detected',
        conflictingEvent
      });
    }

    const application = new Application({
      worker: req.user.id,
      event: eventId,
      message: message || '',
      roleAppliedFor: roleAppliedFor || ''
    });

    await application.save();

    const populatedApplication = await Application.findById(application._id)
      .populate('event', 'title eventDate startTime endTime location')
      .populate('worker', 'name email skills experience rating');

    // Trigger email notification to organizer
    if (event.organizer && event.organizer.email) {
      const emailSubject = `New Application for ${event.title}`;
      const emailHtml = `
        <h3>New Worker Application</h3>
        <p>Dear ${event.organizer.name || 'Organizer'},</p>
        <p>A worker has applied for your event <strong>${event.title}</strong>.</p>
        <ul>
          <li><strong>Worker:</strong> ${populatedApplication.worker.name || 'Anonymous'}</li>
          <li><strong>Applied Role:</strong> ${roleAppliedFor || 'General Staff'}</li>
          <li><strong>Rating:</strong> ${populatedApplication.worker.rating} / 5</li>
        </ul>
        <p>Log in to your dashboard to review and manage applications.</p>
      `;
      sendEmailNotification(event.organizer.email, emailSubject, emailHtml).catch(console.error);
    }

    // In-app notification to organizer
    if (event.organizer) {
      const organizerId = event.organizer._id || event.organizer;
      const notification = new Notification({
        user: organizerId,
        content: `New application received for ${event.title} from ${populatedApplication.worker.name || 'Anonymous'}`,
        type: 'application',
        link: `/event/${event._id}`
      });
      await notification.save();
      
      const io = req.app.get('io');
      if (io) {
        io.to(organizerId.toString()).emit('newNotification', notification);
        // Navbar currently fetches notifications on 'newMessage'
        io.to(organizerId.toString()).emit('newMessage', {}); 
      }
    }

    res.status(201).json(populatedApplication);
  } catch (error) {
    next(error);
  }
};

// Get worker's applications
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ worker: req.user.id })
      .populate('event', 'title eventDate startTime endTime location status coordinates organizer')
      .populate('worker', 'name email skills experience rating')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// Get applications for an event (organizer only)
exports.getEventApplications = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check ownership or admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const applications = await Application.find({ event: req.params.eventId })
      .populate('worker', 'name email skills experience rating avatar totalReviews')
      .sort({ appliedAt: -1 });

    res.json(applications);
  } catch (error) {
    next(error);
  }
};

// Update application status (accept/reject)
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await Application.findById(req.params.id)
      .populate('event')
      .populate('worker', 'name email phone');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check ownership or admin
    if (application.event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    application.status = status;
    await application.save();

    // If accepting, update positions and notify
    if (status === 'accepted') {
      // Update event's filled positions
      const acceptedCount = await Application.countDocuments({
        event: application.event._id,
        status: 'accepted'
      });
      await Event.findByIdAndUpdate(application.event._id, {
        filledPositions: acceptedCount
      });

      // Send notification message
      const messageContent = `Congratulations! Your application for "${application.event.title}" has been accepted.\n\nEvent details:\nDate: ${new Date(application.event.eventDate).toLocaleDateString('en-US')}\nTime: ${application.event.startTime} - ${application.event.endTime}\nLocation: ${application.event.location}\n\nPlease arrive on time.`;

      const systemMessage = new Message({
        sender: req.user.id,
        receiver: application.worker._id,
        content: messageContent
      });
      await systemMessage.save();

      // Emit socket event
      const io = req.app.get('io');
      if (io) {
        io.to(application.worker._id.toString()).emit('newMessage', {
          sender: { _id: req.user.id, name: 'System' },
          receiver: application.worker._id,
          content: messageContent,
          sentAt: systemMessage.sentAt
        });
      }
    }

    // Trigger offline notifications (Email/SMS) to the worker
    if (application.worker && application.worker.email) {
      const isAccepted = status === 'accepted';
      const emailSubject = isAccepted 
        ? `Application Accepted - ${application.event.title}`
        : `Application Update - ${application.event.title}`;
      
      const emailHtml = isAccepted
        ? `<h3>Congratulations!</h3><p>Your application for <strong>${application.event.title}</strong> has been accepted.</p><p>Please log in to check your shift notes and schedule.</p>`
        : `<h3>Application Update</h3><p>Thank you for applying to <strong>${application.event.title}</strong>.</p><p>Unfortunately, your application was not accepted at this time. Keep looking for shifts on EventStaff Nepal!</p>`;

      const smsText = isAccepted
        ? `Congratulations! Your application for "${application.event.title}" has been accepted. Check your dashboard for details.`
        : `Update: Your application for "${application.event.title}" was not accepted. Keep looking for other shifts!`;

      // Dispatch async
      sendEmailNotification(application.worker.email, emailSubject, emailHtml).catch(console.error);
      if (application.worker.phone) {
        sendSMSNotification(application.worker.phone, smsText).catch(console.error);
      }
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

// Assign role and shift notes
exports.assignWorker = async (req, res, next) => {
  try {
    const { assignedRole, shiftNotes } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('event')
      .populate('worker', 'name');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({ message: 'Only accepted applications can be assigned' });
    }

    application.assignedRole = assignedRole || application.assignedRole;
    application.shiftNotes = shiftNotes || application.shiftNotes;
    application.assigned = true;
    application.assignedAt = new Date();
    application.assignedBy = req.user.id;

    await application.save();

    // Send assignment notification
    const messageContent = `You have been assigned to the "${application.assignedRole || 'event role'}" role for "${application.event.title}".\n\nDate: ${new Date(application.event.eventDate).toLocaleDateString('en-US')}\nTime: ${application.event.startTime} - ${application.event.endTime}\nLocation: ${application.event.location}\n\n${application.shiftNotes ? `Shift details: ${application.shiftNotes}\n\n` : ''}Please arrive on time.`;

    const systemMessage = new Message({
      sender: req.user.id,
      receiver: application.worker._id,
      content: messageContent
    });
    await systemMessage.save();

    const io = req.app.get('io');
    if (io) {
      io.to(application.worker._id.toString()).emit('newMessage', {
        sender: { _id: req.user.id },
        receiver: application.worker._id,
        content: messageContent,
        sentAt: systemMessage.sentAt
      });
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

// Get application by ID
exports.getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('worker', 'name email skills experience rating avatar')
      .populate('event');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};