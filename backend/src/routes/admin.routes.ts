import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  getAutomations,
  createAutomation,
  updateAutomation,
  deleteAutomation,
  getApprovalWorkflows,
  createApprovalWorkflow,
  updateApprovalWorkflow,
  deleteApprovalWorkflow,
  getSLARules,
  createSLARule,
  updateSLARule,
  deleteSLARule,
  getEmailSettings,
  saveEmailSettings,
  testEmailConnection,
  getEmailTemplates,
  updateEmailTemplate,
  getAuditLogs,
  exportAuditLogs,
  getProjectStatuses,
  createProjectStatus,
  updateProjectStatus,
  deleteProjectStatus
} from '../controllers/adminController';

const router = Router();

router.use(authenticate);

// Custom Fields
router.get('/custom-fields', getCustomFields);
router.post('/custom-fields', createCustomField);
router.patch('/custom-fields/:id', updateCustomField);
router.delete('/custom-fields/:id', deleteCustomField);

// Automations
router.get('/automations', getAutomations);
router.post('/automations', createAutomation);
router.patch('/automations/:id', updateAutomation);
router.delete('/automations/:id', deleteAutomation);

// Approval Workflows
router.get('/approval-workflows', getApprovalWorkflows);
router.post('/approval-workflows', createApprovalWorkflow);
router.patch('/approval-workflows/:id', updateApprovalWorkflow);
router.delete('/approval-workflows/:id', deleteApprovalWorkflow);

// SLA Rules
router.get('/sla-rules', getSLARules);
router.post('/sla-rules', createSLARule);
router.patch('/sla-rules/:id', updateSLARule);
router.delete('/sla-rules/:id', deleteSLARule);

// Email Settings
router.get('/email-settings', getEmailSettings);
router.post('/email-settings', saveEmailSettings);
router.post('/email-settings/test', testEmailConnection);

// Email Templates
router.get('/email-templates', getEmailTemplates);
router.patch('/email-templates/:id', updateEmailTemplate);

// Audit Logs
router.get('/audit-logs', getAuditLogs);
router.get('/audit-logs/export', exportAuditLogs);

// Project Statuses
router.get('/project-statuses', getProjectStatuses);
router.post('/project-statuses', createProjectStatus);
router.patch('/project-statuses/:id', updateProjectStatus);
router.delete('/project-statuses/:id', deleteProjectStatus);

export default router;

