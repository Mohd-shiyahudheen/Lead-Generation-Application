import { Router, Request, Response, NextFunction } from 'express';
import { Lead, ILead } from '../models/Lead';
import { ICP, IICP } from '../models/ICP';
import { leadQuerySchema } from '../middleware/validation';
import { scoreLead } from '../services/scoring';
import { detectSignals } from '../services/signals';
import { generateExplanation } from '../services/ai';
import { sampleLeads, defaultICP } from '../seed/data';

const router = Router();

// Helper to score a single lead document against an ICP
function applyScoreToLead(lead: ILead, icp: IICP) {
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
    industries: icp.industries,
    minRevenue: icp.minRevenue,
    maxRevenue: icp.maxRevenue,
    minEmployees: icp.minEmployees,
    maxEmployees: icp.maxEmployees,
    locations: icp.locations,
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
}

// GET /api/leads - List leads with pagination, search, filter, and sorting
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const query = leadQuerySchema.parse(req.query);
    const { page, limit, search, priority, industry, sortBy, sortOrder } = query;

    // Filter criteria
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (priority) {
      filter.priority = priority;
    }

    if (industry) {
      filter.industry = new RegExp(industry, 'i');
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { companyName: searchRegex },
        { industry: searchRegex },
        { location: searchRegex },
        { description: searchRegex },
        { 'contact.name': searchRegex },
      ];
    }

    // Sorting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort(sort).skip(skip).limit(limit),
      Lead.countDocuments(filter),
    ]);

    res.json({
      data: leads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/leads/analyze - Re-score all leads against active ICP
router.post('/analyze', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let activeICP = await ICP.findOne({ isActive: true });
    if (!activeICP) {
      activeICP = await ICP.create(defaultICP);
    }

    const leads = await Lead.find({});
    let scoredCount = 0;

    for (const lead of leads) {
      applyScoreToLead(lead, activeICP);
      await lead.save();
      scoredCount++;
    }

    res.json({
      scored: scoredCount,
      message: `Successfully analyzed and re-scored ${scoredCount} leads.`,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/leads/reset - Reset dataset to the 28 sample companies
router.post('/reset', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let activeICP = await ICP.findOne({ isActive: true });
    if (!activeICP) {
      activeICP = await ICP.create(defaultICP);
    }

    // Delete existing leads
    await Lead.deleteMany({});

    // Create and score new leads
    const createdLeads = [];
    for (const item of sampleLeads) {
      const lead = new Lead(item);
      applyScoreToLead(lead, activeICP);
      await lead.save();
      createdLeads.push(lead);
    }

    res.json({
      message: `Reset dataset to ${createdLeads.length} sample companies.`,
      count: createdLeads.length,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/leads/:id - Single lead detail with deal signals
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Lead not found' },
      });
      return;
    }

    let activeICP = await ICP.findOne({ isActive: true });
    if (!activeICP) {
      activeICP = await ICP.create(defaultICP);
    }

    const dealSignals = detectSignals(lead, activeICP);

    res.json({
      lead,
      dealSignals,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/leads/:id/explain - Generate AI or deterministic explanation
router.post('/:id/explain', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      res.status(404).json({
        error: { code: 'NOT_FOUND', message: 'Lead not found' },
      });
      return;
    }

    let activeICP = await ICP.findOne({ isActive: true });
    if (!activeICP) {
      activeICP = await ICP.create(defaultICP);
    }

    const dealSignals = detectSignals(lead, activeICP);
    const explanationResult = await generateExplanation(lead, activeICP, dealSignals);

    res.json({
      explanation: explanationResult.explanation,
      source: explanationResult.source,
      dealSignals,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
