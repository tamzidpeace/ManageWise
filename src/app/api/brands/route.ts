import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Brand from '@/models/Brand';
import { withRole } from '@/lib/authMiddleware';
import { BrandCreateSchema } from '@/schemas';
import { handleZodError } from '@/utils/validation';

export async function POST(request: NextRequest) {
  try {
    // Only admin can create brands
    const authResult = await withRole(request, ['admin']);
    
    // If withRole returned a response, it means authentication or authorization failed
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    
    await dbConnect();
    
    const body = await request.json();
    
    // Validate request body with Zod
    const validation = BrandCreateSchema.safeParse(body);
    if (!validation.success) {
      return handleZodError(validation.error);
    }
    
    const { name, description } = validation.data;
    
    // Check if brand already exists
    const existingBrand = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingBrand) {
      return NextResponse.json(
        { success: false, message: 'Brand with this name already exists' },
        { status: 409 }
      );
    }
    
    // Create brand
    const brand = await Brand.create({
      name,
      description,
    });
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Brand created successfully',
        brand: {
          id: brand._id,
          name: brand.name,
          description: brand.description,
          isActive: brand.isActive,
          createdAt: brand.createdAt,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Brand creation error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while creating the brand' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
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
    
    // Fetch brands with pagination
    const brands = await Brand.find(query)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);
      
    // Get total count for pagination
    const total = await Brand.countDocuments(query);
    
    const pagination = {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    };
    
    return NextResponse.json(
      { 
        success: true, 
        brands: brands.map(brand => ({
          id: brand._id,
          name: brand.name,
          description: brand.description,
          isActive: brand.isActive,
          createdAt: brand.createdAt,
        })),
        pagination
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Brands fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching brands' },
      { status: 500 }
    );
  }
}