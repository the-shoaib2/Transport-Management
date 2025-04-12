-- Create the database
CREATE DATABASE IF NOT EXISTS transport_management;
USE transport_management;

-- roles table
CREATE TABLE IF NOT EXISTS roles (
    id CHAR(36) PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_name (role_name)
);

-- users table
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role_id CHAR(36) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_role_active (role_id, is_active)
);

-- bus_types table
CREATE TABLE IF NOT EXISTS bus_types (
    id CHAR(36) PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    capacity INT NOT NULL,
    model VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- buses table
CREATE TABLE IF NOT EXISTS buses (
    id CHAR(36) PRIMARY KEY,
    bus_number VARCHAR(20) NOT NULL UNIQUE,
    bus_nickname VARCHAR(50) NOT NULL UNIQUE,
    bus_type_id CHAR(36) NOT NULL,
    driver_id CHAR(36),
    status ENUM('active', 'maintenance', 'inactive') DEFAULT 'active',
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (bus_type_id) REFERENCES bus_types(id) ON DELETE RESTRICT,
    INDEX idx_bus_number (bus_number),
    INDEX idx_bus_nickname (bus_nickname),
    INDEX idx_status (status)
);

-- locations table
CREATE TABLE IF NOT EXISTS locations (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    type ENUM('stop', 'station', 'depot') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location_type (type)
);

-- routes table
CREATE TABLE IF NOT EXISTS routes (
    id CHAR(36) PRIMARY KEY,
    route_name VARCHAR(100) NOT NULL,
    start_location_id CHAR(36) NOT NULL,
    end_location_id CHAR(36) NOT NULL,
    distance DECIMAL(10,2) NOT NULL,
    estimated_time INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (start_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    FOREIGN KEY (end_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    INDEX idx_route_active (is_active)
);

-- route_stops table
CREATE TABLE IF NOT EXISTS route_stops (
    id CHAR(36) PRIMARY KEY,
    route_id CHAR(36) NOT NULL,
    location_id CHAR(36) NOT NULL,
    stop_order INT NOT NULL,
    estimated_arrival_time INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_route_stop_order (route_id, stop_order),
    INDEX idx_route_stops (route_id, location_id)
);

-- schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id CHAR(36) PRIMARY KEY,
    bus_id CHAR(36) NOT NULL,
    route_id CHAR(36) NOT NULL,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME NOT NULL,
    fare DECIMAL(10,2) NOT NULL,
    status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
    INDEX idx_schedule_status (status),
    INDEX idx_schedule_time (departure_time, arrival_time)
);

-- students table
CREATE TABLE IF NOT EXISTS students (
    id CHAR(36) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    grade VARCHAR(20) NOT NULL,
    school VARCHAR(100) NOT NULL,
    parent_name VARCHAR(100) NOT NULL,
    parent_phone VARCHAR(20) NOT NULL,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_student_email (email),
    INDEX idx_student_status (status)
);

-- payment_types table
CREATE TABLE IF NOT EXISTS payment_types (
    id CHAR(36) PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- payments table
CREATE TABLE IF NOT EXISTS payments (
    id CHAR(36) PRIMARY KEY,
    student_id CHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'mobile_payment') NOT NULL,
    payment_type ENUM('monthly', 'quarterly', 'yearly', 'one-time') NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    INDEX idx_payment_student (student_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_payment_status (status)
);

-- bus_locations table
CREATE TABLE IF NOT EXISTS bus_locations (
    id CHAR(36) PRIMARY KEY,
    bus_id CHAR(36) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bus_id) REFERENCES buses(id) ON DELETE CASCADE,
    INDEX idx_bus_location (bus_id, timestamp)
);

-- user_tokens table
CREATE TABLE IF NOT EXISTS user_tokens (
    id CHAR(36) PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    token VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_token (user_id, token),
    INDEX idx_token_active (token, is_active)
);

-- blood_donors table
CREATE TABLE IF NOT EXISTS blood_donors (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    last_donation_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_donor_email (email),
    INDEX idx_blood_group (blood_group)
);

-- blood_donations table
CREATE TABLE IF NOT EXISTS blood_donations (
    id CHAR(36) PRIMARY KEY,
    donor_id CHAR(36) NOT NULL,
    donation_date DATE NOT NULL,
    amount_ml INT NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES blood_donors(id) ON DELETE CASCADE,
    INDEX idx_donation_date (donation_date),
    INDEX idx_donation_status (status)
);

-- Insert default payment types
INSERT INTO payment_types (id, type_name, description) VALUES
(UUID(), 'Monthly Pass', 'Monthly bus pass payment'),
(UUID(), 'Quarterly Pass', 'Quarterly bus pass payment'),
(UUID(), 'Annual Pass', 'Annual bus pass payment'),
(UUID(), 'Single Trip', 'Payment for a single trip');






