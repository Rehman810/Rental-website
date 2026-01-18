import  {bookingController} from '../../controller/bookingController/index.js';
import { authenticateHost } from '../../middleWare/authenticate/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js'

const bookingRoute = (app) => {
    app.post('/create-bookings/:listingId/',combinedAuthenticate, bookingController.createBooking);
    app.post('/confirm-booking/:bookingId', combinedAuthenticate, bookingController.confirmBooking);
    app.delete('/reject-booking/:bookingId', combinedAuthenticate, bookingController.deleteBooking);
    app.get('/temporary-booking', combinedAuthenticate, bookingController.getTemporaryBookings);
    app.get('/get-confirmed-booking', combinedAuthenticate, bookingController.getConfirmedBookings);

    app.get('/bookings-checking-out-today', combinedAuthenticate, bookingController.getBookingsCheckingOutToday);
    app.get('/currently-hosting', combinedAuthenticate, bookingController.getCurrentlyHostingBookings);
    app.get('/upcoming-bookings', combinedAuthenticate, bookingController.getUpcomingBookings);

    app.get('/guest-bookings', combinedAuthenticate, bookingController.getUserBookings);
    app.get('/confirmed-booking-dates', combinedAuthenticate, bookingController.getConfirmedBookingDates);

}
export default bookingRoute;
