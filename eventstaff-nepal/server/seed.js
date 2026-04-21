const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

require('dotenv').config({ path: __dirname + '/.env' });

const User = require('./models/User');
const Event = require('./models/Event');
const Application = require('./models/Application');
const Review = require('./models/Review');
const Message = require('./models/Message');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Application.deleteMany({});
    await Review.deleteMany({});
    await Message.deleteMany({});
    console.log('Cleared existing data');

    // Create organizers
    const hashedPassword = await bcrypt.hash('password123', 10);

    const organizers = await User.create([
      {
        name: 'Rajesh Sharma',
        email: 'rajesh@events.com',
        password: hashedPassword,
        role: 'organizer'
      },
      {
        name: 'Priya Thapa',
        email: 'priya@weddings.com',
        password: hashedPassword,
        role: 'organizer'
      }
    ]);
    console.log('Created 2 organizers');

    // Create workers
    const workers = await User.create([
      {
        name: 'Amit Gurung',
        email: 'amit@gmail.com',
        password: hashedPassword,
        role: 'worker',
        skills: ['Waiter', 'Bartender'],
        experience: '3-5 years'
      },
      {
        name: 'Sita Kumari',
        email: 'sita@gmail.com',
        password: hashedPassword,
        role: 'worker',
        skills: ['Waiter', 'Host'],
        experience: '1-3 years'
      },
      {
        name: 'Ramesh Bhatta',
        email: 'ramesh@gmail.com',
        password: hashedPassword,
        role: 'worker',
        skills: ['Bartender', 'Security'],
        experience: '5+ years'
      }
    ]);
    console.log('Created 3 workers');

    // Create events with Kathmandu locations
    const events = await Event.create([
      {
        title: 'Luxury Wedding Reception',
        description: 'Grand wedding reception at Hotel Himalaya with 300+ guests. Need experienced staff for serving and guest management.',
        location: 'Hotel Himalaya, Kupondole',
        eventDate: new Date('2026-05-15'),
        startTime: '16:00',
        endTime: '22:00',
        rolesNeeded: [
          { roleName: 'Waiter', count: 8, payPerHour: 500 },
          { roleName: 'Host', count: 2, payPerHour: 600 }
        ],
        organizer: organizers[0]._id,
        status: 'active',
        coordinates: { lat: 27.6954, lng: 85.3155 }
      },
      {
        title: 'Corporate Gala Dinner',
        description: 'Annual corporate dinner for a major IT company. Formal event requiring professional staff.',
        location: 'Hyatt Regency, Kathmandu',
        eventDate: new Date('2026-05-20'),
        startTime: '18:00',
        endTime: '23:00',
        rolesNeeded: [
          { roleName: 'Waiter', count: 10, payPerHour: 550 },
          { roleName: 'Bartender', count: 2, payPerHour: 700 },
          { roleName: 'Host', count: 2, payPerHour: 650 }
        ],
        organizer: organizers[0]._id,
        status: 'active',
        coordinates: { lat: 27.7172, lng: 85.3142 }
      },
      {
        title: 'Traditional Nepali Wedding',
        description: 'Traditional Newari wedding ceremony and reception. Authentic cultural experience.',
        location: "Dwarika's Hotel",
        eventDate: new Date('2026-05-25'),
        startTime: '10:00',
        endTime: '18:00',
        rolesNeeded: [
          { roleName: 'Waiter', count: 6, payPerHour: 450 },
          { roleName: 'Chef', count: 3, payPerHour: 800 },
          { roleName: 'Security', count: 4, payPerHour: 500 }
        ],
        organizer: organizers[1]._id,
        status: 'active',
        coordinates: { lat: 27.7185, lng: 85.3058 }
      },
      {
        title: 'Birthday Celebration',
        description: 'Private birthday party for a prominent business family. Elegant garden party setting.',
        location: 'The Farm House, Godhwari',
        eventDate: new Date('2026-06-01'),
        startTime: '14:00',
        endTime: '20:00',
        rolesNeeded: [
          { roleName: 'Waiter', count: 4, payPerHour: 400 },
          { roleName: 'Host', count: 1, payPerHour: 500 }
        ],
        organizer: organizers[1]._id,
        status: 'active',
        coordinates: { lat: 27.7456, lng: 85.2891 }
      },
      {
        title: 'Product Launch Event',
        description: 'Major tech product launch with media presence. High-profile corporate event.',
        location: 'Yak & Yeti Hotel',
        eventDate: new Date('2026-06-10'),
        startTime: '09:00',
        endTime: '17:00',
        rolesNeeded: [
          { roleName: 'Host', count: 3, payPerHour: 700 },
          { roleName: 'Security', count: 2, payPerHour: 550 },
          { roleName: 'Waiter', count: 5, payPerHour: 500 }
        ],
        organizer: organizers[0]._id,
        status: 'active',
        coordinates: { lat: 27.7128, lng: 85.3131 }
      }
    ]);
    console.log('Created 5 events');

    // Create applications
    await Application.create([
      {
        worker: workers[0]._id,
        event: events[0]._id,
        status: 'accepted',
        message: 'I have 4 years of experience in wedding events. Happy to help!'
      },
      {
        worker: workers[1]._id,
        event: events[0]._id,
        status: 'pending',
        message: 'Looking forward to being part of this beautiful event.'
      },
      {
        worker: workers[0]._id,
        event: events[1]._id,
        status: 'pending'
      },
      {
        worker: workers[2]._id,
        event: events[1]._id,
        status: 'accepted',
        message: 'Expert bartender with experience in corporate events.'
      },
      {
        worker: workers[1]._id,
        event: events[2]._id,
        status: 'accepted'
      },
      {
        worker: workers[0]._id,
        event: events[3]._id,
        status: 'pending'
      }
    ]);
    console.log('Created applications');

    // Create reviews
    await Review.create([
      {
        reviewer: organizers[0]._id,
        reviewee: workers[0]._id,
        event: events[0]._id,
        rating: 5,
        comment: 'Excellent service! Very professional and punctual.'
      },
      {
        reviewer: organizers[1]._id,
        reviewee: workers[1]._id,
        event: events[2]._id,
        rating: 4,
        comment: 'Great host, handled guests very well.'
      },
      {
        reviewer: workers[0]._id,
        reviewee: organizers[0]._id,
        event: events[0]._id,
        rating: 5,
        comment: 'Well organized event. Enjoyed working with the team.'
      }
    ]);
    console.log('Created reviews');

    // Create messages
    await Message.create([
      {
        sender: workers[0]._id,
        receiver: organizers[0]._id,
        content: 'Hi, I wanted to confirm my attendance for the wedding event.',
        read: true
      },
      {
        sender: organizers[0]._id,
        receiver: workers[0]._id,
        content: 'Great! Please arrive by 3:30 PM for briefing.',
        read: true
      },
      {
        sender: workers[1]._id,
        receiver: organizers[1]._id,
        content: 'Thank you for considering my application!',
        read: false
      }
    ]);
    console.log('Created messages');

    console.log('\n✅ Seeding completed successfully!');
    console.log('\nTest accounts:');
    console.log('Organizer: rajesh@events.com / password123');
    console.log('Organizer: priya@weddings.com / password123');
    console.log('Worker: amit@gmail.com / password123');
    console.log('Worker: sita@gmail.com / password123');
    console.log('Worker: ramesh@gmail.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
