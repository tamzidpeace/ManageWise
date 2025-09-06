import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { withRole } from '@/lib/authMiddleware';
import { CategoryCreateSchema } from '@/schemas';
import { handleZodError } from '@/utils/validation';

export async function POST(request: NextRequest) {
  try {
    
    // Parse the request body first
    const body = await request.json();
    console.log('Request body:', body);
    
    // Only admin can create categories
    const authResult = await withRole(request, ['admin']);
    
    // If withRole returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      console.log('Authentication or authorization failed');
      return authResult;
    }
    
    console.log('Authenticated user, connecting to database');
    await dbConnect();
    console.log('Connected to database');
    
    // Validate request body with Zod
    const validation = CategoryCreateSchema.safeParse(body);
    if (!validation.success) {
      console.log('Validation failed:', validation.error);
      return handleZodError(validation.error);
    }
    
    const { name, description } = validation.data;
    console.log('Validated data:', { name, description });
    
    // Check if category already exists
    console.log('Checking if category already exists');
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    console.log('Existing category check result:', existingCategory);
    
    if (existingCategory) {
      return NextResponse.json(
        { success: false, message: 'Category with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create category
    console.log('Creating category');
    const category = await Category.create({
      name,
      description,
    });
    console.log('Category created:', category);
    
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
    await dbConnect();
    
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    
    return NextResponse.json(
      { 
        success: true, 
        categories: categories.map(category => ({
          id: category._id,
          name: category.name,
          description: category.description,
        }))
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