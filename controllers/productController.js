const db = require('../database/db');
const path = require('path');
const fs = require('fs');

// @desc    Create a new product listing (Seller only)
exports.createProduct = async (req, res) => {
    try {
        const { product_name, description, category, price } = req.body;

        // Seller details from JWT
        const seller_id = req.user.user_id;
        const college_id = req.user.college_id;

        // Image logic
        let image = null;
        if (req.file) {
            image = req.file.filename;
        }

        if (!product_name || !price) {
            return res.status(400).json({ message: 'Product name and price are required' });
        }

        const [result] = await db.query(
            'INSERT INTO products (product_name, description, category, price, image, seller_id, college_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [product_name, description, category, price, image, seller_id, college_id, 'available']
        );

        res.status(201).json({
            message: 'Product listed successfully',
            product_id: result.insertId
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Server Error creating product' });
    }
};

// @desc    Get all products (With optional filters for college or search string)
exports.getProducts = async (req, res) => {
    try {
        const { college_id, search } = req.query;
        let query = `
            SELECT p.*, c.college_name, u.name as seller_name 
            FROM products p
            LEFT JOIN colleges c ON p.college_id = c.college_id
            LEFT JOIN users u ON p.seller_id = u.user_id
            WHERE p.status = 'available'
        `;
        const params = [];

        if (college_id) {
            query += ` AND p.college_id = ?`;
            params.push(college_id);
        }

        if (search) {
            query += ` AND (p.product_name LIKE ? OR p.description LIKE ? OR p.category LIKE ?)`;
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        query += ` ORDER BY p.created_at DESC`;

        const [products] = await db.query(query, params);
        res.json(products);

    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server Error fetching products' });
    }
};

// @desc    Get single product details
exports.getProductById = async (req, res) => {
    try {
        const [products] = await db.query(`
            SELECT p.*, c.college_name, u.name as seller_name, u.email as seller_email, u.phone as seller_phone, u.room_no as seller_room_no, u.department as seller_department
            FROM products p
            LEFT JOIN colleges c ON p.college_id = c.college_id
            LEFT JOIN users u ON p.seller_id = u.user_id
            WHERE p.product_id = ?
        `, [req.params.id]);

        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(products[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server Error fetching product' });
    }
};

// @desc    Delete a product (Seller or Admin)
exports.deleteProduct = async (req, res) => {
    try {
        const product_id = req.params.id;

        // Find product to check ownership
        const [products] = await db.query('SELECT * FROM products WHERE product_id = ?', [product_id]);

        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const product = products[0];

        // Check if user is owner or admin
        if (product.seller_id !== req.user.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this product' });
        }

        // Delete image if exists
        if (product.image) {
            const imagePath = path.join(__dirname, '../uploads', product.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await db.query('DELETE FROM products WHERE product_id = ?', [product_id]);

        res.json({ message: 'Product removed' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Server Error deleting product' });
    }
};
