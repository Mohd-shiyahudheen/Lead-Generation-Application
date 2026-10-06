import { Router, Request, Response, NextFunction } from 'express';
import { Lead } from '../models/Lead';
import { ICP } from '../models/ICP';
import { defaultICP } from '../seed/data';

const router = Router();

// GET /api/dashboard - Dashboard summary metrics
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let activeICP = await ICP.findOne({ isActive: true });
    if (!activeICP) {
      activeICP = await ICP.create(defaultICP);
    }

    const [total, aCount, bCount, cCount, dCount, topLeads, allLeads] = await Promise.all([
      Lead.countDocuments({}),
      Lead.countDocuments({ priority: 'A' }),
      Lead.countDocuments({ priority: 'B' }),
      Lead.countDocuments({ priority: 'C' }),
      Lead.countDocuments({ priority: 'D' }),
      Lead.find({}).sort({ score: -1 }).limit(5),
      Lead.find({}, 'score industry'),
    ]);

    const avgScore =
      allLeads.length > 0
        ? Math.round(allLeads.reduce((acc, curr) => acc + (curr.score || 0), 0) / allLeads.length)
        : 0;

    // Industry distribution
    const industryCounts: Record<string, number> = {};
    allLeads.forEach((l) => {
      if (l.industry) {
        industryCounts[l.industry] = (industryCounts[l.industry] || 0) + 1;
      }
    });

    res.json({
      total,
      aCount,
      bCount,
      cCount,
      dCount,
      avgScore,
      topLeads,
      activeICP,
      industryDistribution: industryCounts,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
