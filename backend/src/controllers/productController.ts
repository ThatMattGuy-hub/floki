import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { logActivity } from '../utils/audit';
import { getVisibleProductsForExternalAgency } from '../utils/visibility';
import { UserRole } from '../types';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const {
      owner_id,
      created_from,
      created_to,
      sort_by = 'name',
      sort_order = 'asc'
    } = req.query;

    // Build query based on role
    let query = supabaseAdmin
      .from('products')
      .select('*, owner:users!owner_id(id, email, full_name)');

    // Apply filters
    if (owner_id) {
      query = query.eq('owner_id', owner_id);
    }
    if (created_from) {
      query = query.gte('created_at', created_from as string);
    }
    if (created_to) {
      query = query.lte('created_at', created_to as string);
    }

    // Sorting
    const sortField = sort_by as string;
    const ascending = sort_order === 'asc';
    const validSortFields = ['name', 'created_at', 'updated_at'];
    const finalSortField = validSortFields.includes(sortField) ? sortField : 'name';
    
    query = query.order(finalSortField, { ascending });

    // If External Agency, filter by visibility
    if (userRole === UserRole.EXTERNAL_AGENCY) {
      const productIds = await getVisibleProductsForExternalAgency(userId);
      
      if (productIds.length === 0) {
        return res.json({ success: true, data: [] });
      }

      query = query.in('id', productIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Only Owner, Admin, Manager can create products
    if (!['owner', 'admin', 'manager'].includes(userRole?.toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to create products'
      });
    }

    const { name, description, owner_id } = req.body;

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert({
        name,
        description,
        owner_id: owner_id || userId
      })
      .select('*, owner:users!owner_id(id, email, full_name)')
      .single();

    if (error) throw error;

    await logActivity(userId, 'product_created', 'products', data.id, {
      product_name: name
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { id } = req.params;
    const { name, description, owner_id } = req.body;

    // Check permissions
    if (!['owner', 'admin', 'manager'].includes(userRole?.toLowerCase())) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to update products'
      });
    }

    // Build update object
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (owner_id !== undefined) updates.owner_id = owner_id;

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select('*, owner:users!owner_id(id, email, full_name)')
      .single();

    if (error) throw error;

    await logActivity(userId, 'product_updated', 'products', id, {
      product_name: name,
      owner_id: owner_id
    });

    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const { id } = req.params;

    // Only Owner and Admin can delete products
    if (!['owner', 'admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to delete products'
      });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    await logActivity(userId, 'product_deleted', 'products', id);

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

