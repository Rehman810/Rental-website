import {notificationController} from '../../controller/notificationController/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';

const notificationRoutes = (app) => {
  app.get('/notifications', combinedAuthenticate, notificationController.getNotifications);
  app.get('/notifications/unread', combinedAuthenticate, notificationController.getUnreadNotifications);
  app.put('/notifications/:notificationId/read', combinedAuthenticate, notificationController.markAsRead);
};

export default notificationRoutes;
