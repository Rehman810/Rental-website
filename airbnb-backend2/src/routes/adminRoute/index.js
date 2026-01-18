import { adminController } from '../../controller/adminController/index.js'; 
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';
import checkRole from '../../middleWare/checkRole/index.js';

const AdminRoute = (app,io) => {
    app.get('/all-temporary-listings', combinedAuthenticate, checkRole(['admin']), (req, res) =>  adminController.getAllListings(io, req, res));
    app.post('/confirm-listing/:listingId', combinedAuthenticate, checkRole(['admin']),(req, res) => adminController.confirmListing(io, req, res));
    app.get('/pending-cnic-verifications', combinedAuthenticate, checkRole(['admin']),(req, res) =>  adminController.getPendingCNICVerifications(io, req, res));
    app.put('/verify-cnic/:hostId',combinedAuthenticate, checkRole(['admin']),(req, res) => adminController.verifyCNIC(io, req, res));
    app.get('/get-temporary-listing/:listingId', combinedAuthenticate, checkRole(['admin']),(req, res) => adminController.getTemporaryListing(io, req, res));

};

export default AdminRoute;
