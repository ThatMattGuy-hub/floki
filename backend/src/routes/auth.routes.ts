import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  logout,
  refreshToken,
  getCurrentUser,
  requestPasswordReset,
  resetPassword
} from '../controllers/authController';
import { validate } from '../middleware/validation';

const router = Router();

router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('full_name').notEmpty().withMessage('Full name is required')
  ]),
  register
);

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

export default router;

