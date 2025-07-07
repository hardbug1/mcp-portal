import express from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { body } from 'express-validator';
import { generateTokens } from '../utils/jwt';

const router = express.Router();
const authController = new AuthController();

// Validation schemas
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').isLength({ min: 2 }),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// Regular auth routes
router.post('/register', registerValidation, validateRequest, (req, res) => authController.register(req, res));
router.post('/login', loginValidation, validateRequest, (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refreshToken(req, res));
router.post('/logout', authenticateToken, (req, res) => authController.logout(req, res));
router.get('/me', authenticateToken, (req, res) => authController.getProfile(req, res));

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
    async (req, res) => {
      try {
        const user = req.user as any;
        const tokens = generateTokens(user.id);
        
        // Redirect to frontend with tokens
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('Google OAuth callback error:', error);
        res.redirect('/login?error=auth_callback_failed');
      }
    }
  );
}

// GitHub OAuth routes (only if configured)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/github',
    passport.authenticate('github', { scope: ['user:email'] })
  );

  router.get('/github/callback',
    passport.authenticate('github', { failureRedirect: '/login?error=github_auth_failed' }),
    async (req, res) => {
      try {
        const user = req.user as any;
        const tokens = generateTokens(user.id);
        
        // Redirect to frontend with tokens
        const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
        res.redirect(redirectUrl);
      } catch (error) {
        console.error('GitHub OAuth callback error:', error);
        res.redirect('/login?error=auth_callback_failed');
      }
    }
  );
}

// OAuth status check
router.get('/oauth/status', (req, res) => {
  res.json({
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
  });
});

export default router; 