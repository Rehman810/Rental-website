import { reviewListingController } from '../../controller/reviewListingController/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';
import upload from '../../config/cloudnry/index.js';

const reviewListingRoute = (app) => {
  app.post('/api/reviews', combinedAuthenticate, upload.array('photos', 5), reviewListingController.addReview);
  app.get('/api/reviews/listing/:listingId', reviewListingController.getReviewsByListingId);
  app.post('/api/reviews/:reviewId/host-response', combinedAuthenticate, reviewListingController.addHostResponse);
  app.get('/api/reviews/can-review/:bookingId', combinedAuthenticate, reviewListingController.canReview);
};

export default reviewListingRoute;
