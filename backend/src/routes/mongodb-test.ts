import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import logger from '../utils/logger';

const router = Router();

// Test MongoDB connection
router.get('/connection', async (req: Request, res: Response) => {
  try {
    const dbState = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    const status = states[dbState as keyof typeof states] || 'unknown';
    
    res.json({
      success: true,
      message: 'MongoDB connection status',
      status,
      readyState: dbState,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('MongoDB connection test failed:', error);
    res.status(500).json({
      success: false,
      error: 'MongoDB connection test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test creating a user
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;
    
    // Validate required fields
    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['email', 'username', 'password']
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
        field: existingUser.email === email ? 'email' : 'username'
      });
    }
    
    // Create new user
    const user = new User({
      email,
      username,
      password, // In production, this should be hashed
      firstName,
      lastName
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        points: user.points,
        isActive: user.isActive,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('User creation failed:', error);
    res.status(500).json({
      success: false,
      error: 'User creation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test getting all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      message: 'Users retrieved successfully',
      count: users.length,
      users
    });
  } catch (error) {
    logger.error('User retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'User retrieval failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test getting user by ID
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }
    
    const user = await User.findById(id, '-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User retrieved successfully',
      user
    });
  } catch (error) {
    logger.error('User retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'User retrieval failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test updating user points
router.patch('/users/:id/points', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { points } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID format'
      });
    }
    
    if (typeof points !== 'number' || points < 0) {
      return res.status(400).json({
        success: false,
        error: 'Points must be a positive number'
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    user.points = points;
    await user.save();
    
    res.json({
      success: true,
      message: 'User points updated successfully',
      user: {
        id: user._id,
        username: user.username,
        points: user.points,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    logger.error('User points update failed:', error);
    res.status(500).json({
      success: false,
      error: 'User points update failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Test database stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database not connected'
      });
    }
    
    const adminDb = db.admin();
    const serverStatus = await adminDb.serverStatus();
    const dbStats = await db.stats();
    
    res.json({
      success: true,
      message: 'Database stats retrieved successfully',
      stats: {
        server: {
          version: serverStatus.version,
          uptime: serverStatus.uptime,
          connections: serverStatus.connections
        },
        database: {
          collections: dbStats.collections,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          indexSize: dbStats.indexSize
        }
      }
    });
  } catch (error) {
    logger.error('Database stats retrieval failed:', error);
    res.status(500).json({
      success: false,
      error: 'Database stats retrieval failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
