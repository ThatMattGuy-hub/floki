import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabase';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../config/logger';
import { UserRole } from '../types';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, full_name, role = UserRole.VIEWER } = req.body;

  // Create auth user with Supabase
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password
  });

  if (authError || !authData.user) {
    logger.error('Registration error:', authError);
    return res.status(400).json({
      success: false,
      error: authError?.message || 'Registration failed'
    });
  }

  // Create user record in our users table
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      full_name,
      role
    })
    .select()
    .single();

  if (userError) {
    logger.error('User creation error:', userError);
    // Clean up auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return res.status(400).json({
      success: false,
      error: 'Failed to create user profile'
    });
  }

  res.status(201).json({
    success: true,
    data: {
      user: userData,
      session: authData.session
    },
    message: 'User registered successfully'
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error || !data.user) {
    logger.error('Login error:', error);
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password'
    });
  }

  // Fetch user details
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (userError || !userData) {
    return res.status(404).json({
      success: false,
      error: 'User profile not found'
    });
  }

  if (!userData.is_active) {
    return res.status(403).json({
      success: false,
      error: 'Account is inactive'
    });
  }

  res.json({
    success: true,
    data: {
      user: userData,
      session: data.session
    },
    message: 'Login successful'
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    logger.error('Logout error:', error);
    return res.status(400).json({
      success: false,
      error: 'Logout failed'
    });
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required'
    });
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token
  });

  if (error) {
    logger.error('Token refresh error:', error);
    return res.status(401).json({
      success: false,
      error: 'Failed to refresh token'
    });
  }

  res.json({
    success: true,
    data: {
      session: data.session
    }
  });
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing authorization header'
    });
  }

  const token = authHeader.substring(7);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }

  // Fetch full user details
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  res.json({
    success: true,
    data: userData
  });
});

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.FRONTEND_URL}/reset-password`
  });

  if (error) {
    logger.error('Password reset request error:', error);
    return res.status(400).json({
      success: false,
      error: 'Failed to send password reset email'
    });
  }

  res.json({
    success: true,
    message: 'Password reset email sent'
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { password } = req.body;
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Missing authorization header'
    });
  }

  const token = authHeader.substring(7);

  const { error } = await supabase.auth.updateUser({
    password
  });

  if (error) {
    logger.error('Password reset error:', error);
    return res.status(400).json({
      success: false,
      error: 'Failed to reset password'
    });
  }

  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

