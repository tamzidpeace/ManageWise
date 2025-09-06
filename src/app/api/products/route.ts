import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Brand from '@/models/Brand';
import { withRole } from '@/lib/authMiddleware';
import { ProductCreateSchema } from '@/schemas';
import { handleZodError } from '@/utils/validation';

export async function POST(request: NextRequest) {
  try {
    // Only admin can create products
    const authResult = await withRole(request, ['admin']);
    
    // If withRole returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = ProductCreateSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }
    
    const { name, categoryId, brandId, price, stock, description, image } = validation.data;
    
    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }
    
    // Check if brand exists (if provided)
    let brand = null;
    if (brandId) {
      brand = await Brand.findById(brandId);
      if (!brand) {
        return NextResponse.json(
          { success: false, message: 'Brand not found' },
          { status: 404 }
        );
      }
    }
    
    // Create product
    const product = await Product.create({
      name,
      category: categoryId,
      brand: brandId,
      price,
      stock,
      description,
      image,
    });
    
    // Populate references for response
    await product.populate(['category', 'brand']);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Product created successfully',
        product
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while creating the product' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('category') || '';
    
    // Build filter object
    const filter: any = { isActive: true };
    
    if (search) {
      filter.$text = { $search: search };
    }
    
    if (categoryId) {
      filter.category = categoryId;
    }
    
    // Calculate skip for pagination
    const skip = (page - 1) * limit;
    
    // Fetch products with pagination
    const products = await Product.find(filter)
      .populate(['category', 'brand'])
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    
    return NextResponse.json(
      { 
        success: true, 
        products,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Products fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching products' },
      { status: 500 }
    );
  }
}