import { Router, Request, Response, NextFunction } from 'express';
import { ICP } from '../models/ICP';
import { Lead } from '../models/Lead';
import { validate, icpSchema } from '../middleware/validation';
import { scoreLead } from '../services/scoring';
import { defaultICP } from '../seed/data';

const router = Router();

// GET /api/icp - Get active ICP
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let activeICP = await ICP.findOne({ isActive: true }).sort({ updatedAt: -1 });

    // If no active ICP exists, create the default one
    if (!activeICP) {
      activeICP = await ICP.create(defaultICP);
    }

    res.json({ icp: activeICP });
  } catch (error) {
    next(error);
  }
});

// POST /api/icp - Create or update active ICP
router.post(
  '/',
  validate(icpSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;

      // Deactivate all existing ICPs
      await ICP.updateMany({}, { isActive: false });

      // Create new active ICP
      const newICP = await ICP.create({
        ...data,
        isActive: true,
      });

      // Automatically re-score all leads against the new ICP
      const leads = await Lead.find({});
      let scoredCount = 0;

      for (const lead of leads) {
        const leadInput = {
          revenue: lead.revenue,
          employees: lead.employees,
          industry: lead.industry,
          foundedYear: lead.foundedYear,
          revenueGrowthPercent: lead.revenueGrowthPercent,
          employeeGrowthPercent: lead.employeeGrowthPercent,
          companyName: lead.companyName,
          website: lead.website,
          location: lead.location,
          contactName: lead.contact?.name || '',
          contactEmail: lead.contact?.email || '',
          contactTitle: lead.contact?.title || '',
          contactLinkedin: lead.contact?.linkedin,
        };

        const icpCriteria = {
          industries: newICP.industries,
          minRevenue: newICP.minRevenue,
          maxRevenue: newICP.maxRevenue,
          minEmployees: newICP.minEmployees,
          maxEmployees: newICP.maxEmployees,
          locations: newICP.locations,
        };

        const result = scoreLead(leadInput, icpCriteria);

        lead.score = result.score;
        lead.priority = result.priority;
        lead.signals = {
          revenueFit: result.factors.revenueFit,
          industryFit: result.factors.industryFit,
          employeeFit: result.factors.employeeFit,
          growthSignal: result.factors.growthSignal,
          dataCompleteness: result.factors.dataCompleteness,
        };
        lead.scoreReasons = result.reasons;

        await lead.save();
        scoredCount++;
      }

      res.status(201).json({
        icp: newICP,
        scoredCount,
        message: `ICP saved successfully and ${scoredCount} leads re-scored.`,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
