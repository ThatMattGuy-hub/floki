import { Router } from 'express';
import {
  getReports2,
  getReport2ById,
  createReport2,
  updateReport2,
  deleteReport2,
  runWidgetQuery,
  getDataSourceFields
} from '../controllers/report2Controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Reports 2.0 CRUD
router.get('/', getReports2);
router.get('/:id', getReport2ById);
router.post('/', createReport2);
router.patch('/:id', updateReport2);
router.delete('/:id', deleteReport2);

// Widget query execution
router.post('/run-widget', runWidgetQuery);

// Data source metadata
router.get('/data-sources/:dataSourceId/fields', getDataSourceFields);

export default router;
