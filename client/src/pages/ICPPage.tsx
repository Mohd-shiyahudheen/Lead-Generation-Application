import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchActiveICP, saveICP } from '../api/client';
import { CardSkeleton } from '../components/LoadingSkeleton';
import {
  SlidersHorizontal,
  Check,
  Plus,
  X,
  Sparkles,
  Info,
  DollarSign,
  Users,
  Building2,
  Globe,
} from 'lucide-react';

const COMMON_INDUSTRIES = [
  'SaaS / Software',
  'Cloud Infrastructure',
  'Cybersecurity',
  'Fintech',
  'Healthcare IT',
  'E-commerce Platforms',
  'CleanTech SaaS',
  'EdTech',
  'LegalTech',
];

export const ICPPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['activeICP'],
    queryFn: fetchActiveICP,
  });

  const [name, setName] = useState('B2B SaaS Mid-Market Acquisition');
  const [industries, setIndustries] = useState<string[]>([]);
  const [customIndustry, setCustomIndustry] = useState('');
  const [minRevenue, setMinRevenue] = useState(1000000);
  const [maxRevenue, setMaxRevenue] = useState(10000000);
  const [minEmployees, setMinEmployees] = useState(10);
  const [maxEmployees, setMaxEmployees] = useState(100);
  const [locations, setLocations] = useState<string[]>(['United States', 'Canada']);
  const [customLocation, setCustomLocation] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const customIndustries = industries.filter(
    (ind) => !COMMON_INDUSTRIES.some((c) => c.toLowerCase() === ind.toLowerCase())
  );

  useEffect(() => {
    if (data?.icp) {
      setName(data.icp.name);
      setIndustries(data.icp.industries || []);
      setMinRevenue(data.icp.minRevenue || 1000000);
      setMaxRevenue(data.icp.maxRevenue || 10000000);
      setMinEmployees(data.icp.minEmployees || 10);
      setMaxEmployees(data.icp.maxEmployees || 100);
      setLocations(data.icp.locations || ['United States', 'Canada']);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: saveICP,
    onSuccess: () => {
      queryClient.invalidateQueries();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  const toggleIndustry = (ind: string) => {
    const isSelected = industries.some((i) => i.toLowerCase() === ind.toLowerCase());
    if (isSelected) {
      setIndustries(industries.filter((i) => i.toLowerCase() !== ind.toLowerCase()));
    } else {
      setIndustries([...industries, ind]);
    }
  };

  const removeIndustry = (ind: string) => {
    setIndustries(industries.filter((i) => i.toLowerCase() !== ind.toLowerCase()));
  };

  const addCustomIndustry = () => {
    const trimmed = customIndustry.trim();
    if (!trimmed) return;

    const items = trimmed
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    let nextIndustries = [...industries];

    items.forEach((item) => {
      const alreadyPresent = nextIndustries.some(
        (i) => i.toLowerCase() === item.toLowerCase()
      );
      if (alreadyPresent) return;

      const presetMatch = COMMON_INDUSTRIES.find(
        (c) => c.toLowerCase() === item.toLowerCase()
      );

      nextIndustries.push(presetMatch || item);
    });

    setIndustries(nextIndustries);
    setCustomIndustry('');
  };

  const addCustomLocation = () => {
    if (customLocation.trim() && !locations.includes(customLocation.trim())) {
      setLocations([...locations, customLocation.trim()]);
      setCustomLocation('');
    }
  };

  const removeLocation = (loc: string) => {
    setLocations(locations.filter((l) => l !== loc));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      name,
      industries,
      minRevenue: Number(minRevenue),
      maxRevenue: Number(maxRevenue),
      minEmployees: Number(minEmployees),
      maxEmployees: Number(maxEmployees),
      locations,
      isActive: true,
    });
  };

  const setRevenuePreset = (min: number, max: number) => {
    setMinRevenue(min);
    setMaxRevenue(max);
  };

  const setEmployeePreset = (min: number, max: number) => {
    setMinEmployees(min);
    setMaxEmployees(max);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <SlidersHorizontal className="w-6 h-6 text-brand-400" />
            <span>Target Acquisition Profile (ICP)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure your acquisition criteria. Saving updates the multi-factor scoring model and
            re-ranks every company automatically.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Name */}
        <div className="p-6 rounded-2xl glass-panel space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Profile Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700/80 text-sm text-slate-100 focus:outline-none focus:border-brand-500"
            placeholder="e.g. B2B SaaS Mid-Market Acquisition"
          />
        </div>

        {/* Target Industries */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-400" />
                <span>Target Industries (Weight: 20%)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Companies matching these industries receive +20 industry fit points
              </p>
            </div>
            <span className="text-xs font-semibold text-brand-400 font-mono">
              {industries.length} selected
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {COMMON_INDUSTRIES.map((ind) => {
              const isSelected = industries.some(
                (i) => i.toLowerCase() === ind.toLowerCase()
              );
              return (
                <button
                  key={ind}
                  type="button"
                  onClick={() => toggleIndustry(ind)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 border border-brand-400'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                  <span>{ind}</span>
                </button>
              );
            })}

            {/* Custom Added Industries */}
            {customIndustries.map((ind) => (
              <span
                key={ind}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-brand-500 text-white shadow-md shadow-brand-500/25 border border-brand-400 flex items-center gap-2 animate-in fade-in"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{ind}</span>
                <button
                  type="button"
                  onClick={() => removeIndustry(ind)}
                  className="hover:text-rose-200 ml-0.5 p-0.5 rounded hover:bg-brand-600/60 transition-colors"
                  title={`Remove ${ind}`}
                  aria-label={`Remove ${ind}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom industry input */}
          <div className="flex items-center gap-2 pt-2 max-w-md">
            <input
              type="text"
              value={customIndustry}
              onChange={(e) => setCustomIndustry(e.target.value)}
              placeholder="Add custom industry (e.g. AI / ML, Biotech)..."
              className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500 placeholder:text-slate-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomIndustry();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomIndustry}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Revenue Range */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Target Revenue Range (Weight: 25%)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Companies within bounds earn the maximum 25 revenue fit points
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Presets:</span>
              <button
                type="button"
                onClick={() => setRevenuePreset(500000, 3000000)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                $500K–$3M
              </button>
              <button
                type="button"
                onClick={() => setRevenuePreset(1000000, 10000000)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                $1M–$10M
              </button>
              <button
                type="button"
                onClick={() => setRevenuePreset(5000000, 25000000)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                $5M–$25M
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Minimum Annual Revenue ($)
              </label>
              <input
                type="number"
                min="0"
                step="500000"
                value={minRevenue}
                onChange={(e) => setMinRevenue(Number(e.target.value))}
                required
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700/80 text-sm font-mono text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Maximum Annual Revenue ($)
              </label>
              <input
                type="number"
                min="0"
                step="500000"
                value={maxRevenue}
                onChange={(e) => setMaxRevenue(Number(e.target.value))}
                required
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700/80 text-sm font-mono text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Employee Range */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>Employee Count Fit (Weight: 20%)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target organization size matching your operational capacity
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Presets:</span>
              <button
                type="button"
                onClick={() => setEmployeePreset(5, 50)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                5–50
              </button>
              <button
                type="button"
                onClick={() => setEmployeePreset(10, 100)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                10–100
              </button>
              <button
                type="button"
                onClick={() => setEmployeePreset(25, 250)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                25–250
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Minimum Headcount
              </label>
              <input
                type="number"
                min="1"
                value={minEmployees}
                onChange={(e) => setMinEmployees(Number(e.target.value))}
                required
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700/80 text-sm font-mono text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Maximum Headcount
              </label>
              <input
                type="number"
                min="1"
                value={maxEmployees}
                onChange={(e) => setMaxEmployees(Number(e.target.value))}
                required
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700/80 text-sm font-mono text-slate-100 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Target Locations */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" />
              <span>Target Geographies</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Regions and countries of focus</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {locations.map((loc) => (
              <span
                key={loc}
                className="px-3 py-1 rounded-xl bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5"
              >
                <span>{loc}</span>
                <button
                  type="button"
                  onClick={() => removeLocation(loc)}
                  className="hover:text-rose-400"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-xs">
            <input
              type="text"
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="e.g. United Kingdom"
              className="flex-1 py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomLocation();
                }
              }}
            />
            <button
              type="button"
              onClick={addCustomLocation}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Formula Explainer Note */}
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/50 flex items-start gap-3 text-xs text-indigo-300">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
          <p>
            When you save, the system immediately recalculates fit scores across all 5 dimensions
            (Revenue 25%, Industry 20%, Employees 20%, Growth 20%, Data 15%) and adjusts priority tiers
            (A, B, C, D) in real-time.
          </p>
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="submit"
            disabled={saveMutation.isPending}
            className="px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>{saveMutation.isPending ? 'Re-scoring Pipeline...' : 'Save & Re-Score All Leads'}</span>
          </button>

          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 animate-pulse">
              <Check className="w-4 h-4" />
              <span>Criteria saved and leads re-scored!</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
