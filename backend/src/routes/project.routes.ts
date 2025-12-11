import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateProjectPriorities,
  getProjectLabels,
  addProjectLabel,
  removeProjectLabel
} from '../controllers/projectController';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', createProject);
router.put('/:id', updateProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/priorities', updateProjectPriorities);

// Project Labels
router.get('/:id/labels', getProjectLabels);
router.post('/:id/labels', addProjectLabel);
router.delete('/:id/labels/:label_id', removeProjectLabel);

export default router;

