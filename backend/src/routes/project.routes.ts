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
  removeProjectLabel,
  getProjectTeams,
  addProjectTeam,
  removeProjectTeam,
  getProjectProducts,
  addProjectProduct,
  removeProjectProduct
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

// Project Teams
router.get('/:id/teams', getProjectTeams);
router.post('/:id/teams', addProjectTeam);
router.delete('/:id/teams/:team_id', removeProjectTeam);

// Project Products
router.get('/:id/products', getProjectProducts);
router.post('/:id/products', addProjectProduct);
router.delete('/:id/products/:product_id', removeProjectProduct);

export default router;

