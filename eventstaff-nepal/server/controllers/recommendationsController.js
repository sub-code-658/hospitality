const User = require('../models/User');
const Event = require('../models/Event');

// Get worker recommendations for an event
exports.getWorkerRecommendations = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) {
       return res.status(403).json({ message: 'Not authorized' });
    }

    const neededSkills = event.rolesNeeded.map(r => r.roleName);
    
    // Find workers who have at least one needed skill and are available
    const workers = await User.find({
      role: 'worker',
      isAvailable: true,
      skills: { $in: neededSkills }
    }).select('-password');

    // Simple recommendation scoring
    const scoredWorkers = workers.map(worker => {
      let score = 0;
      // Match skills count
      const matchedSkills = worker.skills.filter(s => neededSkills.includes(s));
      score += matchedSkills.length * 10;
      
      // Factor in rating
      score += (worker.rating || 0) * 5;
      
      // Factor in total reviews
      score += Math.min(worker.totalReviews || 0, 50) * 0.2;
      
      // Experience
      if (worker.experience === '5+ years') score += 15;
      else if (worker.experience === '3-5 years') score += 10;
      else if (worker.experience === '1-3 years') score += 5;
      
      return { worker, score };
    });

    // Sort by score descending
    scoredWorkers.sort((a, b) => b.score - a.score);
    
    res.json(scoredWorkers.map(sw => sw.worker));
  } catch (err) {
    next(err);
  }
};

// Get event recommendations for a worker
exports.getEventRecommendations = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'worker') {
      return res.status(403).json({ message: 'Only workers can get event recommendations' });
    }
    
    const workerSkills = user.skills || [];
    
    // Find active events
    const events = await Event.find({ status: 'active' }).populate('organizer', 'name organizationName avatar rating');
    
    // Score events
    const scoredEvents = events.map(event => {
      let score = 0;
      let matchesSkill = false;
      
      event.rolesNeeded.forEach(role => {
        if (workerSkills.includes(role.roleName)) {
          matchesSkill = true;
          score += 20; // High weight for matching skill
          
          // Higher pay = higher score
          score += (role.payAmount || 0) * 0.01;
        }
      });
      
      // If organizer is highly rated
      if (event.organizer && event.organizer.rating) {
        score += event.organizer.rating * 2;
      }
      
      // Date proximity (upcoming events score slightly higher)
      const daysUntil = (new Date(event.eventDate) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntil >= 0 && daysUntil <= 7) score += 10;
      else if (daysUntil > 7 && daysUntil <= 30) score += 5;
      
      return { event, score, matchesSkill };
    }).filter(se => se.matchesSkill && !se.event.isFilled); // only events with matching skills and not filled
    
    // Sort descending
    scoredEvents.sort((a, b) => b.score - a.score);
    
    res.json(scoredEvents.map(se => se.event));
  } catch (err) {
    next(err);
  }
};
