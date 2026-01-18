import  {listingController} from '../../controller/listingController/index.js';
import upload from '../../config/cloudnry/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js'
import {limiter} from '../../app.js'

const listingRoute = (app) => {
    app.post('/listings',combinedAuthenticate, upload.array('photos', 8), limiter, listingController.createListing);
    app.get('/listings/:hostId', combinedAuthenticate,listingController.getListingsByHostId);
    app.get('/listing/:id',listingController.getListingById);
    app.get('/all-listring',listingController.getAllListings)
    app.put('/listing/:id', combinedAuthenticate, upload.single('image'), listingController.updateListing);
    app.delete('/listing/:id', combinedAuthenticate, listingController.deleteListing);
};

export default listingRoute;
