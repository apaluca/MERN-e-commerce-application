# LucEst - MERN E-Commerce Platform

A full-featured e-commerce application built using the MERN stack (MongoDB, Express, React, Node.js) with Tailwind CSS for styling.

## Live Website & Test Accounts

**Live Website:** [https://lucest.ro](https://lucest.ro)

**Test Accounts:**
- Admin: admin@example.com / password123
- User: user@example.com / password123

## Tech Stack

- **Frontend:** React 18.2.0, Vite 6.2.0, Tailwind CSS 3.3.5, React Router 7.5.0
- **Backend:** Node.js 22.14, Express 4.18.2, Mongoose 7.5.3, JWT Authentication
- **Database:** MongoDB
- **Payment Processing:** Stripe API
- **Image Uploads:** Cloudinary

## Local Installation

> **Note:** Local installation is only necessary if the live website is unavailable or if you want to explore/modify the codebase.

### Prerequisites
- Node.js (v22.14 recommended)
- Docker Desktop (if using Docker for MongoDB)
- Git

### MongoDB Setup with Docker

1. Pull the MongoDB Docker Image
```bash
docker pull mongodb/mongodb-community-server:latest
```

2. Run the Image as a Container
```bash
docker run --name mongodb -p 27017:27017 -d mongodb/mongodb-community-server:latest
```

### Application Setup

```bash
# Clone repository
git clone https://github.com/apaluca/MERN-e-commerce-application.git
cd MERN-e-commerce-application

# Backend setup
cd server
npm install
cp .env.example .env  # Configure your environment variables

# Frontend setup
cd ../client
npm install
```

### Environment Variables Configuration

Update the `.env` file in the server directory with your own values:

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/lucest
JWT_SECRET=your_jwt_secret_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
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

## Project Structure

```
MERN-e-commerce-application/
├── client/                   # React frontend (Vite + Tailwind)
│   ├── public/               # Static files
│   ├── src/                  # Source files
│   │   ├── api/              # API service
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context for state management
│   │   └── pages/            # Page components
│   │       └── admin/        # Admin-only pages
│   ├── index.html            # Main HTML template
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   └── vite.config.js        # Vite configuration
└── server/                   # Node.js backend
    ├── middleware/           # Express middleware
    ├── models/               # Mongoose models
    ├── routes/               # Express routes
    ├── services/             # Service layer (e.g., Stripe integration)
    ├── utils/                # Utility functions (e.g., Cloudinary config)
    ├── seed.js               # Database seeding script
    └── server.js             # Entry point
```

## Features and Examples (Using Seeded Data)

### User Authentication & Authorization

**Functionality:**
- Secure login and registration system with email syntax verification on client-side
- User-specific dashboard showing account information and order history
- Different navigation options based on user role (Guest, User, Admin)
- Protected pages redirect unauthorized users to login

**Example Test Flow:**
1. Log in as a regular user (user@example.com / password123)
2. Navigate to Profile page to see the user's default shipping address (123 Main Street, Bucharest)
3. Log out and log in as admin (admin@example.com / password123) to observe how the navigation changes to include admin dashboard options

**Responsive Design:**
- Login/Register forms adapt to screen size, showing full-width inputs on mobile
- Navigation menu collapses to a hamburger menu on smaller screens
- Error messages are clearly displayed on all device sizes

### Product Browsing & Shopping Experience

**Functionality:**
- Interactive product catalog with dynamic filtering
- Product cards show key information (price, availability, images)
- Detailed product pages with multiple image galleries
- Interactive carousel of featured products on homepage
- Real-time stock availability indicators

**Example Test Flow:**
1. Visit the homepage to see the featured products carousel (should include "Smartphone X", "Laptop Pro", and "Wireless Headphones")
2. Go to "Shop by Category" and select "Electronics"
3. On the products page, use filters to find items within a specific price range (e.g., $800-$1300)
4. Select "Laptop Pro" ($1299.99) to view its detailed product page
5. Observe multiple images and product information

**Responsive Design:**
- Product grid adjusts columns based on screen size (4 columns on desktop, 2 on tablet, 1 on mobile)
- Product galleries use touch-friendly navigation on mobile devices
- Product carousel supports touch swipe gestures

### Shopping Cart & Checkout

**Functionality:**
- Add products to cart with quantity selection
- Real-time cart updates with pricing calculation
- Persistent cart that saves between sessions
- Multi-step checkout process with address and payment selection
- Order confirmation with detailed summary

**Example Test Flow:**
1. Log in as the regular user (user@example.com / password123)
2. Add "Smartphone X" ($899.99) to cart with a quantity of 1
3. Add "Wireless Headphones" ($249.99) to cart with a quantity of 2
4. Go to the cart page to review items (total should be $1,399.97)
5. Adjust quantities or remove items to test cart functionality
6. Proceed to checkout and review shipping information (pre-filled with user's address)
7. Select payment method and complete order
8. View order confirmation page and then check order history

### Product Reviews

**Functionality:**
- Star-based rating system (1-5 stars)

**Example Test Flow:**
1. Log in as the regular user (user@example.com / password123)
2. Navigate to Orders page to see delivered orders
3. Find a delivered order
4. Go to the product detail page for a product in the delivered order
5. Scroll down to the reviews section and submit a review with 5 stars
6. Log out and view the product again to see that reviews appear also to non-authenticated users

**Responsive Design:**
- Star selection works with both click and touch

### Admin Dashboard

**Functionality:**
- Comprehensive dashboard with sales analytics
- User management with role assignment
- Product CRUD operations with image uploads
- Order processing workflow management
- Site settings including carousel configurationx

**Example Test Flow:**
1. Log in as admin (admin@example.com / password123)
2. Navigate to Admin Dashboard to see overview statistics
3. Go to Product Management and edit "Laptop Pro"
   - Update price or description
   - Add/remove images
   - Update stock quantity
4. Go to Order Management and find a pending order
   - Change status to "processing" or "shipped"
   - Observe how the status changes update in real time
5. Go to Carousel Settings and toggle featured status for "Art Set"
   - Observe how the homepage carousel updates

**Responsive Design:**
- Dashboard charts and graphs resize for smaller screens
- Admin tables become cards on mobile for better readability
- Action buttons remain accessible on all screen sizes
- Form inputs adjust for touch input on mobile

### Category Navigation Examples

The application comes pre-seeded with the following product categories you can explore:

- **Electronics**: High-tech devices like smartphones, laptops, TVs
  - Example: Navigate to `/products?category=electronics` to see "Smartphone X", "Laptop Pro", etc.
- **Clothing**: Apparel items including t-shirts, jeans, dresses
  - Example: Test the responsive design of product cards by viewing `/products?category=clothing` on different devices
- **Home**: Furniture, kitchenware, and home decor
  - Example: View "Coffee Table" product detail page to test gallery functionality
- **Books**: Various book genres including fiction, cookbooks, self-help
  - Example: Add "Bestselling Novel" ($15.99) to cart to test low-price item processing
- **Sports**: Sports equipment and fitness trackers
  - Example: Filter `/products?category=sports` by price range to find affordable items
- **Beauty**: Skincare, makeup, and personal care products
  - Example: Test search functionality by searching for "Skincare Set"
- **Toys**: Children's toys, board games, and art supplies
  - Example: View "Building Blocks Set" to see how product specs display on mobile

### Mobile-First Design Approach

**Key Implementation Details:**
- Tailwind CSS responsive classes used throughout the application
- Custom breakpoints for different device sizes (sm, md, lg, xl)
- Touch-optimized interface elements (larger buttons, swipe gestures)

**Navigation Experience:**
- Persistent bottom navigation bar on mobile
- Collapsible sections to preserve vertical space
- Breadcrumb navigation to maintain context
- Back-to-top buttons on long pages

**Example Test Flow:**
1. Resize browser window to simulate different device sizes
2. On mobile size, test the hamburger menu functionality and navigate to products page
3. Observe how product grids reflow from 4 columns to 1 column
4. Test the touch carousel on the homepage using swipe gestures or touch buttons

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

## Security Features
- CORS protection
- JWT token expiration
- Secure password hashing with bcryptjs
- Protection against common web vulnerabilities
- Input validation and sanitization

## License

[MIT License](LICENSE)