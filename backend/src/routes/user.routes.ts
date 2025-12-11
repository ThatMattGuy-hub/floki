import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate, requireRole } from '../middleware/auth';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

router.use(authenticate);

// Get all users (any authenticated user)
router.get('/', getUsers);

// Admin-only: Create new user
router.post(
  '/',
  requireRole(UserRole.OWNER, UserRole.ADMIN),
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('role').optional().isIn(['Admin', 'Manager', 'Contributor', 'External Agency', 'Viewer']).withMessage('Invalid role')
  ]),
  createUser
);

// Admin-only: Update user
router.patch(
  '/:id',
  requireRole(UserRole.OWNER, UserRole.ADMIN),
  updateUser
);

// Admin-only: Delete user (soft delete)
router.delete(
  '/:id',
  requireRole(UserRole.OWNER, UserRole.ADMIN),
  deleteUser
);

export default router;

