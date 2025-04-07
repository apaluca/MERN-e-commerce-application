# ReactRetail Project (MERN stack application)

A full-stack e-commerce application using MongoDB, Express, React with Vite, and Node.js with Tailwind CSS.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, Mongoose, JWT Authentication
- **Database:** MongoDB

## Quick Setup

### Prerequisites
- Node.js (v22.14 recommended)
- MongoDB installed and running

### Installation

```bash
# Clone repository
git clone https://github.com/apaluca/ReactRetail.git
cd ReactRetail

# Backend setup
cd server
npm install
cp .env.example .env  # Configure your environment variables

# Frontend setup
cd ../client
npm install
```

### Seeding Test Data
```bash
# Seed database with test users, products and orders
cd server
npm run seed

# To clear and re-seed the database
npm run seed:clear
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

### Test Accounts
- Admin: admin@example.com / password123
- User: user@example.com / password123

## Project Structure

```
ReactRetail/
├── client/                   # React frontend (Vite + Tailwind)
│   ├── public/               # Static files
│   └── src/                  # Source files
│       ├── api/              # API service
│       ├── components/       # Reusable UI components
│       ├── context/          # React Context for state management
│       └── pages/            # Page components
│           └── admin/        # Admin-only pages
└── server/                   # Node.js backend
    ├── middleware/           # Express middleware
    ├── models/               # Mongoose models
    ├── routes/               # Express routes
    ├── seed.js               # Database seeding script
    └── server.js             # Entry point
```

## Features

- User authentication (login/register) with JWT
- Role-based access control (user/admin)
- Product browsing and filtering
- Shopping cart management
- Checkout process
- Order history
- Admin dashboard for user, product, and order management
- Responsive design with Tailwind CSS

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