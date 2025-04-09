import express from 'express';
import { createFirstAdmin } from '../controllers/authController.js';

const router = express.Router();

// Setup routes (should be disabled in production)
router.post('/first-admin', createFirstAdmin);

export default router; 