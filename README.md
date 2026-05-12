# 🍽️ Restaurant Management System

A comprehensive full-stack restaurant management platform built with the MERN stack, featuring real-time order tracking, role-based authentication, and an intuitive interface for managing restaurant operations.

![React](https://img.shields.io/badge/React-19.2.5-61DAFB?style=flat&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-Latest-339933?style=flat&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248?style=flat&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.19.2-000000?style=flat&logo=express&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8.3-010101?style=flat&logo=socket.io&logoColor=white)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### 🔐 Authentication & Authorization
- **Role-Based Access Control**: Separate interfaces for Admin and Staff users
- **Dual Authentication Methods**: Support for both email/password and PIN-based login
- **JWT Token Management**: Secure, stateless authentication with JSON Web Tokens
- **Organization Hierarchy**: Admin creates and manages staff accounts

### 📦 Order Management
- **Real-Time Order Tracking**: Live updates using Socket.IO WebSocket connections
- **Dual Order Types**: Support for both dine-in (table-based) and parcel/takeaway orders
- **Order Status Workflow**: Open → In Progress → Completed → Paid
- **Item-Level Tracking**: Individual kitchen status for each order item (pending, preparing, completed)
- **Order Notes**: Add special instructions and customer preferences
- **Customer Information**: Store customer name and phone for parcel orders

### 🍳 Kitchen Display System
- **Live Order Queue**: Real-time order updates for kitchen staff
- **Preparation Status Tracking**: Update item status (pending, preparing, completed)
- **Visual Indicators**: Clear status indicators for order priority and timing
- **Separate Views**: Dedicated views for dine-in and parcel orders

### 🪑 Table Layout Management
- **Drag-and-Drop Interface**: Create custom restaurant floor plans
- **Multiple Layouts**: Support for different dining areas (indoor, outdoor, etc.)
- **Table Status Tracking**: Real-time occupancy status (available, occupied, reserved)
- **Visual Grid**: Interactive table grid with live updates
- **Order Linking**: Direct association between orders and specific tables

### 🍔 Menu Management
- **Full CRUD Operations**: Create, read, update, and delete menu items
- **Category Organization**: Organize items by categories (Soups, Starters, Mains, etc.)
- **Price Management**: Easy price updates and modifications
- **Availability Toggle**: Mark items as available or unavailable
- **Menu Seeding**: Quick setup with pre-populated menu data

### 📊 Admin Dashboard
- **Revenue Analytics**: Track earnings with customizable date filters
  - Today, This Week, This Month, Custom Range
- **Order Statistics**: View order trends and patterns
- **Staff Management**: Create, view, and manage staff accounts
- **Order History**: Comprehensive view of all past orders
- **System Settings**: Configure restaurant settings and preferences

### 👥 Staff Dashboard
- **Quick Order Access**: View and manage active orders
- **Table Management**: Monitor table status and assignments
- **Order Creation**: Create new orders for dine-in and parcel
- **Real-Time Notifications**: Instant updates on order changes

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.5** - Modern UI library with hooks and functional components
- **React Router 7.14.2** - Client-side routing for SPA navigation
- **Tailwind CSS 3.4.14** - Utility-first CSS framework for responsive design
- **Vite 8.0.10** - Fast build tool with hot module replacement
- **Axios 1.15.2** - Promise-based HTTP client
- **Socket.IO Client 4.8.3** - Real-time bidirectional communication
- **React Draggable 4.5.0** - Drag-and-drop functionality for table layouts

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js 4.19.2** - Fast, minimalist web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Mongoose 8.5.2** - Elegant MongoDB object modeling
- **Socket.IO 4.8.3** - Real-time WebSocket server
- **JWT (jsonwebtoken 9.0.2)** - Secure token-based authentication
- **Bcrypt.js 2.4.3** - Password hashing and encryption
- **Express Validator 7.2.0** - Input validation and sanitization
- **Helmet 7.1.0** - Security middleware for HTTP headers
- **Morgan 1.10.0** - HTTP request logger
- **CORS 2.8.5** - Cross-Origin Resource Sharing

### Development Tools
- **Nodemon 3.1.4** - Auto-restart server on file changes
- **dotenv 16.4.5** - Environment variable management
- **Git** - Version control

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Admin      │  │    Staff     │  │   Kitchen    │      │
│  │  Dashboard   │  │  Dashboard   │  │    View      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  React Router  │                        │
│                    │  Context API   │                        │
│                    └───────┬────────┘                        │
│                            │                                 │
│              ┌─────────────┴─────────────┐                   │
│              │                           │                   │
│         ┌────▼─────┐              ┌─────▼──────┐            │
│         │  Axios   │              │ Socket.IO  │            │
│         │  Client  │              │   Client   │            │
│         └────┬─────┘              └─────┬──────┘            │
└──────────────┼────────────────────────────┼──────────────────┘
               │                            │
               │         Network            │
               │                            │
┌──────────────┼────────────────────────────┼──────────────────┐
│              │                            │                  │
│         ┌────▼─────┐              ┌─────▼──────┐            │
│         │ Express  │              │ Socket.IO  │            │
│         │   REST   │              │   Server   │            │
│         │   API    │              └─────┬──────┘            │
│         └────┬─────┘                    │                   │
│              │                          │                   │
│         ┌────▼──────────────────────────▼─────┐             │
│         │        Middleware Layer             │             │
│         │  • Authentication (JWT)             │             │
│         │  • Authorization (Role-based)       │             │
│         │  • Validation (Express Validator)   │             │
│         │  • Security (Helmet, CORS)          │             │
│         └────┬────────────────────────────────┘             │
│              │                                               │
│         ┌────▼─────────────────────────────┐                │
│         │      Business Logic Layer        │                │
│         │  • Auth Controller               │                │
│         │  • Order Controller              │                │
│         │  • Menu Controller               │                │
│         │  • Layout Controller             │                │
│         │  • Staff Controller              │                │
│         └────┬─────────────────────────────┘                │
│              │                                               │
│         ┌────▼─────────────────────────────┐                │
│         │      Data Access Layer           │                │
│         │  • Mongoose Models               │                │
│         │  • Database Queries              │                │
│         └────┬─────────────────────────────┘                │
│              │                                               │
│         Backend (Node.js + Express)                         │
└──────────────┼──────────────────────────────────────────────┘
               │
               │
┌──────────────▼──────────────────────────────────────────────┐
│                      MongoDB Database                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Users   │  │  Orders  │  │   Menu   │  │ Layouts  │   │
│  │Collection│  │Collection│  │ Items    │  │Collection│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - Or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for cloud database
- **npm** or **yarn** - Package manager (comes with Node.js)
- **Git** - Version control

### Check Installation

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check MongoDB version
mongod --version
```

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/restaurant-management-system.git
cd restaurant-management-system
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

1. **Create Environment File**

```bash
cd backend
cp .env.example .env
```

2. **Configure Environment Variables**

Edit `backend/.env`:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGO_URI=mongodb://localhost:27017/restaurant_management
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Important**: 
- Change `JWT_SECRET` to a long, random string in production
- Use a strong MongoDB password for production databases
- Never commit `.env` files to version control

### Frontend Configuration

1. **Create Environment File**

```bash
cd frontend
cp .env.example .env
```

2. **Configure Environment Variables**

Edit `frontend/.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000
```

---

## 🎯 Usage

### Starting the Application

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Start Backend Server:**

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

**Terminal 2 - Start Frontend Development Server:**

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

#### Option 2: Using Concurrently (Optional)

You can install `concurrently` to run both servers with one command:

```bash
# In root directory
npm install -g concurrently

# Create a script in root package.json
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
```

### Seeding the Database

To populate the database with sample menu items:

```bash
cd backend
node seedMenu.js
```

This will create:
- 17 categories (Soups, Starters, Biryani, etc.)
- 200+ menu items with prices

### Creating Admin Account

**Method 1: Using API (Recommended)**

```bash
# Using curl
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Admin",
    "email": "admin@restaurant.com",
    "password": "admin123",
    "pin": "1234",
    "role": "admin"
  }'

