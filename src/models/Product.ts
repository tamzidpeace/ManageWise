import mongoose, { Document, Schema } from 'mongoose';
import { ICategory } from './Category';
import { IBrand } from './Brand';

export interface IProduct extends Document {
  name: string;
  category: mongoose.Types.ObjectId | ICategory;
  brand?: mongoose.Types.ObjectId | IBrand;
  price: number;
  stock: number;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes
ProductSchema.index({ name: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ brand: 1 });
ProductSchema.index({ stock: 1 });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);