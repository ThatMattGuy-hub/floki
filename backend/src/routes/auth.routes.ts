import { Router } from 'express';
import { body } from 'express-validator';
import {
  login,
  logout,
  refreshToken,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
  changePassword
} from '../controllers/authController';
import { validate } from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ]),
  login
);

router.post('/logout', logout);

router.post(
  '/refresh',
  validate([
    body('refresh_token').notEmpty().withMessage('Refresh token is required')
  ]),
  refreshToken
);

router.get('/me', getCurrentUser);

router.post(
  '/password-reset/request',
  validate([
    body('email').isEmail().withMessage('Valid email is required')
  ]),
  requestPasswordReset
);

router.post(
  '/password-reset/confirm',
  validate([
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ]),
  resetPassword
);

router.post(
  '/change-password',
  authenticate,
  validate([
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  ]),
  changePassword
);

export default router;

