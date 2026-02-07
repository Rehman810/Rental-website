import authRoute from "../authRoute/index.js"
import bookingRoute from "../bookingRoute/index.js"
import listingRoute from "../listingRoute/index.js"
import reviewListingRoute from "../reviewListingRoute/index.js"
import AdminAuthRoute from '../adminAuthRoute/index.js'
import AdminRoute from "../adminRoute/index.js"
import chatController from "../chatRoute/index.js"
import notificationRoutes from "../notificationRoute/index.js"

import stripeRoute from "../stripeRoute/index.js"
import hostSettingsRoute from "../hostSettingsRoute/index.js"
import hostDashboardRoute from "../hostDashboardRoute/index.js"
import platformSettingsRoute from '../platformSettingsRoute/index.js'
import wishlistRoute from '../wishlistRoute/index.js'
import cancellationPolicyRoute from '../cancellationPolicy/index.js';
import hostListingRoute from '../hostListingRoute/index.js';
import profileRoute from "../profileRoute/index.js";

import { setSocket } from '../../config/notifications/notificationService.js';

const allRoutes = async (app, io) => {
    // Initialize socket for notifications
    setSocket(io);

    authRoute(app)
    listingRoute(app)
    bookingRoute(app)
    reviewListingRoute(app)
    AdminAuthRoute(app)
    AdminRoute(app, io)
    chatController(app, io)
    notificationRoutes(app)
    stripeRoute(app)
    hostSettingsRoute(app)
    hostDashboardRoute(app)
    platformSettingsRoute(app)
    hostListingRoute(app)
    cancellationPolicyRoute(app)
    wishlistRoute(app)
    profileRoute(app)
}
export default allRoutes