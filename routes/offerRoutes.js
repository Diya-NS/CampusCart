const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { auth } = require('../middleware/auth');

// Make a new offer
router.post('/', auth, offerController.makeOffer);

// Get my offers (as buyer)
router.get('/my-offers', auth, offerController.getMyOffers);

// Get offers on a specific product (Seller)
router.get('/product/:product_id', auth, offerController.getProductOffers);

// Accept or reject offer (Seller)
router.put('/:id/status', auth, offerController.updateOfferStatus);

module.exports = router;
