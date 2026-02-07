import { getHostProfile, getGuestProfile } from '../../controller/profileController/index.js';

const profileRoute = (app) => {
    app.get('/api/profiles/host/:hostId', getHostProfile);
    app.get('/api/profiles/guest/:guestId', getGuestProfile);
};

export default profileRoute;
