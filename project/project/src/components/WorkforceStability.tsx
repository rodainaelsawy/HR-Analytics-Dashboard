import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import KPICard from './KPICard';
import type { FilterState } from '../types';

type WorkforceStabilityProps = {
  filters: FilterState;
};

type WorkforceMetrics = {
  headcount: number;
  fte: number;
  turnoverRate: number;
  newHires: number;
  headcountTrend: number[];
  fteTrend: number[];
  turnoverTrend: { month: string; count: number; rate: number }[];
};

export default function WorkforceStability({ filters }: WorkforceStabilityProps) {
  const [metrics, setMetrics] = useState<WorkforceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewBy, setViewBy] = useState<'department' | 'location' | 'role'>('department');

  useEffect(() => {
    fetchWorkforceData();
  }, [filters]);

  async function fetchWorkforceData() {
    try {
      let employeesQuery = supabase.from('employees').select('*, departments(name)');

      if (filters.department !== 'all') {
        const { data: dept } = await supabase
          .from('departments')
          .select('id')
          .eq('name', filters.department)
          .single();
        if (dept) {
          employeesQuery = employeesQuery.eq('department_id', dept.id);
        }
      }

      if (filters.employmentType !== 'all') {
        employeesQuery = employeesQuery.eq('employment_type', filters.employmentType);
      }

      const { data: employees } = await employeesQuery;
      const { data: exitRecords } = await supabase.from('exit_records').select('*');
      const { data: recruitmentRecords } = await supabase.from('recruitment_records').select('*');

      if (!employees) return;

      const activeEmployees = employees.filter(e => e.status === 'Active');
      const headcount = activeEmployees.length;

      const partTimeEmployees = activeEmployees.filter(e => e.employment_type === 'Part-time');
      const fte = activeEmployees.length - (partTimeEmployees.length * 0.5);

      const monthsAgo12 = new Date();
      monthsAgo12.setMonth(monthsAgo12.getMonth() - 12);
      const recentExits = exitRecords?.filter(e => new Date(e.exit_date) > monthsAgo12) || [];
      const turnoverRate = headcount > 0 ? (recentExits.length / headcount) * 100 : 0;

      const monthsAgo1 = new Date();
      monthsAgo1.setMonth(monthsAgo1.getMonth() - 1);
      const newHires = activeEmployees.filter(e => new Date(e.hire_date) > monthsAgo1).length;

      const headcountTrend: number[] = [];
      const fteTrend: number[] = [];
      const currentDate = new Date();

      for (let i = 8; i >= 0; i--) {
        const targetDate = new Date(currentDate);
        targetDate.setMonth(currentDate.getMonth() - i);
        targetDate.setDate(1);

        const activeAtDate = employees.filter(e => {
          const hireDate = new Date(e.hire_date);
          const termDate = e.termination_date ? new Date(e.termination_date) : null;
          return hireDate <= targetDate && (!termDate || termDate > targetDate);
        });

        headcountTrend.push(activeAtDate.length);

        const partTimeCount = activeAtDate.filter(e => e.employment_type === 'Part-time').length;
        const fteCount = activeAtDate.length - (partTimeCount * 0.5);
        fteTrend.push(fteCount);
      }

      const turnoverTrend: { month: string; count: number; rate: number }[] = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      for (let i = 7; i >= 0; i--) {
        const targetDate = new Date(currentDate);
        targetDate.setMonth(currentDate.getMonth() - i);

        const monthExits = exitRecords?.filter(e => {
          const exitDate = new Date(e.exit_date);
          return exitDate.getMonth() === targetDate.getMonth() &&
                 exitDate.getFullYear() === targetDate.getFullYear();
        }) || [];

        const activeAtMonthStart = employees.filter(e => {
          const hireDate = new Date(e.hire_date);
          const termDate = e.termination_date ? new Date(e.termination_date) : null;
          const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
          return hireDate <= monthStart && (!termDate || termDate > monthStart);
        });

        const rate = activeAtMonthStart.length > 0
          ? (monthExits.length / activeAtMonthStart.length) * 100
          : 0;

        turnoverTrend.push({
          month: monthNames[targetDate.getMonth()],
          count: monthExits.length,
          rate: rate
        });
      }

      setMetrics({
        headcount,
        fte,
        turnoverRate,
        newHires,
        headcountTrend,
        fteTrend,
        turnoverTrend
      });
    } catch (error) {
      console.error('Error fetching workforce data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading workforce stability data...</div>;
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Workforce Stability</h2>
        <p className="text-gray-600 mt-1">Executive view of workforce size and stability trends</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Headcount"
          value={metrics.headcount}
          change={3.8}
          sparklineData={metrics.headcountTrend}
          color="#3B82F6"
        />
        <KPICard
          title="Total FTE"
          value={metrics.fte.toFixed(0)}
          change={2.9}
          sparklineData={metrics.fteTrend}
          color="#10B981"
        />
        <KPICard
          title="Turnover Rate"
          value={`${metrics.turnoverRate.toFixed(1)}%`}
          change={-0.8}
          sparklineData={metrics.turnoverTrend.map(t => t.rate)}
          color="#F59E0B"
        />
        <KPICard
          title="New Hires This Period"
          value={metrics.newHires}
          change={12.5}
          sparklineData={[28, 32, 30, 35, 31, 34, 33, 36, 34]}
          color="#8B5CF6"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Headcount Trend</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {metrics.headcountTrend.map((value, index) => {
              const height = (value / Math.max(...metrics.headcountTrend)) * 100;
              const fteValue = metrics.fteTrend[index];
              const fteHeight = (fteValue / Math.max(...metrics.headcountTrend)) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col justify-end gap-1">
                  <div className="relative group">
                    <div
                      className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                      style={{ height: `${height}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        HC: {value}
                      </div>
                    </div>
                  </div>
                  <div className="relative group">
                    <div
                      className="bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer"
                      style={{ height: `${fteHeight}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        FTE: {fteValue}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-600 mt-1">
                    M{index + 1}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Headcount</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">FTE</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Turnover Trend</h3>
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewBy('department')}
                className={`px-3 py-1 text-xs rounded ${viewBy === 'department' ? 'bg-white shadow' : ''}`}
              >
                Department
              </button>
              <button
                onClick={() => setViewBy('location')}
                className={`px-3 py-1 text-xs rounded ${viewBy === 'location' ? 'bg-white shadow' : ''}`}
              >
                Location
              </button>
              <button
                onClick={() => setViewBy('role')}
                className={`px-3 py-1 text-xs rounded ${viewBy === 'role' ? 'bg-white shadow' : ''}`}
              >
                Role
              </button>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {metrics.turnoverTrend.map((item, index) => {
              const barHeight = (item.count / Math.max(...metrics.turnoverTrend.map(t => t.count))) * 80;
              const lineHeight = (item.rate / Math.max(...metrics.turnoverTrend.map(t => t.rate))) * 100;
              return (
                <div key={index} className="flex-1 relative flex flex-col justify-end">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2" style={{ bottom: `${lineHeight}%` }}>
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <div className="relative group">
                    <div
                      className="bg-blue-400 rounded-t hover:bg-blue-500 transition-colors cursor-pointer"
                      style={{ height: `${barHeight}%` }}
                    >
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.count} exits<br/>{item.rate}%
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-600 mt-1">{item.month}</div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span className="text-sm text-gray-600">Exit Count</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Turnover %</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
