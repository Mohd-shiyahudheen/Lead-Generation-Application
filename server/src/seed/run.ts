import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { Lead } from '../models/Lead';
import { ICP } from '../models/ICP';
import { sampleLeads, defaultICP } from './data';
import { scoreLead } from '../services/scoring';

async function runSeed() {
  console.log('🔄 Connecting to database for seeding...');
  await connectDatabase();

  console.log('🧹 Clearing existing data...');
  await Lead.deleteMany({});
  await ICP.deleteMany({});

  console.log('📌 Creating default ICP...');
  const activeICP = await ICP.create(defaultICP);
  console.log(`✅ Default ICP created: "${activeICP.name}"`);

  console.log(`📊 Processing and scoring ${sampleLeads.length} leads...`);
  const counts = { A: 0, B: 0, C: 0, D: 0 };

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
    counts[result.priority]++;
  }

  console.log('\n========================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('========================================');
  console.log(`Total Leads: ${sampleLeads.length}`);
  console.log(`Priority A (High Priority):   ${counts.A}`);
  console.log(`Priority B (Good Candidate):  ${counts.B}`);
  console.log(`Priority C (Needs Review):    ${counts.C}`);
  console.log(`Priority D (Low Priority):    ${counts.D}`);
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
