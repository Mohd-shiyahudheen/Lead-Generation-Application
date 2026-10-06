import { describe, it, expect } from 'vitest';
import {
  calculateRevenueFit,
  calculateIndustryFit,
  calculateEmployeeFit,
  calculateGrowthSignal,
  calculateDataCompleteness,
  computeScore,
  classifyPriority,
  scoreLead,
  ScoringInput,
  ICPCriteria,
} from '../src/services/scoring';
import { detectSignals } from '../src/services/signals';
import { generateDeterministicExplanation } from '../src/services/ai';
import { ILead } from '../src/models/Lead';
import { IICP } from '../src/models/ICP';

describe('Scoring Engine Unit Tests', () => {
  const sampleICP: ICPCriteria = {
    industries: ['SaaS / Software', 'Cloud Infrastructure', 'Cybersecurity'],
    minRevenue: 1000000,
    maxRevenue: 10000000,
    minEmployees: 10,
    maxEmployees: 100,
    locations: ['United States', 'Canada'],
  };

  describe('calculateRevenueFit', () => {
    it('returns 1.0 when revenue is strictly within range', () => {
      expect(calculateRevenueFit(5000000, 1000000, 10000000)).toBe(1.0);
      expect(calculateRevenueFit(1000000, 1000000, 10000000)).toBe(1.0);
      expect(calculateRevenueFit(10000000, 1000000, 10000000)).toBe(1.0);
    });

    it('returns 0.3 fallback when revenue is null or undefined', () => {
      expect(calculateRevenueFit(null, 1000000, 10000000)).toBe(0.3);
      expect(calculateRevenueFit(undefined as unknown as null, 1000000, 10000000)).toBe(0.3);
    });

    it('decays when revenue is outside range', () => {
      const below = calculateRevenueFit(500000, 1000000, 10000000);
      expect(below).toBeLessThan(1.0);
      expect(below).toBeGreaterThanOrEqual(0);

      const above = calculateRevenueFit(12000000, 1000000, 10000000);
      expect(above).toBeLessThan(1.0);
      expect(above).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateIndustryFit', () => {
    it('returns 1.0 for exact industry match', () => {
      expect(calculateIndustryFit('SaaS / Software', sampleICP.industries)).toBe(1.0);
      expect(calculateIndustryFit('Cybersecurity', sampleICP.industries)).toBe(1.0);
    });

    it('returns 0.5 for partial or related match', () => {
      expect(calculateIndustryFit('Software', sampleICP.industries)).toBe(0.5);
      expect(calculateIndustryFit('Cloud Solutions', sampleICP.industries)).toBe(0.5);
    });

    it('returns 0.0 for unrelated industries', () => {
      expect(calculateIndustryFit('Manufacturing', sampleICP.industries)).toBe(0.0);
      expect(calculateIndustryFit('Food & Beverage', sampleICP.industries)).toBe(0.0);
    });
  });

  describe('calculateEmployeeFit', () => {
    it('returns 1.0 when employee count is within range', () => {
      expect(calculateEmployeeFit(45, 10, 100)).toBe(1.0);
      expect(calculateEmployeeFit(10, 10, 100)).toBe(1.0);
      expect(calculateEmployeeFit(100, 10, 100)).toBe(1.0);
    });

    it('returns 0.3 when employee data is missing', () => {
      expect(calculateEmployeeFit(null, 10, 100)).toBe(0.3);
    });

    it('decays when employee count is outside range', () => {
      const small = calculateEmployeeFit(5, 10, 100);
      expect(small).toBeLessThan(1.0);
      const large = calculateEmployeeFit(150, 10, 100);
      expect(large).toBeLessThan(1.0);
    });
  });

  describe('calculateGrowthSignal', () => {
    it('returns strong signal for high growth rates', () => {
      const signal = calculateGrowthSignal(40, 30, 2018, 5000000, 40);
      expect(signal).toBeGreaterThan(0.5);
    });

    it('uses company age heuristic when explicit growth data is missing', () => {
      const youngCompanySignal = calculateGrowthSignal(null, null, 2024, 2000000, 15);
      const oldCompanySignal = calculateGrowthSignal(null, null, 1995, 2000000, 15);
      expect(youngCompanySignal).toBeGreaterThan(oldCompanySignal);
    });
  });

  describe('calculateDataCompleteness', () => {
    it('returns 1.0 when all key data fields are provided', () => {
      const fullLead: ScoringInput = {
        companyName: 'Test Corp',
        website: 'https://testcorp.com',
        industry: 'SaaS / Software',
        location: 'Austin, TX',
        revenue: 4000000,
        employees: 30,
        foundedYear: 2019,
        revenueGrowthPercent: 25,
        employeeGrowthPercent: 20,
        contactName: 'Jane Doe',
        contactEmail: 'jane@testcorp.com',
        contactTitle: 'CEO',
        contactLinkedin: 'https://linkedin.com/in/janedoe',
      };
      expect(calculateDataCompleteness(fullLead)).toBe(1.0);
    });

    it('returns lower value when essential fields are missing', () => {
      const sparseLead: ScoringInput = {
        companyName: 'Sparse Co',
        website: '',
        industry: 'SaaS / Software',
        location: '',
        revenue: null,
        employees: null,
        foundedYear: null,
        revenueGrowthPercent: null,
        employeeGrowthPercent: null,
        contactName: '',
        contactEmail: '',
        contactTitle: '',
      };
      expect(calculateDataCompleteness(sparseLead)).toBeLessThan(0.4);
    });
  });

  describe('computeScore & classifyPriority', () => {
    it('computes 100 when all factors are perfect', () => {
      const score = computeScore({
        revenueFit: 1.0,
        industryFit: 1.0,
        employeeFit: 1.0,
        growthSignal: 1.0,
        dataCompleteness: 1.0,
      });
      expect(score).toBe(100);
      expect(classifyPriority(score)).toBe('A');
    });

    it('correctly maps priority thresholds', () => {
      expect(classifyPriority(95)).toBe('A');
      expect(classifyPriority(90)).toBe('A');
      expect(classifyPriority(89)).toBe('B');
      expect(classifyPriority(75)).toBe('B');
      expect(classifyPriority(74)).toBe('C');
      expect(classifyPriority(60)).toBe('C');
      expect(classifyPriority(59)).toBe('D');
      expect(classifyPriority(20)).toBe('D');
    });
  });

  describe('scoreLead (End-to-End)', () => {
    it('scores an ideal target as Priority A with explainable reasons', () => {
      const idealLead: ScoringInput = {
        companyName: 'Apex Cloud Solutions',
        website: 'https://apexcloud.example.com',
        industry: 'SaaS / Software',
        location: 'Austin, TX',
        revenue: 4500000,
        employees: 38,
        foundedYear: 2018,
        revenueGrowthPercent: 35,
        employeeGrowthPercent: 25,
        contactName: 'Marcus Vance',
        contactEmail: 'marcus@apexcloud.example.com',
        contactTitle: 'Founder & CEO',
      };

      const result = scoreLead(idealLead, sampleICP);
      expect(result.score).toBeGreaterThanOrEqual(90);
      expect(result.priority).toBe('A');
      expect(result.reasons.length).toBeGreaterThan(0);
      expect(result.factors.revenueFit).toBe(1.0);
      expect(result.factors.industryFit).toBe(1.0);
    });

    it('is strictly deterministic — same inputs always yield identical score', () => {
      const testLead: ScoringInput = {
        companyName: 'OmniDesk CRM',
        website: 'https://omnidesk.example.com',
        industry: 'SaaS / Software',
        location: 'Chicago, IL',
        revenue: 2900000,
        employees: 24,
        foundedYear: 2020,
        revenueGrowthPercent: 40,
        employeeGrowthPercent: 30,
        contactName: 'Tyler Brooks',
        contactEmail: 'tyler@omnidesk.example.com',
        contactTitle: 'CEO',
      };

      const res1 = scoreLead(testLead, sampleICP);
      const res2 = scoreLead(testLead, sampleICP);

      expect(res1.score).toBe(res2.score);
      expect(res1.priority).toBe(res2.priority);
      expect(res1.reasons).toEqual(res2.reasons);
    });
  });

  describe('Deal Signals & Deterministic Explanation', () => {
    it('detects acquisition fit and generates meaningful explanation', () => {
      const mockLead = {
        companyName: 'Apex Cloud',
        industry: 'SaaS / Software',
        revenue: 4500000,
        employees: 38,
        priority: 'A',
        revenueGrowthPercent: 30,
        employeeGrowthPercent: 20,
        contact: {
          name: 'Marcus Vance',
          title: 'CEO',
          email: 'marcus@apex.com',
        },
        signals: { dataCompleteness: 0.9 },
      } as unknown as ILead;

      const mockICP = {
        minRevenue: 1000000,
        maxRevenue: 10000000,
        minEmployees: 10,
        maxEmployees: 100,
        industries: ['SaaS / Software'],
      } as unknown as IICP;

      const signals = detectSignals(mockLead, mockICP);
      expect(signals.some((s) => s.key === 'revenue_fit' && s.met)).toBe(true);
      expect(signals.some((s) => s.key === 'industry_match' && s.met)).toBe(true);

      const explanation = generateDeterministicExplanation(mockLead, mockICP, signals);
      expect(explanation).toContain('Apex Cloud');
      expect(explanation).toContain('Recommended action');
    });
  });
});
