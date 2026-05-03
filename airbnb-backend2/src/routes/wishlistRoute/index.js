import { wishlistController } from '../../controller/wishlistController/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';

const wishlistRoute = (app) => {
    app.get('/wishlist', combinedAuthenticate, wishlistController.getWishlist);
    app.post('/wishlist', combinedAuthenticate, wishlistController.addItem);
    app.delete('/wishlist/:itemId', combinedAuthenticate, wishlistController.removeItem);
    app.delete('/wishlist', combinedAuthenticate, wishlistController.clearWishlist);
    app.post('/wishlist/track', combinedAuthenticate, wishlistController.trackInteraction);
};

export default wishlistRoute;
