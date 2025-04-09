import jwt from 'jsonwebtoken';
import * as userModel from '../models/userModel.js';
import { MESSAGES } from '../constants.js';

export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        
        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                message: MESSAGES.TOKEN_REQUIRED
            });
        }

        // Check if the header has the correct format (Bearer token)
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                status: 'error',
                message: MESSAGES.TOKEN_INVALID
            });
        }

        const token = parts[1];
        
        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Check if the decoded token has an id
            if (!decoded || !decoded.id) {
                return res.status(401).json({
                    status: 'error',
                    message: MESSAGES.TOKEN_INVALID
                });
            }
            
            req.userId = decoded.id;
            next();
        } catch (jwtError) {
            console.error('JWT verification error:', jwtError);
            
            // Provide more specific error messages based on the JWT error
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Token has expired. Please login again.'
                });
            } else if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    status: 'error',
                    message: 'Invalid token. Please login again.'
                });
            } else {
                return res.status(401).json({
                    status: 'error',
                    message: MESSAGES.TOKEN_EXPIRED
                });
            }
        }
    } catch (err) {
        console.error('Token verification error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during token verification'
        });
    }
};

export const isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findUserById(req.userId);
        
        if (!user || user.role_name !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: MESSAGES.ADMIN_REQUIRED
            });
        }
        
        req.user = user;
        next();
    } catch (err) {
        console.error('Admin check error:', err);
        return res.status(500).json({
            status: 'error',
            message: 'Internal server error during admin verification'
        });
    }
}; 