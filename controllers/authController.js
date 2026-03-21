const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, college_id, role, designation, department, semester, room_no, phone, upi_id } = req.body;

        // Validation
        if (!name || !email || !password || !college_id || !role || !designation || !department) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }

        if (!['admin', 'seller', 'buyer'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified.' });
        }

        // Check if user exists
        const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, college_id, role, designation, department, semester, room_no, phone, upi_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, college_id, role, designation, department, semester || null, room_no, phone, upi_id]
        );

        // Generate JWT
        const token = jwt.sign(
            { user_id: result.insertId, role: role, college_id: college_id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: result.insertId,
                name,
                email,
                role,
                college_id,
                designation,
                department,
                semester,
                room_no,
                phone,
                upi_id
            }
        });

    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login standard user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }

        // Find user
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Generate JWT
        const token = jwt.sign(
            { user_id: user.user_id, role: user.role, college_id: user.college_id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.user_id,
                name: user.name,
                email: user.email,
                role: user.role,
                college_id: user.college_id,
                designation: user.designation,
                department: user.department,
                semester: user.semester,
                room_no: user.room_no,
                phone: user.phone,
                upi_id: user.upi_id
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Get current user profile
exports.getMe = async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT user_id, name, email, role, college_id, designation, department, semester, room_no, phone, upi_id, created_at FROM users WHERE user_id = ?',
            [req.user.user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Profile Fetch Error:', error);
        res.status(500).json({ message: 'Server error while fetching profile' });
    }
};
