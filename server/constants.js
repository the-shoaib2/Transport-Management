// Role IDs (these will be generated during setup)
export const ROLES = {
    ADMIN: 'admin-role-id',    // Placeholder, will be replaced with actual UUID
    STUDENT: 'student-role-id', // Placeholder, will be replaced with actual UUID
    DRIVER: 'driver-role-id'    // Placeholder, will be replaced with actual UUID
};

// Role definitions for database setup
export const ROLE_DEFINITIONS = [
    {
        role_name: 'admin',
        description: 'Administrator with full access'
    },
    {
        role_name: 'student',
        description: 'Student user'
    },
    {
        role_name: 'driver',
        description: 'Bus driver'
    }
];

// Default admin user
export const DEFAULT_ADMIN = {
    firstName: 'Super',
    lastName: 'Admin',
    username: 'admin',
    email: 'super@admin.com',
    password: 'admin123', // Change this in production
    role_id: ROLES.ADMIN
};

// Role definitions for display
export const ROLE_NAMES = {
    admin: 'Administrator',
    student: 'Student',
    driver: 'Driver'
};

// JWT configuration
export const JWT_CONFIG = {
    expiresIn: '30d'
};

// API response messages
export const MESSAGES = {
    USER_CREATED: 'User created successfully',
    ADMIN_CREATED: 'First admin user created successfully',
    USER_EXISTS: 'User already exists',
    ADMIN_EXISTS: 'Admin already exists. Please use the regular registration process.',
    INVALID_ROLE: 'Invalid role specified',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_NOT_FOUND: 'User not found',
    ADMIN_ONLY: 'Only administrators can create accounts',
    TOKEN_REQUIRED: 'No token provided',
    TOKEN_INVALID: 'Invalid token format',
    TOKEN_EXPIRED: 'Invalid or expired token',
    ADMIN_REQUIRED: 'Access denied. Admin privileges required.'
}; 