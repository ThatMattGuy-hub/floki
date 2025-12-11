import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAgencies,
  getAgencyById,
  createAgency,
  updateAgency,
  deleteAgency
} from '../controllers/agencyController';

const router = Router();

router.use(authenticate);

router.get('/', getAgencies);
router.get('/:id', getAgencyById);
router.post('/', createAgency);
router.put('/:id', updateAgency);
router.delete('/:id', deleteAgency);

export default router;

