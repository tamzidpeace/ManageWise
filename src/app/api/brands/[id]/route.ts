import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Brand from '@/models/Brand';
import { withPermission } from '@/lib/authMiddleware';
import { BrandUpdateSchema } from '@/schemas';
import { handleZodError } from '@/utils/validation';
import { Permissions } from '@/schemas/permissions';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      // Only users with BRANDS_VIEW permission can view brands
      const authResult = await withPermission(request, Permissions.BRANDS_VIEW);
      
      // If withPermission returned a response, it means authentication or authorization failed
      if (authResult instanceof NextResponse) {
        return authResult;
      }
      
      await dbConnect();
      const { id } = await params;
  
      if (!id) {
        return NextResponse.json(
          { success: false, message: 'Brand ID is required' },
          { status: 400 }
        );
      }
  
      const brand = await Brand.findById(id);
  
      if (!brand) {
        return NextResponse.json(
          { success: false, message: 'Brand not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json({ success: true, brand }, { status: 200 });
    } catch (error) {
      console.error('Brand fetch error:', error);
      return NextResponse.json(
        { success: false, message: 'An error occurred while fetching the brand' },
        { status: 500 }
      );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Only users with BRANDS_UPDATE permission can update brands
    const authResult = await withPermission(request, Permissions.BRANDS_UPDATE);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
  
    try {
      await dbConnect();
      const { id } = await params;
  
      if (!id) {
        return NextResponse.json(
          { success: false, message: 'Brand ID is required' },
          { status: 400 }
        );
      }
  
      const body = await request.json();
      const validation = BrandUpdateSchema.safeParse(body);
  
      if (!validation.success) {
        return handleZodError(validation.error);
      }
  
      const { name, description, isActive } = validation.data;
  
      if (name) {
        const existingBrand = await Brand.findOne({ 
          name: { $regex: new RegExp(`^${name}$`, 'i') }, 
          _id: { $ne: id } 
        });
        if (existingBrand) {
          return NextResponse.json(
            { success: false, message: 'Brand with this name already exists' },
            { status: 409 }
          );
        }
      }
  
      const updatedBrand = await Brand.findByIdAndUpdate(
        id,
        { name, description, isActive },
        { new: true, runValidators: true }
      );
  
      if (!updatedBrand) {
        return NextResponse.json(
          { success: false, message: 'Brand not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { 
          success: true, 
          message: 'Brand updated successfully', 
          brand: updatedBrand 
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Brand update error:', error);
      return NextResponse.json(
        { success: false, message: 'An error occurred while updating the brand' },
        { status: 500 }
      );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    // Only users with BRANDS_DELETE permission can delete brands
    const authResult = await withPermission(request, Permissions.BRANDS_DELETE);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
  
    try {
      await dbConnect();
      const { id } = await params;
  
      if (!id) {
        return NextResponse.json(
          { success: false, message: 'Brand ID is required' },
          { status: 400 }
        );
      }
  
      const deletedBrand = await Brand.findByIdAndDelete(id);
  
      if (!deletedBrand) {
        return NextResponse.json(
          { success: false, message: 'Brand not found' },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { success: true, message: 'Brand deleted successfully' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Brand deletion error:', error);
      return NextResponse.json(
        { success: false, message: 'An error occurred while deleting the brand' },
        { status: 500 }
      );
    }
}
