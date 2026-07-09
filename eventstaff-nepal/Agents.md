# EventStaff Nepal

Event staffing platform connecting event organizers with hospitality workers in Nepal.

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS + React Router
- **Backend**: Express.js + MongoDB + Socket.IO
- **Auth**: JWT-based authentication

## Project Structure

```
eventstaff-nepal/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/axios.js    # API client (connects to :5001)
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # AuthContext, ToastContext
│   │   └── pages/          # Page components
├── server/                 # Express backend
│   ├── models/             # Mongoose models (User, Event, Application, Review, Message)
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── socket/             # Socket.IO setup
│   └── index.js            # Server entry point
└── package.json            # Root package with concurrently for dev
```

## Running the App

```bash
cd eventstaff-nepal
npm run dev    # Runs both server (:5001) and client (:5173) concurrently
```

## Port Configuration

- **Client**: `http://localhost:5173` (Vite default)
- **Server**: `http://localhost:5001` (from server/.env PORT=5001)
- **MongoDB**: `mongodb://localhost:27017/eventstaff`

## Key Routes

**Frontend Pages:**
- `/` - HomePage
- `/login` - LoginPage
- `/register` - RegisterPage
- `/dashboard` - OrganizerDashboard (protected)
- `/worker-dashboard` - WorkerDashboard (protected)
- `/post-event` - PostEventPage (protected)
- `/events/:id` - EventDetailPage
- `/messages` - MessagesPage (protected)
- `/profile` - ProfilePage (protected)

**API Endpoints:**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `GET /api/events` - List events
- `POST /api/events` - Create event (protected)
- `GET /api/applications` - List applications

## User Roles

- `organizer` - Can post events, review applications, leave reviews
- `worker` - Can browse events, apply, receive reviews

## Notes

- Socket.IO runs on the server for real-time messaging
- JWT token stored in localStorage with 7-day expiration
- API axios instance has interceptor for 401 redirect to login