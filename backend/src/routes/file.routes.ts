import { Router } from 'express';
import { param } from 'express-validator';
import {
  uploadTaskFile,
  getTaskFiles,
  deleteTaskFile,
  getFileDownloadUrl,
  upload
} from '../controllers/fileController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post(
  '/:task_id/files',
  validate([param('task_id').isUUID()]),
  upload.single('file'),
  uploadTaskFile
);

router.get(
  '/:task_id/files',
  validate([param('task_id').isUUID()]),
  getTaskFiles
);

router.delete(
  '/:task_id/files/:file_id',
  validate([
    param('task_id').isUUID(),
    param('file_id').isUUID()
  ]),
  deleteTaskFile
);

router.get(
  '/:task_id/files/:file_id/download',
  validate([
    param('task_id').isUUID(),
    param('file_id').isUUID()
  ]),
  getFileDownloadUrl
);

export default router;

