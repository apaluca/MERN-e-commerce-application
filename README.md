# LucEst Project (MERN stack application)

A full-stack e-commerce application using MongoDB, Express, React with Vite, and Node.js with Tailwind CSS.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, Mongoose, JWT Authentication
- **Database:** MongoDB

## Quick Setup

### Prerequisites
- Node.js (v22.14 recommended)
- MongoDB installed and running (ideally as a Docker container)

### Installation

```bash
# Clone repository
git clone https://github.com/apaluca/MERN-e-commerce-application.git
cd LucEst

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
LucEst/
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

- **Authentication System**
  - Secure login page with JWT-based authentication 
  - User registration with validation
  - Persistent session management for authenticated users

- **Role-Based Access Control**
  - Three distinct user roles: Guest (non-authenticated), User, and Admin
  - Different navigation options and permissions based on user role
  - Protected routes to prevent unauthorized access

- **Admin Dashboard**
  - User management panel (create, edit, delete, activate/deactivate accounts)
  - Product management with image gallery support
  - Order processing workflow (pending, processing, shipped, delivered)
  - Sales analytics and inventory management

- **Product Catalog**
  - Filterable and searchable product listings displayed in responsive tables
  - Category-based navigation
  - Pagination for product listings
  - Detailed product pages with image galleries

- **Shopping Experience**
  - Complete e-commerce workflow implementation
  - Shopping cart with quantity adjustments
  - Checkout process with address and payment method selection
  - Order confirmation and history

- **Responsive Design**
  - Mobile-first approach with Tailwind CSS
  - Adaptive layouts that work on desktop, tablet, and mobile devices
  - Optimized navigation for different screen sizes

- **Review System**
  - Product reviews with star ratings
  - Only verified purchasers can leave reviews
  - Users can see their review history

- **Data Persistence**
  - MongoDB database with Mongoose schemas
  - User data and sessions storage
  - Complete order history and product catalog

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