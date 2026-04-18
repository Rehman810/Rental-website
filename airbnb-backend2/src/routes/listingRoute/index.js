import { listingController } from '../../controller/listingController/index.js';
import { searchListings, aiSearch } from '../../controller/search.controller.js';
import upload from '../../config/cloudnry/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';
import { limiter } from '../../app.js';
import cacheMiddleware from '../../middlewares/cacheMiddleware.js';

const listingRoute = (app) => {
    // Cache search results for 5 minutes (300 seconds)
    app.get('/api/listings/search', cacheMiddleware(300), searchListings);
    app.post('/api/search/ai', aiSearch);

    app.post('/listings', combinedAuthenticate, upload.array('photos', 8), limiter, listingController.createListing);
    app.get('/listings/:hostId', combinedAuthenticate, listingController.getListingsByHostId);
    app.get('/listing/:id', listingController.getListingById);
    app.get('/all-listring', listingController.getAllListings)
    app.put('/listing/:id', combinedAuthenticate, upload.single('image'), listingController.updateListing);
    app.delete('/listing/:id', combinedAuthenticate, listingController.deleteListing);
    app.put('/listing/:listingId/booking-mode', combinedAuthenticate, listingController.updateBookingMode);
    app.put('/listing/:listingId/availability', combinedAuthenticate, listingController.updateAvailability);
    app.put('/listing/:listingId/guest-requirements', combinedAuthenticate, listingController.updateGuestRequirements);
    app.put('/listing/:listingId/cancellation-policy', combinedAuthenticate, listingController.updateCancellationPolicy);
    app.put('/listing/:listingId/ai-assistant', combinedAuthenticate, listingController.updateAiAssistant);
    app.post('/listings/migrate-modes', combinedAuthenticate, listingController.migrateBookingModes);
};

export default listingRoute;
