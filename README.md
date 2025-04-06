# MERN Stack Project

A full-stack application using MongoDB, Express, React with Vite, and Node.js with Tailwind CSS.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB

## Quick Setup

### Prerequisites
- Node.js (v22.14 recommended)
- MongoDB installed and running

### Installation

```bash
# Clone repository
git clone https://github.com/apaluca/react-retail.git
cd react-retail

# Backend setup
cd server
npm install
cp .env.example .env  # Configure your environment variables

# Frontend setup
cd ../client
npm install
```

### Environment Configuration
Create a `.env` file in the server directory:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/react-retail
```

### Running the Application

```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm run dev
```

Access:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Project Structure

```
mern-project/
├── client/          # React frontend (Vite + Tailwind)
│   ├── public/      # Static files
│   └── src/         # Source files
│       ├── api/     # API service
│       └── components/
└── server/          # Node.js backend
    ├── models/      # Mongoose models
    ├── routes/      # Express routes
    └── server.js    # Entry point
```

## Development

### Building for Production
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```

## License

[MIT License](LICENSE)