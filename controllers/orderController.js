const db = require('../database/db');
const path = require('path');
const fs = require('fs');

// @desc    Create a new order (Initiate payment)
// @access  Private (Buyer)
exports.createOrder = async (req, res) => {
    try {
        const { product_id, final_price, delivery_instructions } = req.body;
        const buyer_id = req.user.user_id;

        if (!product_id || !final_price) {
            return res.status(400).json({ message: 'Product ID and final price required' });
        }

        // Check if product is available
        const [products] = await db.query('SELECT status, seller_id FROM products WHERE product_id = ?', [product_id]);
        if (products.length === 0) return res.status(404).json({ message: 'Product not found' });

        if (products[0].status !== 'available') {
            return res.status(400).json({ message: 'Product is no longer available' });
        }

        // Create the order
        const [result] = await db.query(
            'INSERT INTO orders (product_id, buyer_id, final_price, payment_status, delivery_instructions) VALUES (?, ?, ?, ?, ?)',
            [product_id, buyer_id, final_price, 'pending', delivery_instructions || null]
        );

        res.status(201).json({
            message: 'Order initiated',
            order_id: result.insertId
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error creating order' });
    }
};

// @desc    Upload payment proof
// @access  Private (Buyer)
exports.uploadPaymentProof = async (req, res) => {
    try {
        const order_id = req.params.id;
        let payment_proof = null;

        if (req.file) {
            payment_proof = req.file.filename;
        } else {
            return res.status(400).json({ message: 'Payment proof image is required' });
        }

        // Verify ownership
        const [orders] = await db.query('SELECT buyer_id FROM orders WHERE order_id = ?', [order_id]);
        if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });

        if (orders[0].buyer_id !== req.user.user_id) {
            return res.status(403).json({ message: 'Not authorized for this order' });
        }

        await db.query('UPDATE orders SET payment_proof = ? WHERE order_id = ?', [payment_proof, order_id]);

        res.json({ message: 'Payment proof uploaded successfully', payment_proof });

    } catch (error) {
        console.error('Error uploading payment proof:', error);
        res.status(500).json({ message: 'Server error uploading proof' });
    }
};

// @desc    Verify payment and mark sold
// @access  Private (Admin or Seller of the product)
exports.verifyPayment = async (req, res) => {
    try {
        const order_id = req.params.id;
        const { status } = req.body; // 'verified' or 'rejected'

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid payment status' });
        }

        // Find order and product
        const [orders] = await db.query(`
            SELECT o.*, p.seller_id 
            FROM orders o
            JOIN products p ON o.product_id = p.product_id
            WHERE o.order_id = ?
        `, [order_id]);

        if (orders.length === 0) return res.status(404).json({ message: 'Order not found' });
        const order = orders[0];

        if (order.seller_id !== req.user.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to verify this payment' });
        }

        // Update Order
        await db.query('UPDATE orders SET payment_status = ? WHERE order_id = ?', [status, order_id]);

        // If verified, mark Product as sold
        if (status === 'verified') {
            await db.query('UPDATE products SET status = "sold" WHERE product_id = ?', [order.product_id]);
        }

        res.json({ message: `Payment ${status} successfully` });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Server error verifying payment' });
    }
};

// @desc    Get all orders involving user (Buyer or Seller)
// @access  Private
exports.getMyOrders = async (req, res) => {
    try {
        const user_id = req.user.user_id;
        const role = req.user.role;

        let query = '';
        let params = [user_id];

        if (role === 'admin') {
            query = `
                SELECT o.*, p.product_name, p.image, u_buyer.name as buyer_name, u_seller.name as seller_name
                FROM orders o
                JOIN products p ON o.product_id = p.product_id
                JOIN users u_buyer ON o.buyer_id = u_buyer.user_id
                JOIN users u_seller ON p.seller_id = u_seller.user_id
                ORDER BY o.order_date DESC
            `;
            params = [];
        } else if (role === 'seller') {
            query = `
                SELECT o.*, p.product_name, p.image, u_buyer.name as buyer_name 
                FROM orders o
                JOIN products p ON o.product_id = p.product_id
                JOIN users u_buyer ON o.buyer_id = u_buyer.user_id
                WHERE p.seller_id = ?
                ORDER BY o.order_date DESC
            `;
        } else {
            // Buyer
            query = `
                SELECT o.*, p.product_name, p.image, u_seller.name as seller_name 
                FROM orders o
                JOIN products p ON o.product_id = p.product_id
                JOIN users u_seller ON p.seller_id = u_seller.user_id
                WHERE o.buyer_id = ?
                ORDER BY o.order_date DESC
            `;
        }

        const [orders] = await db.query(query, params);
        res.json(orders);

    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};
