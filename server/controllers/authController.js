import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';
import * as tokenModel from '../models/tokenModel.js';
import { ROLES, MESSAGES } from '../constants.js';

// Function to create the first admin user
export const createFirstAdmin = async (req, res) => {
    const { firstName, lastName, username, email, password } = req.body;
    try {
        // Check if any admin already exists
        const admins = await userModel.getUsersByRole(ROLES.ADMIN);
        if (admins && admins.length > 0) {
            return res.status(403).json({
                status: 'error',
                message: MESSAGES.ADMIN_EXISTS
            });
        }

        const existingUser = await userModel.findUserByEmail(email);
        
        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                message: MESSAGES.USER_EXISTS
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        await userModel.createUser({ 
            firstName, 
            lastName, 
            username, 
            email, 
            hashedPassword: hashPassword,
            role_id: ROLES.ADMIN
        });

        console.log("Admin Account Create Successfully.");

        return res.status(201).json({
            status: 'success',
            message: MESSAGES.ADMIN_CREATED
        });
    } catch (err) {
        console.error('First admin creation error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during first admin creation'
        });
    }
};

export const register = async (req, res) => {
    const { firstName, lastName, username, email, password, role } = req.body;
    try {
        // Check if user is admin (from token)
        const isAdmin = req.user && req.user.role_name === 'admin';
        
        // If not admin, return unauthorized
        if (!isAdmin) {
            return res.status(403).json({
                status: 'error',
                message: MESSAGES.ADMIN_ONLY
            });
        }

        const existingUser = await userModel.findUserByEmail(email);
        
        if (existingUser) {
            return res.status(409).json({
                status: 'error',
                message: MESSAGES.USER_EXISTS
            });
        }

        // Determine role_id based on the role parameter
        let role_id;
        if (role === 'admin') {
            role_id = ROLES.ADMIN;
        } else if (role === 'student') {
            role_id = ROLES.STUDENT;
        } else {
            return res.status(400).json({
                status: 'error',
                message: MESSAGES.INVALID_ROLE
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        await userModel.createUser({ 
            firstName, 
            lastName, 
            username, 
            email, 
            hashedPassword: hashPassword,
            role_id
        });

        return res.status(201).json({
            status: 'success',
            message: MESSAGES.USER_CREATED
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during registration'
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findUserByEmail(email);
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: MESSAGES.USER_NOT_FOUND
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                status: 'error',
                message: MESSAGES.INVALID_CREDENTIALS
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Calculate token expiration
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(process.env.JWT_EXPIRES_IN));

        // Store token in database
        await tokenModel.createToken({
            user_id: user.id,
            token,
            expires_at: expiresAt
        });

        // Update user's last login
        await userModel.updateLastLogin(user.id);

        return res.status(200).json({
            status: 'success',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during login'
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await userModel.findUserById(req.userId);
        
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: MESSAGES.USER_NOT_FOUND
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                user
            }
        });
    } catch (err) {
        console.error('Profile fetch error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error while fetching profile'
        });
    }
};

export const logout = async (req, res) => {
    try {
        // Get the token from the request header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(400).json({
                status: 'error',
                message: 'No token provided'
            });
        }

        // Deactivate the token in the database
        await tokenModel.deactivateToken(token);

        res.status(200).json({
            status: 'success',
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error during logout'
        });
    }
}; 