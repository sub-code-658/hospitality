const Event = require('../models/Event');
const Application = require('../models/Application');

/**
 * Check if a worker has a scheduling conflict with a new event
 * @param {string} workerId - The worker's ID
 * @param {string} newEventId - The new event's ID to check against
 * @returns {Object} { hasConflict: Boolean, conflictingEvent: Object or null }
 */
const checkScheduleConflict = async (workerId, newEventId) => {
  try {
    // Fetch the new event details
    const newEvent = await Event.findById(newEventId);
    if (!newEvent) {
      return { hasConflict: false, conflictingEvent: null };
    }

    // Get the new event's date and time range
    const newEventDate = new Date(newEvent.eventDate);
    const [newStartHour, newStartMin] = (newEvent.startTime || '00:00').split(':').map(Number);
    const [newEndHour, newEndMin] = (newEvent.endTime || '00:00').split(':').map(Number);

    const newStartTime = new Date(newEventDate);
    newStartTime.setHours(newStartHour, newStartMin, 0, 0);

    const newEndTime = new Date(newEventDate);
    newEndTime.setHours(newEndHour, newEndMin, 0, 0);

    // Find all ACCEPTED applications for this worker
    const acceptedApplications = await Application.find({
      worker: workerId,
      status: 'accepted'
    }).populate('event');

    // Check each existing accepted event for conflicts
    for (const application of acceptedApplications) {
      const existingEvent = application.event;

      // Skip the new event itself
      if (existingEvent._id.toString() === newEventId) {
        continue;
      }

      const existingEventDate = new Date(existingEvent.eventDate);

      // Check if same date
      if (newEventDate.toDateString() === existingEventDate.toDateString()) {
        const [existStartHour, existStartMin] = (existingEvent.startTime || '00:00').split(':').map(Number);
        const [existEndHour, existEndMin] = (existingEvent.endTime || '00:00').split(':').map(Number);

        const existStart = new Date(existingEventDate);
        existStart.setHours(existStartHour, existStartMin, 0, 0);

        const existEnd = new Date(existingEventDate);
        existEnd.setHours(existEndHour, existEndMin, 0, 0);

        // Check for time overlap
        // Two ranges overlap if: (StartA <= EndB) and (EndA >= StartB)
        const rangesOverlap = (
          (newStartTime >= existStart && newStartTime < existEnd) ||
          (newEndTime > existStart && newEndTime <= existEnd) ||
          (newStartTime <= existStart && newEndTime >= existEnd)
        );

        if (rangesOverlap) {
          return {
            hasConflict: true,
            conflictingEvent: {
              _id: existingEvent._id,
              title: existingEvent.title,
              eventDate: existingEvent.eventDate,
              startTime: existingEvent.startTime,
              endTime: existingEvent.endTime,
              location: existingEvent.location
            }
          };
        }
      }
    }

    return { hasConflict: false, conflictingEvent: null };
  } catch (error) {
    console.error('Schedule conflict check error:', error);
    throw error;
  }
};

module.exports = checkScheduleConflict;