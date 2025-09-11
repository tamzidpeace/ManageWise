import mongoose, { Document, Schema } from 'mongoose';

export interface IPermission extends Document {
  name: string;
  description: string;
  feature: string;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    feature: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Permission || mongoose.model<IPermission>('Permission', PermissionSchema);