import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getSubtasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
  getChecklistItems,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  reorderChecklistItems,
  getWatchers,
  addWatcher,
  removeWatcher,
  getTaskLabels,
  addTaskLabel,
  removeTaskLabel
} from '../controllers/subtaskController';
import {
  getTaskCustomFieldValues,
  updateTaskCustomFieldValues
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Subtasks
router.get(
  '/:task_id/subtasks',
  validate([param('task_id').isUUID()]),
  getSubtasks
);

router.post(
  '/:task_id/subtasks',
  validate([
    param('task_id').isUUID(),
    body('title').notEmpty().withMessage('Title is required')
  ]),
  createSubtask
);

router.patch(
  '/:task_id/subtasks/:subtask_id',
  validate([
    param('task_id').isUUID(),
    param('subtask_id').isUUID()
  ]),
  updateSubtask
);

router.delete(
  '/:task_id/subtasks/:subtask_id',
  validate([
    param('task_id').isUUID(),
    param('subtask_id').isUUID()
  ]),
  deleteSubtask
);

// Checklist items
router.get(
  '/:task_id/checklist',
  validate([param('task_id').isUUID()]),
  getChecklistItems
);

router.post(
  '/:task_id/checklist',
  validate([
    param('task_id').isUUID(),
    body('title').notEmpty().withMessage('Title is required')
  ]),
  createChecklistItem
);

router.patch(
  '/:task_id/checklist/:item_id',
  validate([
    param('task_id').isUUID(),
    param('item_id').isUUID()
  ]),
  updateChecklistItem
);

router.delete(
  '/:task_id/checklist/:item_id',
  validate([
    param('task_id').isUUID(),
    param('item_id').isUUID()
  ]),
  deleteChecklistItem
);

router.post(
  '/:task_id/checklist/reorder',
  validate([param('task_id').isUUID()]),
  reorderChecklistItems
);

// Watchers
router.get(
  '/:task_id/watchers',
  validate([param('task_id').isUUID()]),
  getWatchers
);

router.post(
  '/:task_id/watchers',
  validate([
    param('task_id').isUUID(),
    body('user_id').isUUID().withMessage('Valid user ID is required')
  ]),
  addWatcher
);

router.delete(
  '/:task_id/watchers/:user_id',
  validate([
    param('task_id').isUUID(),
    param('user_id').isUUID()
  ]),
  removeWatcher
);

// Custom Field Values
router.get(
  '/:task_id/custom-fields',
  validate([param('task_id').isUUID()]),
  getTaskCustomFieldValues
);

router.put(
  '/:task_id/custom-fields',
  validate([param('task_id').isUUID()]),
  updateTaskCustomFieldValues
);

// Task Labels
router.get(
  '/:task_id/labels',
  validate([param('task_id').isUUID()]),
  getTaskLabels
);

router.post(
  '/:task_id/labels',
  validate([param('task_id').isUUID()]),
  addTaskLabel
);

router.delete(
  '/:task_id/labels/:label_id',
  validate([
    param('task_id').isUUID(),
    param('label_id').isUUID()
  ]),
  removeTaskLabel
);

export default router;

