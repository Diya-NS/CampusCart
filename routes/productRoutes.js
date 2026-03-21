const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, isSeller, isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// @route   GET /api/products
// @access  Public
router.get('/', productController.getProducts);

// @route   GET /api/products/:id
// @access  Public
router.get('/:id', productController.getProductById);

// @route   POST /api/products
// @access  Private (Seller only)
router.post('/', auth, isSeller, upload.single('image'), productController.createProduct);

// @route   DELETE /api/products/:id
// @access  Private (Seller owner or Admin)
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
