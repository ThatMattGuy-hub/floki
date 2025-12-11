import { Response } from 'express';
import multer from 'multer';
import { AuthenticatedRequest } from '../types';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { canUserSeeTask } from '../utils/visibility';
import { uploadFile, deleteFile, getSignedUrl } from '../services/fileService';
import { supabaseAdmin } from '../config/supabase';
import logger from '../config/logger';

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600') // 100MB
  }
});

export const uploadTaskFile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;
  const file = req.file;

  if (!file) {
    throw new AppError('No file provided', 400);
  }

  // Check visibility
  const canSee = await canUserSeeTask(req.userId!, task_id);
  if (!canSee) {
    throw new AppError('Task not found or access denied', 404);
  }

  // Upload file
  const result = await uploadFile(file, task_id, req.userId!);

  if (!result.success) {
    throw new AppError(result.error || 'File upload failed', 500);
  }

  res.status(201).json({
    success: true,
    data: result.data,
    message: 'File uploaded successfully'
  });
});

export const getTaskFiles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id } = req.params;

  // Check visibility
  const canSee = await canUserSeeTask(req.userId!, task_id);
  if (!canSee) {
    throw new AppError('Task not found or access denied', 404);
  }

  const { data: files, error } = await supabaseAdmin
    .from('files')
    .select(`
      *,
      uploaded_by_user:users!files_uploaded_by_fkey(id, full_name, email, avatar_url)
    `)
    .eq('task_id', task_id)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Failed to fetch files:', error);
    throw new AppError('Failed to fetch files', 500);
  }

  res.json({
    success: true,
    data: files
  });
});

export const deleteTaskFile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id, file_id } = req.params;

  // Check visibility
  const canSee = await canUserSeeTask(req.userId!, task_id);
  if (!canSee) {
    throw new AppError('Task not found or access denied', 404);
  }

  const success = await deleteFile(file_id, req.userId!);

  if (!success) {
    throw new AppError('Failed to delete file or insufficient permissions', 403);
  }

  res.json({
    success: true,
    message: 'File deleted successfully'
  });
});

export const getFileDownloadUrl = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { task_id, file_id } = req.params;

  // Check visibility
  const canSee = await canUserSeeTask(req.userId!, task_id);
  if (!canSee) {
    throw new AppError('Task not found or access denied', 404);
  }

  const { data: file } = await supabaseAdmin
    .from('files')
    .select('storage_path')
    .eq('id', file_id)
    .eq('task_id', task_id)
    .single();

  if (!file) {
    throw new AppError('File not found', 404);
  }

  const signedUrl = await getSignedUrl(file.storage_path, 3600); // 1 hour expiry

  if (!signedUrl) {
    throw new AppError('Failed to generate download URL', 500);
  }

  res.json({
    success: true,
    data: {
      url: signedUrl,
      expires_in: 3600
    }
  });
});

