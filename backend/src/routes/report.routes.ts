import { Router } from 'express';
import {
  getReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  executeReport
} from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', getReports);
router.get('/:id', getReportById);
router.post('/', createReport);
router.patch('/:id', updateReport);
router.delete('/:id', deleteReport);
router.post('/:id/execute', executeReport);

export default router;
