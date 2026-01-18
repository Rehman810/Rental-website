import adminAuth from '../../controller/adminAuthController/index.js';

const AdminAuthRoute = (app) => {
  app.post('/auth', adminAuth.login);
  app.post('/forgot-password', adminAuth.forgotPassword);
  app.post('/verify-reset-code', adminAuth.verifyResetCode);
  app.put('/reset-password', adminAuth.resetPassword);
  app.get('/logout', adminAuth.logout);
  app.get('/verify-token', adminAuth.verifyToken);
};

export default AdminAuthRoute;
