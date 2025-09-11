import mongoose, { Document, Schema } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema: Schema = new Schema(
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
    permissions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Permission',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);