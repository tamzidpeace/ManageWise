import mongoose, { Document, Schema } from 'mongoose';

export interface IBrand extends Document {
  name: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    logo: {
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
BrandSchema.index({ name: 1 });

export default mongoose.models.Brand || mongoose.model<IBrand>('Brand', BrandSchema);