import mongoose, { Schema, Document } from 'mongoose';

export interface IICP extends Document {
  name: string;
  industries: string[];
  minRevenue: number;
  maxRevenue: number;
  minEmployees: number;
  maxEmployees: number;
  locations: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ICPSchema = new Schema<IICP>(
  {
    name: { type: String, required: true },
    industries: [{ type: String }],
    minRevenue: { type: Number, required: true },
    maxRevenue: { type: Number, required: true },
    minEmployees: { type: Number, required: true },
    maxEmployees: { type: Number, required: true },
    locations: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const ICP = mongoose.model<IICP>('ICP', ICPSchema);
