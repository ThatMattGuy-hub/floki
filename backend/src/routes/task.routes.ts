import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTaskComments,
  addTaskComment,
  deleteTaskComment,
  updateTaskPriorities
} from '../controllers/taskController';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getTasks);

router.get(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Valid task ID is required')
  ]),
  getTaskById
);

router.post(
  '/',
  requireRole(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER, UserRole.CONTRIBUTOR),
  validate([
    body('project_id').isUUID().withMessage('Valid project ID is required'),
    body('title').notEmpty().withMessage('Title is required'),
    body('priority').optional().isInt({ min: 0 }).withMessage('Priority must be a non-negative integer')
  ]),
  createTask
);

router.patch(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Valid task ID is required')
  ]),
  updateTask
);

router.delete(
  '/:id',
  requireRole(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER),
  validate([
    param('id').isUUID().withMessage('Valid task ID is required')
  ]),
  deleteTask
);

router.get(
  '/:id/comments',
  validate([
    param('id').isUUID().withMessage('Valid task ID is required')
  ]),
  getTaskComments
);

router.post(
  '/:id/comments',
  validate([
    param('id').isUUID().withMessage('Valid task ID is required'),
    body('content').notEmpty().withMessage('Comment content is required')
  ]),
  addTaskComment
);

router.delete(
  '/:id/comments/:comment_id',
  validate([
    param('id').isUUID().withMessage('Valid task ID is required'),
    param('comment_id').isUUID().withMessage('Valid comment ID is required')
  ]),
  deleteTaskComment
);

router.post(
  '/priorities',
  requireRole(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER),
  updateTaskPriorities
);

export default router;

