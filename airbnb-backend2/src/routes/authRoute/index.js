import authController from '../../controller/authController/index.js';
import passport from 'passport';
import  {authenticateHost } from '../../middleWare/authenticate/index.js';
import upload from '../../config/cloudnry/index.js';
import combinedAuthenticate from '../../middleWare/combineAuthenticate/index.js'

const authRoute = (app) => {
  app.post('/signUp', authController.signUp);
  app.post('/login', authController.login);
    app.put('/update-profile/:hostId', combinedAuthenticate, 
      upload.fields([
        { name: 'profileImage', maxCount: 1 }, 
        { name: 'CNIC', maxCount: 2 }  
      ]), 
      authController.updateProfile);
  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', failureMessage: true }),
    (req, res) => {
      const message = req.authInfo?.message || 'Authentication successful';
      res.status(200).json({ message, user: req.user });
    }
  );
  

  app.post('/verify-token', authController.verifyToken);
  app.post('/logout', authController.logout);
};

export default authRoute;
