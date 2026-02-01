import { notificationController } from '../../controller/notificationController/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';

const notificationRoutes = (app) => {
  app.get('/notifications', combinedAuthenticate, notificationController.getNotifications);
  app.get('/notifications/unread-count', combinedAuthenticate, notificationController.getUnreadCount);
  app.patch('/notifications/:notificationId/read', combinedAuthenticate, notificationController.markAsRead);
  app.patch('/notifications/read-all', combinedAuthenticate, notificationController.markAllAsRead);
};

export default notificationRoutes;
