import { supabase, supabaseAdmin } from '../config/supabase';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { createWriteStream } from 'fs';
import logger from '../config/logger';

interface UploadResult {
  success: boolean;
  data?: {
    file_id: string;
    storage_path: string;
    thumbnail_path?: string;
    public_url: string;
  };
  error?: string;
}

const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  videos: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '104857600'); // 100MB

export async function uploadFile(
  file: Express.Multer.File,
  taskId: string,
  userId: string
): Promise<UploadResult> {
  try {
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      };
    }

    // Validate file type
    const isValidType = Object.values(ALLOWED_FILE_TYPES).flat().includes(file.mimetype);
    if (!isValidType) {
      return {
        success: false,
        error: 'File type not allowed'
      };
    }

    // Generate storage path
    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}${fileExt}`;
    const storagePath = `tasks/${taskId}/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('files')
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      logger.error('Failed to upload file to storage:', uploadError);
      return {
        success: false,
        error: 'Failed to upload file'
      };
    }

    // Generate thumbnail for images and videos
    let thumbnailPath: string | undefined;
    if (ALLOWED_FILE_TYPES.images.includes(file.mimetype)) {
      thumbnailPath = await generateImageThumbnail(file.buffer, storagePath);
    } else if (ALLOWED_FILE_TYPES.videos.includes(file.mimetype)) {
      thumbnailPath = await generateVideoThumbnail(file.buffer, storagePath);
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('files')
      .getPublicUrl(storagePath);

    // Save file record to database
    const { data: fileRecord, error: dbError } = await supabaseAdmin
      .from('files')
      .insert({
        task_id: taskId,
        uploaded_by: userId,
        file_name: file.originalname,
        file_size: file.size,
        file_type: file.mimetype,
        storage_path: storagePath,
        thumbnail_path: thumbnailPath
      })
      .select()
      .single();

    if (dbError || !fileRecord) {
      logger.error('Failed to save file record:', dbError);
      // Clean up uploaded file
      await supabaseAdmin.storage.from('files').remove([storagePath]);
      return {
        success: false,
        error: 'Failed to save file record'
      };
    }

    return {
      success: true,
      data: {
        file_id: fileRecord.id,
        storage_path: storagePath,
        thumbnail_path: thumbnailPath,
        public_url: urlData.publicUrl
      }
    };
  } catch (error: any) {
    logger.error('Error uploading file:', error);
    return {
      success: false,
      error: error.message || 'Upload failed'
    };
  }
}

async function generateImageThumbnail(
  buffer: Buffer,
  originalPath: string
): Promise<string | undefined> {
  try {
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    const thumbnailPath = originalPath.replace(/\.[^.]+$/, '_thumb.jpg');

    const { error } = await supabaseAdmin.storage
      .from('files')
      .upload(thumbnailPath, thumbnailBuffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      logger.error('Failed to upload thumbnail:', error);
      return undefined;
    }

    return thumbnailPath;
  } catch (error) {
    logger.error('Error generating image thumbnail:', error);
    return undefined;
  }
}

async function generateVideoThumbnail(
  buffer: Buffer,
  originalPath: string
): Promise<string | undefined> {
  try {
    // For video thumbnails, we'd need to save the buffer to a temp file first
    // This is a simplified implementation
    // In production, consider using a job queue for this
    logger.info('Video thumbnail generation not fully implemented');
    return undefined;
  } catch (error) {
    logger.error('Error generating video thumbnail:', error);
    return undefined;
  }
}

export async function deleteFile(fileId: string, userId: string): Promise<boolean> {
  try {
    // Get file record
    const { data: file } = await supabaseAdmin
      .from('files')
      .select('storage_path, thumbnail_path, uploaded_by')
      .eq('id', fileId)
      .single();

    if (!file) {
      return false;
    }

    // Check permissions (only file uploader or admin can delete)
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (file.uploaded_by !== userId && !['Owner', 'Admin'].includes(user?.role)) {
      return false;
    }

    // Delete from storage
    const pathsToDelete = [file.storage_path];
    if (file.thumbnail_path) {
      pathsToDelete.push(file.thumbnail_path);
    }

    await supabaseAdmin.storage.from('files').remove(pathsToDelete);

    // Delete from database
    await supabaseAdmin
      .from('files')
      .delete()
      .eq('id', fileId);

    return true;
  } catch (error) {
    logger.error('Error deleting file:', error);
    return false;
  }
}

export async function getFileUrl(filePath: string): Promise<string> {
  const { data } = supabaseAdmin.storage
    .from('files')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin.storage
      .from('files')
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      logger.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    logger.error('Error creating signed URL:', error);
    return null;
  }
}

