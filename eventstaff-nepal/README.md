# EventStaff Nepal

Smart Event Staffing Made Easy - Connect event organizers with professional hospitality workers across Nepal.

## Tech Stack

- **Frontend**: React.js with Vite, Tailwind CSS, React Router, Socket.IO Client, Leaflet.js
- **Backend**: Node.js, Express.js, Socket.IO
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens

## Features

- User registration and authentication (Organizers & Workers)
- Event posting and management for organizers
- Job browsing and applications for workers
- Smart scheduling (prevents double-booking)
- Real-time messaging via Socket.IO
- Location mapping with Leaflet.js
- Ratings and reviews system

## Project Structure

```
eventstaff-nepal/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── server/                 # Node.js backend
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── index.js
│   ├── seed.js
│   └── package.json
├── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (running locally or via MongoDB Atlas)
- npm or yarn

### Installation

1. **Install root dependencies**
   ```bash
   cd eventstaff-nepal
   npm install
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod

   # Or use MongoDB Atlas connection string in .env
   ```

5. **Seed the database (creates test data)**
   ```bash
   cd ../server
   node seed.js
   ```

6. **Run the application**
   ```bash
   # From root directory
   npm run dev
   ```

   This will start both the server (on port 5000) and client (on port 5173).

7. **Access the application**
   Open your browser to: http://localhost:5173

## Test Accounts

After running `node seed.js`, you can use these accounts:

### Organizers
- Email: `rajesh@events.com` / Password: `password123`
- Email: `priya@weddings.com` / Password: `password123`

### Workers
- Email: `amit@gmail.com` / Password: `password123`
- Email: `sita@gmail.com` / Password: `password123`
- Email: `ramesh@gmail.com` / Password: `password123`

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Runs both server and client concurrently |
| `npm run server` | Runs only the backend server |
| `npm run client` | Runs only the frontend client |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create event (organizer only)
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/organizer/my-events` - Get organizer's events

### Applications
- `POST /api/applications` - Apply to event (worker only)
- `GET /api/applications/my` - Get worker's applications
- `GET /api/applications/event/:eventId` - Get event applications (organizer)
- `PUT /api/applications/:id/status` - Accept/reject application

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews/user/:userId` - Get user reviews

### Messages
- `GET /api/messages/conversations` - Get all conversations
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages` - Send message

## Environment Variables

Server-side (.env):
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/eventstaff
JWT_SECRET=eventstaff_secret_key_2025
```

## License

MIT License
