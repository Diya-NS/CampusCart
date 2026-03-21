const db = require('../database/db');

// @desc    Make an offer on a product
// @access  Private (Buyer)
exports.makeOffer = async (req, res) => {
    try {
        const { product_id, offered_price } = req.body;
        const buyer_id = req.user.user_id;

        if (!product_id || !offered_price) {
            return res.status(400).json({ message: 'Product ID and Offered Price are required.' });
        }

        // Check if product exists and is available
        const [products] = await db.query('SELECT status, seller_id FROM products WHERE product_id = ?', [product_id]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        if (products[0].status !== 'available') {
            return res.status(400).json({ message: 'Product is no longer available.' });
        }

        if (products[0].seller_id === buyer_id) {
            return res.status(400).json({ message: 'You cannot make an offer on your own product.' });
        }

        const [result] = await db.query(
            'INSERT INTO offers (product_id, buyer_id, offered_price, status) VALUES (?, ?, ?, ?)',
            [product_id, buyer_id, offered_price, 'pending']
        );

        res.status(201).json({ message: 'Offer sent', offer_id: result.insertId });
    } catch (error) {
        console.error('Error making offer:', error);
        res.status(500).json({ message: 'Server error while making offer' });
    }
};

// @desc    Get offers for a product (Seller only)
// @access  Private (Seller)
exports.getProductOffers = async (req, res) => {
    try {
        const product_id = req.params.product_id;

        // Ensure the logged in seller owns the product
        const [products] = await db.query('SELECT seller_id FROM products WHERE product_id = ?', [product_id]);
        if (products.length === 0) return res.status(404).json({ message: 'Product not found' });

        if (products[0].seller_id !== req.user.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view these offers' });
        }

        const [offers] = await db.query(`
            SELECT o.*, u.name as buyer_name 
            FROM offers o
            JOIN users u ON o.buyer_id = u.user_id
            WHERE o.product_id = ?
            ORDER BY o.created_at DESC
        `, [product_id]);

        res.json(offers);
    } catch (error) {
        console.error('Error fetching offers:', error);
        res.status(500).json({ message: 'Server error fetching offers' });
    }
};

// @desc    Get offers made by logged-in buyer
// @access  Private
exports.getMyOffers = async (req, res) => {
    try {
        const [offers] = await db.query(`
            SELECT o.*, p.product_name, p.image as product_image, p.price as original_price 
            FROM offers o
            JOIN products p ON o.product_id = p.product_id
            WHERE o.buyer_id = ?
            ORDER BY o.created_at DESC
        `, [req.user.user_id]);

        res.json(offers);
    } catch (error) {
        console.error('Error fetching my offers:', error);
        res.status(500).json({ message: 'Server error fetching offers' });
    }
};

// @desc    Update offer status (Seller only)
// @access  Private (Seller)
exports.updateOfferStatus = async (req, res) => {
    try {
        const offer_id = req.params.id;
        const { status } = req.body; // 'accepted' or 'rejected'

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const [offers] = await db.query('SELECT o.*, p.seller_id FROM offers o JOIN products p ON o.product_id = p.product_id WHERE o.offer_id = ?', [offer_id]);

        if (offers.length === 0) return res.status(404).json({ message: 'Offer not found' });

        if (offers[0].seller_id !== req.user.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this offer' });
        }

        await db.query('UPDATE offers SET status = ? WHERE offer_id = ?', [status, offer_id]);

        res.json({ message: `Offer ${status} successfully` });
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ message: 'Server error updating offer' });
    }
};