# Using Postman or Thunder Client
POST http://localhost:5000/api/auth/signup
Body (JSON):
{
  "username": "Admin",
  "email": "admin@restaurant.com",
  "password": "admin123",
  "pin": "1234",
  "role": "admin"
}
```

**Method 2: Using MongoDB Compass or Shell**

```javascript
// Connect to MongoDB and run:
use restaurant_management

db.users.insertOne({
  username: "Admin",
  email: "admin@restaurant.com",
  password: "$2a$12$hashedPasswordHere", // Use bcrypt to hash
  pin: "$2a$12$hashedPinHere", // Use bcrypt to hash
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Default Login Credentials

After creating an admin account, you can log in with:

- **Email**: admin@restaurant.com
- **Password**: admin123
- **PIN**: 1234

**⚠️ Important**: Change these credentials immediately in production!

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### 1. Admin Signup
```http
POST /api/auth/signup
Content-Type: application/json

{
  "username": "Admin Name",
  "email": "admin@example.com",
  "password": "password123",
  "pin": "1234",
  "role": "admin"
}
```

#### 2. Admin Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password123"
}
```

#### 3. Staff Login (PIN)
```http
POST /api/staff/login
Content-Type: application/json

{
  "username": "staff_username",
  "pin": "1234"
}
```

#### 4. Staff Login (Email/Password)
```http
POST /api/staff/login
Content-Type: application/json

{
  "email": "staff@example.com",
  "password": "password123"
}
```

### Menu Endpoints

#### 1. Get All Menu Items
```http
GET /api/menu
```

#### 2. Get Menu Item by ID
```http
GET /api/menu/:id
```

#### 3. Create Menu Item (Admin Only)
```http
POST /api/menu
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chicken Biryani",
  "price": 250,
  "category": "categoryId",
  "isAvailable": true
}
```

#### 4. Update Menu Item (Admin Only)
```http
PUT /api/menu/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 300,
  "isAvailable": false
}
```

#### 5. Delete Menu Item (Admin Only)
```http
DELETE /api/menu/:id
Authorization: Bearer <token>
```

### Order Endpoints

#### 1. Get All Orders
```http
GET /api/orders
Authorization: Bearer <token>
```

#### 2. Get Order by ID
```http
GET /api/orders/:id
Authorization: Bearer <token>
```

#### 3. Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "menuItem": "menuItemId",
      "name": "Chicken Biryani",
      "price": 250,
      "qty": 2
    }
  ],
  "tableId": "T1",
  "layoutId": "layoutId",
  "notes": "Extra spicy",
  "isParcel": false
}
```

