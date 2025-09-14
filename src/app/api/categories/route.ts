import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { withPermission } from '@/lib/authMiddleware';
import { CategoryCreateSchema } from '@/schemas';
import { handleZodError } from '@/utils/validation';
import { Permissions } from '@/schemas/permissions';

export async function POST(request: NextRequest) {
  try {
    // Only users with CATEGORIES_CREATE permission can create categories
    const authResult = await withPermission(request, Permissions.CATEGORIES_CREATE);
    
    // If withPermission returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = CategoryCreateSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }
    
    const { name, description } = validation.data;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create category
    const category = await Category.create({
      name,
      description,
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Category created successfully',
        category: {
          id: category._id,
          name: category.name,
          description: category.description,
          isActive: category.isActive,
          createdAt: category.createdAt,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Category creation error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while creating the category' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Only users with CATEGORIES_VIEW permission can view categories
    const authResult = await withPermission(request, Permissions.CATEGORIES_VIEW);
    
    // If withPermission returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    // Build query
    const query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Fetch categories with pagination
    const categories = await Category.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
      
    // Get total count for pagination
    const total = await Category.countDocuments(query);
    
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
    
    return NextResponse.json(
      { 
        success: true, 
        categories: categories.map(category => ({
          id: category._id,
          name: category.name,
          description: category.description,
          isActive: category.isActive,
          createdAt: category.createdAt,
        })),
        pagination
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching categories' },
      { status: 500 }
    );
  }
}