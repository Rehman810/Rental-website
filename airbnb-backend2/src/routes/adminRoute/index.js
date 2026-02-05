import { adminController } from '../../controller/adminController/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';
import checkRole from '../../middleWare/checkRole/index.js';

const AdminRoute = (app, io) => {
    app.get('/all-temporary-listings', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.getAllListings(io, req, res));
    app.post('/confirm-listing/:listingId', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.confirmListing(io, req, res));
    app.get('/pending-cnic-verifications', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.getPendingCNICVerifications(io, req, res));
    app.put('/verify-cnic/:hostId', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.verifyCNIC(io, req, res));
    app.get('/get-temporary-listing/:listingId', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.getTemporaryListing(io, req, res));
    app.get('/get-users-verification', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.getUsersForVerification(io, req, res));
    app.put('/verify-email/:hostId', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.updateEmailVerification(io, req, res));
    app.post('/admin/bookings/expire-pending', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.triggerExpirePendingBookings(io, req, res));
    app.get('/dashboard/summary', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.getDashboardSummary(io, req, res));
    app.get('/dashboard/stats', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.getDashboardStats(io, req, res));
    app.get('/dashboard/alerts', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.getDashboardAlerts(io, req, res));

    // Host Management Routes
    app.get('/api/admin/hosts', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.getHosts(io, req, res));
    app.get('/api/admin/hosts/:hostId', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.getHostDetails(io, req, res));
    app.patch('/api/admin/hosts/:hostId/verify', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.verifyHostKYC(io, req, res));
    app.patch('/api/admin/hosts/:hostId/suspend', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.suspendHost(io, req, res));
    app.patch('/api/admin/hosts/:hostId/ban', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.banHost(io, req, res));
    app.patch('/api/admin/hosts/:hostId/reactivate', combinedAuthenticate, checkRole(['admin']), (req, res) => adminController.reactivateHost(io, req, res));
};

export default AdminRoute;
