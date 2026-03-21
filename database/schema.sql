-- CampusCart Database Schema

CREATE DATABASE IF NOT EXISTS campuscart;
USE campuscart;

-- Colleges Table
CREATE TABLE IF NOT EXISTS colleges (
    college_id INT AUTO_INCREMENT PRIMARY KEY,
    college_name VARCHAR(255) NOT NULL,
    district VARCHAR(100) NOT NULL,
    university VARCHAR(150) NOT NULL
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    college_id INT,
    role ENUM('admin', 'seller', 'buyer') NOT NULL,
    designation ENUM('student', 'teacher', 'staff') DEFAULT 'student',
    department VARCHAR(100),
    semester VARCHAR(20),
    room_no VARCHAR(100),
    phone VARCHAR(20),
    upi_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255),
    seller_id INT NOT NULL,
    college_id INT,
    status ENUM('available', 'sold') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (college_id) REFERENCES colleges(college_id) ON DELETE SET NULL
);

-- Offers Table
CREATE TABLE IF NOT EXISTS offers (
    offer_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    buyer_id INT NOT NULL,
    offered_price DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    buyer_id INT NOT NULL,
    final_price DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    payment_proof VARCHAR(255),
    delivery_instructions TEXT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Insert Sample Colleges
INSERT INTO colleges (college_name, district, university) VALUES
('LBS Institute of Technology for Women', 'Thiruvananthapuram', 'APJ Abdul Kalam Technological University'),
('College of Engineering Trivandrum (CET)', 'Thiruvananthapuram', 'APJ Abdul Kalam Technological University'),
('Government Engineering College Barton Hill', 'Thiruvananthapuram', 'APJ Abdul Kalam Technological University'),
('TKM College of Engineering', 'Kollam', 'APJ Abdul Kalam Technological University'),
('Government Engineering College Thrissur', 'Thrissur', 'APJ Abdul Kalam Technological University'),
('Rajiv Gandhi Institute of Technology', 'Kottayam', 'APJ Abdul Kalam Technological University'),
('All Saints College', 'Thiruvananthapuram', 'University of Kerala'),
('Sacred Heart College Thevara', 'Ernakulam', 'Mahatma Gandhi University'),
('Christian College Kattakada', 'Thiruvananthapuram', 'University of Kerala'),
('St Thomas College Thrissur', 'Thrissur', 'University of Calicut');
