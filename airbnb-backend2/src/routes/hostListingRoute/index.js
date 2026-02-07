import express from 'express';
import { getHostListings, getHostListingById, updateHostListing } from '../../controller/hostListing/hostListing.controller.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';
import checkRole from '../../middleWare/checkRole/index.js';

const router = express.Router();

// Middleware for all routes here
router.use(combinedAuthenticate);
router.use(checkRole(['host']));

// GET /api/host/listings
router.get('/', getHostListings);

// GET /api/host/listings/:listingId
router.get('/:listingId', getHostListingById);

// PUT /api/host/listings/:listingId
router.put('/:listingId', updateHostListing);

export default (app) => {
    app.use('/api/host/listings', router);
};
