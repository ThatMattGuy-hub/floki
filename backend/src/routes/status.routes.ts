import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getStatuses, createStatus, updateStatus, deleteStatus } from '../controllers/statusController';

const router = Router();

router.use(authenticate);

router.get('/', getStatuses);
router.post('/', createStatus);
router.patch('/:id', updateStatus);
router.delete('/:id', deleteStatus);

export default router;

