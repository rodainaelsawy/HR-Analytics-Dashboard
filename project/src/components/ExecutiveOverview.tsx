import { useEffect, useState } from 'react';
// import { ArrowRight } from 'lucide-react';
import KPICard from './KPICard';
import NavigationTiles from './NavigationTiles';
import TalentHealthSnapshot from './TalentHealthSnapshot';
import { supabase } from '../lib/supabase';
import type { FilterState } from '../types';
import SparklineChart from './SparklineChart';

type ExecutiveOverviewProps = {
  filters: FilterState;
  onNavigate: (view: string) => void;
};

type KPIData = {
  headcount: number;
  headcountChange: number;
  fte: number;
  fteChange: number;
  turnoverRate: number;
  turnoverChange: number;
  payrollRevenuePercent: number;
  payrollChange: number;
  headcountTrend: number[];
  turnoverTrend: number[];
};

export default function ExecutiveOverview({ filters, onNavigate }: ExecutiveOverviewProps) {
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIData();
  }, [filters]);

  async function fetchKPIData() {
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select('*');

      const { data: exitRecords } = await supabase
        .from('exit_records')
        .select('*');

      if (!employees) return;

      const activeEmployees = employees.filter(e => e.status === 'Active');
      const headcount = activeEmployees.length;

      const fullTimeEquivalent = activeEmployees.reduce((sum, e) => {
        if (e.employment_type === 'Full-time') return sum + 1;
        if (e.employment_type === 'Part-time') return sum + 0.5;
        if (e.employment_type === 'Contract') return sum + 0.8;
        return sum;
      }, 0);

      const exits = exitRecords || [];
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const recentExits = exits.filter(e => new Date(e.exit_date) >= oneYearAgo);
      const turnoverRate = (recentExits.length / headcount) * 100;

      const totalPayroll = activeEmployees.reduce((sum, e) => sum + Number(e.salary), 0);
      const estimatedRevenue = totalPayroll * 3.5;
      const payrollRevenuePercent = (totalPayroll / estimatedRevenue) * 100;

      const headcountTrend = Array.from({ length: 9 }, (_, i) => {
        const variation = Math.sin(i * 0.5) * 10;
        return Math.max(0, headcount - 50 + i * 5 + variation);
      });

      const turnoverTrend = Array.from({ length: 9 }, (_, i) => {
        const variation = Math.sin(i * 0.7) * 2;
        return Math.max(0, turnoverRate - 3 + variation);
      });

      setKpiData({
        headcount,
        headcountChange: 5.2,
        fte: fullTimeEquivalent,
        fteChange: 4.8,
        turnoverRate,
        turnoverChange: -2.3,
        payrollRevenuePercent,
        payrollChange: 1.2,
        headcountTrend,
        turnoverTrend
      });
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading executive overview...</div>
      </div>
    );
  }

  if (!kpiData) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Headcount"
          value={kpiData.headcount.toLocaleString()}
          change={kpiData.headcountChange}
          sparklineData={kpiData.headcountTrend}
        />
        <KPICard
          title="FTE"
          value={kpiData.fte.toFixed(1)}
          change={kpiData.fteChange}
          // sparklineData={kpiData.headcountTrend}
        />
        <KPICard
          title="Turnover Rate"
          value={`${kpiData.turnoverRate.toFixed(1)}%`}
          change={kpiData.turnoverChange}
          sparklineData={kpiData.turnoverTrend}
          // inverse
        />
        <KPICard
          title="Payroll / Revenue"
          value={`${kpiData.payrollRevenuePercent.toFixed(1)}%`}
          change={kpiData.payrollChange}
          // sparklineData={kpiData.turnoverTrend}
        />
      </div>

      <section>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Workforce Stability Trends</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-lg font-medium">
                Department
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                Location
              </button>
              <button className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                Role
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Headcount vs FTE Over Time</h3>
              <div className="h-48 flex items-end gap-2">
                {/* {kpiData.headcountTrend.map((value, i) => (
                  <div key={i} className="flex-1 flex flex-col gap-1">
                    <div
                      className="bg-blue-500 rounded-t"
                      style={{ height: `${(value / Math.max(...kpiData.headcountTrend)) * 100}%` }}
                    />
                    <div
                      className="bg-blue-300 rounded-t"
                      style={{ height: `${((value * 0.9) / Math.max(...kpiData.headcountTrend)) * 100}%` }}
                    />
                  </div>
                ))} */}
                <SparklineChart data={kpiData.headcountTrend} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>9 months ago</span>
                <span>Today</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Turnover Count & Rate</h3>
              <div className="h-48 flex items-end gap-2">
                {/* {kpiData.turnoverTrend.map((value, i) => (
                  <div key={i} className="flex-1">
                    <div
                      className="bg-red-400 rounded-t"
                      style={{ height: `${(value / Math.max(...kpiData.turnoverTrend)) * 100}%` }}
                    />
                  </div>
                ))} */}
                <SparklineChart data={kpiData.turnoverTrend} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>9 months ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <TalentHealthSnapshot onNavigate={onNavigate} />

      <section>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Financial Alignment</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Payroll vs Revenue</h3>
              <div className="h-48 flex items-end gap-2">
                {Array.from({ length: 12 }, (_, i) => {
                  const payroll = 50 + Math.sin(i * 0.5) * 10;
                  const revenue = payroll * 3.5;
                  return (
                    <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                      <div className="w-full flex flex-col gap-1">
                        <div
                          className="bg-green-500 rounded-t w-full"
                          style={{ height: `${(revenue / 200) * 100}%`, minHeight: '4px' }}
                        />
                        <div
                          className="bg-blue-500 rounded-t w-full"
                          style={{ height: `${(payroll / 200) * 100}%`, minHeight: '4px' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Payroll</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-600">Revenue</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-4">Labor Cost Composition</h3>
              <div className="h-48 flex flex-col">
                <div className="flex-1 flex items-end gap-2">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="flex-1 flex flex-col">
                      <div className="bg-blue-600 flex-1" style={{ height: '60%' }} />
                      <div className="bg-blue-400 flex-1" style={{ height: '20%' }} />
                      <div className="bg-blue-300 flex-1" style={{ height: '15%' }} />
                      <div className="bg-blue-200 flex-1" style={{ height: '5%' }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">Salary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-400 rounded"></div>
                  <span className="text-gray-600">Overtime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-300 rounded"></div>
                  <span className="text-gray-600">Benefits</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                  <span className="text-gray-600">Training</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NavigationTiles onNavigate={onNavigate} />
    </div>
  );
}
