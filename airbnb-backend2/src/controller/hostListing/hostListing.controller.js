import Listing from '../../model/listingModel/index.js';
import Host from '../../model/hostModel/index.js';
import Joi from 'joi';
import mongoose from 'mongoose';

// Validation Schema
const updateListingSchema = Joi.object({
    title: Joi.string().min(5).max(100),
    description: Joi.string().min(20).max(2000),
    weekdayPrice: Joi.number().min(1).required(),
    weekendPrice: Joi.number().min(1).required(),
    amenities: Joi.array().items(Joi.string()).min(1),
    bookingMode: Joi.string().valid('instant', 'request'),
    status: Joi.string().valid('active', 'inactive'),
    minNights: Joi.number().min(1).max(365),
    maxNights: Joi.number().min(1).max(365),
    guestCapacity: Joi.number().min(1),
    beds: Joi.number().min(1),
    bedrooms: Joi.number().min(1),
    bathrooms: Joi.number().min(1),
    photos: Joi.array().items(Joi.string()).min(3).message('At least 3 photos are required'),
    street: Joi.string().optional(),
    flat: Joi.string().optional(),
    city: Joi.string().required(),
    town: Joi.string().optional(),
    postcode: Joi.string().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional()
}).unknown(true); // Allow other fields if needed, but we filter in code

// GET /api/host/listings
export const getHostListings = async (req, res) => {
    try {
        const hostId = req.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const listings = await Listing.find({ hostId })
            .select('title city weekdayPrice weekendPrice bookingMode status photos createdAt')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await Listing.countDocuments({ hostId });

        const formattedListings = listings.map(l => ({
            _id: l._id,
            title: l.title,
            city: l.city,
            price: l.weekdayPrice, // Showing weekday price as base
            bookingMode: l.bookingMode,
            status: l.status || 'active', // Default validation if field missing
            coverPhoto: l.photos && l.photos.length > 0 ? l.photos[0] : null,
            createdAt: l.createdAt
        }));

        res.status(200).json({
            listings: formattedListings,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching host listings:", error);
        res.status(500).json({ message: 'Error fetching listings', error: error.message });
    }
};

// GET /api/host/listings/:listingId
export const getHostListingById = async (req, res) => {
    try {
        const { listingId } = req.params;
        const hostId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(listingId)) {
            return res.status(400).json({ message: 'Invalid listing ID' });
        }

        const listing = await Listing.findOne({ _id: listingId, hostId });

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found or access denied' });
        }

        res.status(200).json(listing);
    } catch (error) {
        console.error("Error fetching listing details:", error);
        res.status(500).json({ message: 'Error fetching listing details', error: error.message });
    }
};

// PUT /api/host/listings/:listingId
export const updateHostListing = async (req, res) => {
    try {
        const { listingId } = req.params;
        const hostId = req.user._id;
        const updates = req.body;

        if (!mongoose.Types.ObjectId.isValid(listingId)) {
            return res.status(400).json({ message: 'Invalid listing ID' });
        }

        // Validate input
        const { error, value } = updateListingSchema.validate(updates, { stripUnknown: true });
        if (error) {
            return res.status(400).json({ message: 'Validation error', details: error.details.map(d => d.message) });
        }

        // Safe fields only
        // Strip restricted fields just in case 'stripUnknown' missed some or schema was too broad
        const safeUpdates = {
            ...value
        };

        // Explicitly delete restricted fields if they somehow got in
        delete safeUpdates.hostId;
        delete safeUpdates.reviews;
        delete safeUpdates.ratingAvg;
        delete safeUpdates.ratingCount;
        delete safeUpdates.bookings;
        delete safeUpdates.createdAt;

        // Handle availability structure if passed flat
        if (updates.minNights) safeUpdates.minNights = updates.minNights;
        if (updates.maxNights) safeUpdates.maxNights = updates.maxNights;

        // Find and update
        const listing = await Listing.findOne({ _id: listingId, hostId });

        if (!listing) {
            return res.status(404).json({ message: 'Listing not found or access denied' });
        }

        Object.assign(listing, safeUpdates);

        // Recalculate actual prices if base prices changed
        // Mongoose defaults/virtuals might not auto-update on assign unless we trigger save, which we do.
        // The schema has default functions for actualPrice based on price. 
        // If we update weekdayPrice, we might need to manually trigger the logic or trust the pre-save hooks?
        // The schema has `default: function...`. 
        // It's safer to rely on schema defaults if they run on update? 
        // Using `listing.save()` runs pre-save and defaults checks usually if marked modified.

        // Manually ensure consistency if needed
        if (safeUpdates.weekdayPrice) {
            listing.weekdayActualPrice = Math.round(safeUpdates.weekdayPrice * (1 + (listing.weekdayCommission || 13) / 100));
        }
        if (safeUpdates.weekendPrice) {
            listing.weekendActualPrice = Math.round(safeUpdates.weekendPrice * (1 + (listing.weekendCommission || 13) / 100));
        }

        await listing.save();

        res.status(200).json({ message: 'Listing updated successfully', listing });

    } catch (error) {
        console.error("Error updating listing:", error);
        res.status(500).json({ message: 'Error updating listing', error: error.message });
    }
};
