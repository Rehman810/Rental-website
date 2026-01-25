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

const allRoutes = async (app, io) => {
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
}
export default allRoutes