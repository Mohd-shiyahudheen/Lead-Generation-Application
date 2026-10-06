import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  companyName: string;
  website: string;
  industry: string;
  location: string;
  revenue: number | null;
  employees: number | null;
  foundedYear: number | null;
  description: string;
  revenueGrowthPercent: number | null;
  employeeGrowthPercent: number | null;
  contact: {
    name: string;
    title: string;
    email: string;
    linkedin?: string;
  };
  signals: {
    revenueFit: number;
    industryFit: number;
    employeeFit: number;
    growthSignal: number;
    dataCompleteness: number;
  };
  score: number;
  priority: 'A' | 'B' | 'C' | 'D';
  scoreReasons: string[];
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    companyName: { type: String, required: true, index: true },
    website: { type: String, default: '' },
    industry: { type: String, required: true, index: true },
    location: { type: String, default: '' },
    revenue: { type: Number, default: null },
    employees: { type: Number, default: null },
    foundedYear: { type: Number, default: null },
    description: { type: String, default: '' },
    revenueGrowthPercent: { type: Number, default: null },
    employeeGrowthPercent: { type: Number, default: null },
    contact: {
      name: { type: String, default: '' },
      title: { type: String, default: '' },
      email: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
    signals: {
      revenueFit: { type: Number, default: 0 },
      industryFit: { type: Number, default: 0 },
      employeeFit: { type: Number, default: 0 },
      growthSignal: { type: Number, default: 0 },
      dataCompleteness: { type: Number, default: 0 },
    },
    score: { type: Number, default: 0, index: true },
    priority: { type: String, enum: ['A', 'B', 'C', 'D'], default: 'D', index: true },
    scoreReasons: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

// Text index for search
LeadSchema.index({ companyName: 'text', industry: 'text', location: 'text' });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);
