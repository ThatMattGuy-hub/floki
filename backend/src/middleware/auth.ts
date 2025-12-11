import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { supabase, supabaseAdmin } from '../config/supabase';
import logger from '../config/logger';

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify JWT token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      logger.error('Authentication failed:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Fetch user details from our users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      logger.error('User not found in database:', userError);
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!userData.is_active) {
      return res.status(403).json({
        success: false,
        error: 'User account is inactive'
      });
    }

    req.user = userData;
    req.userId = user.id;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
};

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
};

export const isExternalAgency = (req: AuthenticatedRequest): boolean => {
  return req.user?.role === UserRole.EXTERNAL_AGENCY;
};

export const canManageSettings = (req: AuthenticatedRequest): boolean => {
  return req.user?.role && [UserRole.OWNER, UserRole.ADMIN].includes(req.user.role);
};

export const canManageTeams = (req: AuthenticatedRequest): boolean => {
  return req.user?.role && [UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER].includes(req.user.role);
};

export const canCreateTasks = (req: AuthenticatedRequest): boolean => {
  return req.user?.role && [
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.MANAGER,
    UserRole.CONTRIBUTOR
  ].includes(req.user.role);
};

