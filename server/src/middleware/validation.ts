import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
        });
        return;
      }
      next(error);
    }
  };
};

export const icpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  industries: z.array(z.string()).min(1, 'At least one industry is required'),
  minRevenue: z.number().min(0, 'minRevenue must be non-negative'),
  maxRevenue: z.number().min(0, 'maxRevenue must be non-negative'),
  minEmployees: z.number().min(0, 'minEmployees must be non-negative'),
  maxEmployees: z.number().min(0, 'maxEmployees must be non-negative'),
  locations: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
}).refine((data) => data.maxRevenue >= data.minRevenue, {
  message: 'maxRevenue must be greater than or equal to minRevenue',
  path: ['maxRevenue'],
}).refine((data) => data.maxEmployees >= data.minEmployees, {
  message: 'maxEmployees must be greater than or equal to minEmployees',
  path: ['maxEmployees'],
});

export const leadQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  priority: z.enum(['A', 'B', 'C', 'D']).optional(),
  industry: z.string().optional(),
  sortBy: z.enum(['score', 'revenue', 'employees', 'companyName', 'createdAt']).default('score'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