#### 4. Update Order Status
```http
PATCH /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

#### 5. Update Item Kitchen Status
```http
PATCH /api/orders/:orderId/items/:itemIndex/kitchen-status
Authorization: Bearer <token>
Content-Type: application/json

{
  "kitchenStatus": "preparing"
}
```

### Layout Endpoints

#### 1. Get All Layouts
```http
GET /api/layouts
Authorization: Bearer <token>
```

#### 2. Create Layout (Admin Only)
```http
POST /api/layouts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Main Dining Area",
  "tables": [
    {
      "id": "T1",
      "x": 100,
      "y": 100,
      "status": "available"
    }
  ]
}
```

### Staff Endpoints

#### 1. Get All Staff (Admin Only)
```http
GET /api/staff
Authorization: Bearer <token>
```

#### 2. Create Staff (Admin Only)
```http
POST /api/staff
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "staff_name",
  "email": "staff@example.com",
  "password": "password123",
  "pin": "5678"
}
```

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

---

## 📁 Project Structure

```
restaurant-management-system/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection configuration
│   │
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── menuController.js     # Menu CRUD operations
│   │   ├── orderController.js    # Order management logic
│   │   ├── layoutController.js   # Table layout operations
│   │   └── staffController.js    # Staff management logic
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT authentication middleware
│   │   └── roleMiddleware.js     # Role-based authorization
│   │
│   ├── models/
│   │   ├── User.js               # User schema (Admin/Staff)
│   │   ├── MenuItem.js           # Menu item schema
│   │   ├── Category.js           # Category schema
│   │   ├── Order.js              # Order schema
│   │   └── Layout.js             # Table layout schema
│   │
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication routes
│   │   ├── menuRoutes.js         # Menu routes
│   │   ├── orderRoutes.js        # Order routes
│   │   ├── layoutRoutes.js       # Layout routes
│   │   └── staffRoutes.js        # Staff routes
│   │
│   ├── utils/
│   │   └── generateToken.js      # JWT token generation utility
│   │
│   ├── .env                      # Environment variables (not in repo)
│   ├── .env.example              # Environment variables template
│   ├── .gitignore                # Git ignore file
│   ├── server.js                 # Express server entry point
│   ├── seedMenu.js               # Database seeding script
│   ├── package.json              # Backend dependencies
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg           # Favicon
│   │   └── icons.svg             # SVG icons
│   │
│   ├── src/
│   │   ├── assets/               # Images and static assets
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar component
│   │   │   ├── MenuList.jsx      # Menu display component
│   │   │   ├── OrderCard.jsx     # Order card component
│   │   │   ├── OrderPanel.jsx    # Order panel component
│   │   │   └── TableGrid.jsx     # Table layout grid component
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Authentication context
│   │   │
│   │   ├── hooks/
│   │   │   └── useAuth.js        # Custom authentication hook
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Admin login page
│   │   │   ├── StaffLogin.jsx    # Staff login page
│   │   │   ├── StaffSignup.jsx   # Staff signup page
│   │   │   ├── AdminDashboard.jsx        # Admin dashboard
│   │   │   ├── AdminOrdersPage.jsx       # Admin orders view
│   │   │   ├── AdminLayoutsPage.jsx      # Layout management
│   │   │   ├── AdminSettingsPage.jsx     # Admin settings
│   │   │   ├── StaffDashboard.jsx        # Staff dashboard
│   │   │   ├── StaffHome.jsx             # Staff home page
│   │   │   ├── StaffOrdersView.jsx       # Staff orders view
│   │   │   ├── KitchenView.jsx           # Kitchen display
│   │   │   ├── MenuPage.jsx              # Menu management
│   │   │   ├── OrdersPage.jsx            # Orders page
│   │   │   ├── ParcelOrder.jsx           # Parcel order page
│   │   │   ├── LayoutView.jsx            # Layout view
│   │   │   └── LayoutPage.jsx            # Layout page
│   │   │
│   │   ├── App.jsx               # Main App component
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Global styles
│   │
│   ├── .env                      # Frontend environment variables
│   ├── .gitignore                # Git ignore file
│   ├── index.html                # HTML template
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind CSS configuration
│   ├── postcss.config.js         # PostCSS configuration
│   ├── package.json              # Frontend dependencies
│   └── package-lock.json
│
├── .gitignore                    # Root git ignore
├── README.md                     # This file
└── LICENSE                       # License file
```

---

## 📸 Screenshots

### Admin Dashboard
![Admin Dashboard](./screenshots/admin-dashboard.png)
*Comprehensive analytics with revenue tracking and order statistics*

### Kitchen Display
![Kitchen View](./screenshots/kitchen-view.png)
*Real-time order queue with preparation status tracking*

### Table Layout Manager
![Table Layout](./screenshots/table-layout.png)
*Drag-and-drop interface for customizable floor plans*

### Order Management
![Order Management](./screenshots/order-management.png)
*Create and manage orders with real-time updates*

### Menu Management
![Menu Management](./screenshots/menu-management.png)
*Full CRUD operations for menu items and categories*

---

## 🔒 Security Features

- **Password Hashing**: Bcrypt with 12 salt rounds
- **JWT Authentication**: Secure token-based authentication
- **HTTP Security Headers**: Helmet.js for security headers
- **CORS Protection**: Configured CORS for controlled access
- **Input Validation**: Express Validator for sanitization
- **Role-Based Access**: Middleware for authorization
- **Environment Variables**: Sensitive data in .env files
- **SQL Injection Prevention**: MongoDB parameterized queries

---

## 🧪 Testing

### Manual Testing

1. **Test Authentication**
```bash
cd backend
node test-auth.js
```

2. **Test Staff Authentication**
```bash
cd backend
node test-staff-auth.js
```

3. **Test Database Connection**
```bash
cd backend
node test-connection.js
```

### API Testing with Postman

Import the Postman collection (if available) or use the API documentation above to test endpoints.

---

## 🚀 Deployment

### Backend Deployment (Heroku Example)

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login to Heroku**
```bash
heroku login
```

3. **Create Heroku App**
```bash
cd backend
heroku create your-app-name
```

4. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set FRONTEND_URL=your_frontend_url
```

