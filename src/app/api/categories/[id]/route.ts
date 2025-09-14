import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { withPermission } from '@/lib/authMiddleware';
import { CategoryCreateSchema } from '@/schemas';
import { handleZodError } from '@/utils/validation';
import { Permissions } from '@/schemas/permissions';
import { z } from 'zod';

// Schema for updating isActive status
const CategoryStatusUpdateSchema = z.object({
  isActive: z.boolean(),
});

// Schema for updating category details
const CategoryUpdateSchema = CategoryCreateSchema.extend({
  isActive: z.boolean().optional(),
}).partial();

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      // Only users with CATEGORIES_VIEW permission can view categories
      const authResult = await withPermission(request, Permissions.CATEGORIES_VIEW);
      
      // If withPermission returned a response, it means authentication or authorization failed
      if (authResult instanceof NextResponse) {
        return authResult;
      }
      
      await dbConnect();
      const { id } = await params;
  
      if (!id) {
        return NextResponse.json(
          { success: false, message: 'Category ID is required' },
          { status: 400 }
        );
      }
  
      const category = await Category.findById(id);
  
      if (!category) {
        return NextResponse.json(
          { success: false, message: 'Category not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json({ success: true, category }, { status: 200 });
    } catch (error) {
      console.error('Category fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'An error occurred while fetching the category' },
        { status: 500 }
      );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Only users with CATEGORIES_UPDATE permission can update categories
    const authResult = await withPermission(request, Permissions.CATEGORIES_UPDATE);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
  
    try {
      await dbConnect();
      const { id } = await params;
  
      if (!id) {
        return NextResponse.json(
          { success: false, message: 'Category ID is required' },
          { status: 400 }
        );
      }
  
      const body = await request.json();
      
      // Check if we're only updating the isActive status
      if (Object.keys(body).length === 1 && body.hasOwnProperty('isActive')) {
        // Validate only isActive field
        const validation = CategoryStatusUpdateSchema.safeParse(body);
        
        if (!validation.success) {
          return handleZodError(validation.error);
        }
        
        const { isActive } = validation.data;
        
        const updatedCategory = await Category.findByIdAndUpdate(
          id,
          { isActive },
          { new: true, runValidators: true }
        );
        
        if (!updatedCategory) {
          return NextResponse.json(
            { success: false, message: 'Category not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json(
          { 
            success: true, 
            message: 'Category status updated successfully', 
            category: updatedCategory 
          },
          { status: 200 }
        );
      } else {
        // Updating category details (name, description, etc.)
        const validation = CategoryUpdateSchema.safeParse(body);
        
        if (!validation.success) {
          return handleZodError(validation.error);
        }
        
        const { name, description, isActive } = validation.data;
        
        // Check for duplicate name if name is being updated
        if (name) {
          const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') }, 
            _id: { $ne: id } 
          });
          if (existingCategory) {
            return NextResponse.json(
              { success: false, message: 'Category with this name already exists' },
              { status: 409 }
            );
          }
        }
        
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;
        
        const updatedCategory = await Category.findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        );
        
        if (!updatedCategory) {
          return NextResponse.json(
            { success: false, message: 'Category not found' },
            { status: 404 }
          );
        }
        
        return NextResponse.json(
          { 
            success: true, 
            message: 'Category updated successfully', 
            category: updatedCategory 
          },
          { status: 200 }
        );
      }
    } catch (error) {
      console.error('Category update error:', error);
      return NextResponse.json(
        { success: false, message: 'An error occurred while updating the category' },
        { status: 500 }
      );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Only users with CATEGORIES_DELETE permission can delete categories
    const authResult = await withPermission(request, Permissions.CATEGORIES_DELETE);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
  
    try {
      await dbConnect();
      const { id } = await params;
  
      if (!id) {
        return NextResponse.json(
          { success: false, message: 'Category ID is required' },
          { status: 400 }
        );
      }
  
      const deletedCategory = await Category.findByIdAndDelete(id);
  
      if (!deletedCategory) {
        return NextResponse.json(
          { success: false, message: 'Category not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { success: true, message: 'Category deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Category deletion error:', error);
      return NextResponse.json(
        { success: false, message: 'An error occurred while deleting the category' },
        { status: 500 }
      );
    }
}