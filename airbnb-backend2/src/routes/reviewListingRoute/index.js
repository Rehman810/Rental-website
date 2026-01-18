import { reviewListingController } from '../../controller/reviewListingController/index.js';
import { authenticateHost } from '../../middleWare/authenticate/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js'

const reviewListingRoute = (app) => {
  app.post('/reviews/:listingId', combinedAuthenticate, reviewListingController.addReview);
  app.get('/reviews/:listingId', reviewListingController.getReviewsByListingId);
};

export default reviewListingRoute;