5. **Deploy**
```bash
git push heroku main
```

### Frontend Deployment (Vercel Example)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Build Frontend**
```bash
cd frontend
npm run build
```

3. **Deploy to Vercel**
```bash
vercel --prod
```

4. **Set Environment Variables in Vercel Dashboard**
- `VITE_API_URL`: Your backend URL

### Alternative Deployment Options

- **Backend**: Railway, Render, AWS EC2, DigitalOcean
- **Frontend**: Netlify, GitHub Pages, AWS S3 + CloudFront
- **Database**: MongoDB Atlas (recommended for production)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the Repository**
```bash
git clone https://github.com/yourusername/restaurant-management-system.git
```

2. **Create a Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Commit Your Changes**
```bash
git commit -m "Add some amazing feature"
```

4. **Push to the Branch**
```bash
git push origin feature/amazing-feature
```

5. **Open a Pull Request**

### Coding Standards

- Use ESLint for code linting
- Follow Airbnb JavaScript Style Guide
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## 🐛 Known Issues

- [ ] Socket.IO reconnection handling needs improvement
- [ ] Mobile responsiveness on some admin pages
- [ ] Pagination needed for large order lists
- [ ] Print functionality for kitchen orders

---

## 📝 Future Enhancements

- [ ] Payment gateway integration (Stripe, Razorpay)
- [ ] Customer-facing mobile app for self-ordering
- [ ] Inventory management system
- [ ] Employee shift scheduling
- [ ] Advanced analytics and reporting
- [ ] Multi-location support for restaurant chains
- [ ] QR code-based table ordering
- [ ] Integration with third-party delivery platforms (Uber Eats, DoorDash)
- [ ] Email/SMS notifications for orders
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Offline mode with service workers

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Sai Mani Baswa**

- GitHub: [@SAIMANI7890](https://github.com/SAIMANI7890)
- LinkedIn: [Sai Mani Baswa](https://linkedin.com/in/sai-mani-baswa)
- Email: baswasai123@gmail.com

---

## 🙏 Acknowledgments

- [React Documentation](https://react.dev/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Documentation](https://expressjs.com/)

---

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/yourusername/restaurant-management-system/issues) page
2. Create a new issue if your problem isn't already listed
3. Contact me via email: baswasai123@gmail.com

---

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

<div align="center">

**Made with ❤️ by Sai Mani Baswa**

</div>
