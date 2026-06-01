import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import layoutRoutes from "./routes/layoutRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import logger from "./utils/logger.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Socket.IO with production-ready CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.FRONTEND_URL
      : ['http://localhost:5173', 'http://localhost:3000'],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
  },
});

// Make io accessible to routes
app.set("io", io);

// Security middleware
app.use(helmet());
app.use(compression()); // Compress responses
app.use(mongoSanitize()); // Prevent NoSQL injection

// Rate limiting - General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true, // Don't count successful logins
});

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Apply general rate limiter to all API routes
app.use('/api/', apiLimiter);

// Enhanced health check
app.get("/api/health", async (req, res) => {
  const health = {
    ok: true,
    service: "backend",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  };

  try {
    // Check database connection
    await mongoose.connection.db.admin().ping();
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.ok = false;
  }

  const statusCode = health.ok ? 200 : 503;
  res.status(statusCode).json(health);
});

// Apply stricter rate limiter to auth endpoints
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/layouts", layoutRoutes);
app.use("/api/staff", staffRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// Enhanced error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log error for debugging
  console.error('Error:', err);
  
  const status = err.statusCode || 500;
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'An error occurred' 
    : err.message || 'Server error';

  res.status(status).json({ 
    message,
    // Include stack trace only in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

// Socket.IO connection handling
io.on("connection", (socket) => {
  logger.log(`Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    logger.log(`Client disconnected: ${socket.id}`);
  });
});

const start = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Socket.IO ready for connections`);
  });
};

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", err);
  process.exit(1);
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received, closing server gracefully...`);
  
  httpServer.close(() => {
    console.log('HTTP server closed');
    
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
