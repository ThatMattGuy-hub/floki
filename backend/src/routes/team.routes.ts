import { Router } from 'express';
import { param } from 'express-validator';
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
  addTeamMember,
  removeTeamMember,
  getUserTeams
} from '../controllers/teamController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getTeams);
router.post('/', createTeam);

// User teams route (must come before /:id routes)
router.get(
  '/users/:id/teams',
  validate([
    param('id').isUUID().withMessage('Valid user ID is required')
  ]),
  getUserTeams
);

router.get(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Valid team ID is required')
  ]),
  getTeamById
);

router.patch(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Valid team ID is required')
  ]),
  updateTeam
);

router.delete(
  '/:id',
  validate([
    param('id').isUUID().withMessage('Valid team ID is required')
  ]),
  deleteTeam
);

// Team membership routes
router.get(
  '/:id/members',
  validate([
    param('id').isUUID().withMessage('Valid team ID is required')
  ]),
  getTeamMembers
);

router.post(
  '/:id/members',
  validate([
    param('id').isUUID().withMessage('Valid team ID is required')
  ]),
  addTeamMember
);

router.delete(
  '/:id/members/:user_id',
  validate([
    param('id').isUUID().withMessage('Valid team ID is required'),
    param('user_id').isUUID().withMessage('Valid user ID is required')
  ]),
  removeTeamMember
);

export default router;


