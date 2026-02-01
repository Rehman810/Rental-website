import { notificationController } from '../../controller/notificationController/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js';

const notificationRoutes = (app) => {
  app.get('/notifications', combinedAuthenticate, notificationController.getNotifications);
  app.get('/notifications/unread-count', combinedAuthenticate, notificationController.getUnreadCount);
  app.put('/notifications/:notificationId/read', combinedAuthenticate, notificationController.markAsRead);
  app.put('/notifications/read-all', combinedAuthenticate, notificationController.markAllAsRead);
  app.delete('/notifications/:notificationId', combinedAuthenticate, notificationController.deleteNotification);
};

export default notificationRoutes;
