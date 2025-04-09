import express from 'express'
import { register, login, getProfile, createFirstAdmin, logout } from '../controllers/authController.js'
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/login', login)
router.post('/first-admin', createFirstAdmin) // Special route for creating the first admin

// Protected routes
router.post('/register', verifyToken, isAdmin, register)
router.get('/admin', verifyToken, getProfile)
router.post('/logout', verifyToken, logout)

export default router;