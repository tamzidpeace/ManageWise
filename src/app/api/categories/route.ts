import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Category from '@/models/Category';
import { withRole } from '@/lib/authMiddleware';

export async function POST(request: NextRequest) {
  try {
    // Only admin can create categories
    const authResult = await withRole(request, ['admin']);
    
    // If withRole returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const { name, description } = await request.json();
    
    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }
    
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