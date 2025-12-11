import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getLabels, createLabel, updateLabel, deleteLabel } from '../controllers/labelController';

const router = Router();

router.use(authenticate);

router.get('/', getLabels);
router.post('/', createLabel);
router.patch('/:id', updateLabel);
router.delete('/:id', deleteLabel);

export default router;

