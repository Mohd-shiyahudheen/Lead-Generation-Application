import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database';
import leadsRouter from './routes/leads';
import icpRouter from './routes/icp';
import dashboardRouter from './routes/dashboard';
import { errorHandler } from './middleware/errorHandler';
import { Lead } from './models/Lead';
import { ICP } from './models/ICP';
import { sampleLeads, defaultICP } from './seed/data';
import { scoreLead } from './services/scoring';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

// Routes
app.use('/api/leads', leadsRouter);
app.use('/api/icp', icpRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'SaaSquatch Signal API',
  });
});

// Error handling
app.use(errorHandler);

// Auto-seed function to ensure the app works immediately on first run
async function autoSeedIfEmpty() {
  try {
    let activeICP = await ICP.findOne({ isActive: true });
    if (!activeICP) {
      console.log('🌱 Seeding default ICP profile...');
      activeICP = await ICP.create(defaultICP);
    }

    const leadCount = await Lead.countDocuments({});
    if (leadCount === 0) {
      console.log(`🌱 Seeding ${sampleLeads.length} sample leads...`);
      for (const item of sampleLeads) {
        const lead = new Lead(item);

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
          industries: activeICP.industries,
          minRevenue: activeICP.minRevenue,
          maxRevenue: activeICP.maxRevenue,
          minEmployees: activeICP.minEmployees,
          maxEmployees: activeICP.maxEmployees,
          locations: activeICP.locations,
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
      }
      console.log(`✅ Successfully seeded ${sampleLeads.length} scored leads!`);
    }
  } catch (error) {
    console.error('Warning: Auto-seed encountered an issue:', error);
  }
}

// Server startup
async function startServer() {
  await connectDatabase();
  await autoSeedIfEmpty();

  app.listen(PORT, () => {
    console.log(`🚀 SaaSquatch Signal server running on http://localhost:${PORT}`);
  });
}

// Only start when run directly
if (process.env.NODE_ENV !== 'test') {
  startServer().catch((err) => {
    console.error('Failed to start server:', err);
  });
}

export default app;
