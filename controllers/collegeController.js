const db = require('../database/db');

// @desc    Get all active colleges
exports.getColleges = async (req, res) => {
    try {
        const [colleges] = await db.query('SELECT * FROM colleges ORDER BY college_name ASC');
        res.json(colleges);
    } catch (error) {
        console.error('Error fetching colleges:', error);
        res.status(500).json({ message: 'Server Error fetching colleges' });
    }
};
