'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { FilterState } from '../types';

type ExitAnalyticsProps = {
  filters: FilterState;
};

type ExitReasonData = {
  reason: string;
  count: number;
  departments: { name: string; count: number }[];
};

export default function ExitAnalytics({ filters }: ExitAnalyticsProps) {
  const [exitReasons, setExitReasons] = useState<ExitReasonData[]>([]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExitData();
  }, [filters]);

  async function fetchExitData() {
    try {
      const reasons: ExitReasonData[] = [
        {
          reason: 'Better Salary',
          count: 42,
          departments: [
            { name: 'Engineering', count: 15 },
            { name: 'Sales', count: 12 },
            { name: 'Marketing', count: 8 },
            { name: 'Operations', count: 7 }
          ]
        },
        {
          reason: 'Career Growth',
          count: 35,
          departments: [
            { name: 'Engineering', count: 12 },
            { name: 'Sales', count: 10 },
            { name: 'Marketing', count: 7 },
            { name: 'Operations', count: 6 }
          ]
        },
        {
          reason: 'Management Issues',
          count: 28,
          departments: [
            { name: 'Sales', count: 11 },
            { name: 'Operations', count: 9 },
            { name: 'Engineering', count: 5 },
            { name: 'Marketing', count: 3 }
          ]
        },
        {
          reason: 'Work-Life Balance',
          count: 22,
          departments: [
            { name: 'Engineering', count: 10 },
            { name: 'Operations', count: 7 },
            { name: 'Sales', count: 3 },
            { name: 'Marketing', count: 2 }
          ]
        },
        {
          reason: 'Relocation',
          count: 18,
          departments: [
            { name: 'Engineering', count: 6 },
            { name: 'Sales', count: 5 },
            { name: 'Marketing', count: 4 },
            { name: 'Operations', count: 3 }
          ]
        },
        {
          reason: 'Company Culture',
          count: 15,
          departments: [
            { name: 'Marketing', count: 5 },
            { name: 'Sales', count: 4 },
            { name: 'Engineering', count: 4 },
            { name: 'Operations', count: 2 }
          ]
        }
      ];

      setExitReasons(reasons);
    } catch (error) {
      console.error('Error fetching exit data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading exit analytics data...</div>;
  }

  const totalExits = exitReasons.reduce((sum, r) => sum + r.count, 0);
  const maxCount = Math.max(...exitReasons.map(r => r.count));

  const selectedReasonData = exitReasons.find(r => r.reason === selectedReason);

  const reasonColors: { [key: string]: string } = {
    'Better Salary': '#EF4444',
    'Career Growth': '#F59E0B',
    'Management Issues': '#DC2626',
    'Work-Life Balance': '#3B82F6',
    'Relocation': '#6366F1',
    'Company Culture': '#8B5CF6'
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Exit Analytics</h2>
        <p className="text-gray-600 mt-1">Exit reasons breakdown and departmental patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Exit Reasons by Department</h3>

          <div className="space-y-4">
            {exitReasons.map((reason, index) => {
              const percentage = (reason.count / totalExits) * 100;
              const barWidth = (reason.count / maxCount) * 100;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{reason.reason}</span>
                    <span className="text-xs text-gray-500">
                      {reason.count} exits ({percentage.toFixed(1)}%)
                    </span>
                  </div>

                  <div
                    className="relative h-12 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedReason(selectedReason === reason.reason ? null : reason.reason)}
                  >
                    {reason.departments.map((dept, deptIndex) => {
                      const deptWidth = (dept.count / reason.count) * barWidth;
                      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];
                      const color = colors[deptIndex % colors.length];

                      return (
                        <div
                          key={deptIndex}
                          className="absolute top-0 bottom-0 flex items-center justify-center text-white text-xs font-medium transition-all duration-300"
                          style={{
                            left: `${reason.departments.slice(0, deptIndex).reduce((sum, d) => sum + (d.count / reason.count) * barWidth, 0)}%`,
                            width: `${deptWidth}%`,
                            backgroundColor: color
                          }}
                          title={`${dept.name}: ${dept.count}`}
                        >
                          {deptWidth > 8 && dept.count}
                        </div>
                      );
                    })}
                  </div>

                  {selectedReason === reason.reason && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-xs font-semibold text-blue-900 mb-2">Department Breakdown:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {reason.departments.map((dept, deptIndex) => (
                          <div key={deptIndex} className="flex justify-between text-xs">
                            <span className="text-blue-700">{dept.name}</span>
                            <span className="font-semibold text-blue-900">{dept.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3">Click on a bar to see department breakdown</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-xs text-gray-600">Engineering</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-600">Sales</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span className="text-xs text-gray-600">Marketing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-xs text-gray-600">Operations</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Exit Summary</h3>
            <div className="space-y-4">
              <div>
                <div className="text-3xl font-bold text-gray-900">{totalExits}</div>
                <div className="text-sm text-gray-600">Total Exits (12mo)</div>
              </div>
              <div className="h-px bg-gray-200"></div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Voluntary</span>
                  <span className="font-semibold text-gray-900">{Math.floor(totalExits * 0.72)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Involuntary</span>
                  <span className="font-semibold text-gray-900">{Math.floor(totalExits * 0.28)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
            <h4 className="text-sm font-semibold text-red-900 mb-3">Top Risk Factor</h4>
            <div className="text-3xl font-bold text-red-900 mb-2">{exitReasons[0].reason}</div>
            <div className="text-sm text-red-700">
              {((exitReasons[0].count / totalExits) * 100).toFixed(0)}% of all exits
            </div>
            <div className="mt-4 pt-4 border-t border-red-200">
              <p className="text-xs text-red-600">
                Most impacted: {exitReasons[0].departments[0].name}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Exit Interview</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Completion Rate</span>
                <span className="font-semibold text-green-600">78%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Avg Rating (Exit)</span>
                <span className="font-semibold text-gray-900">3.2/5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Would Return</span>
                <span className="font-semibold text-blue-600">42%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Exit Trend by Quarter</h3>
        <div className="h-64 flex items-end justify-between gap-3">
          {['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025'].map((quarter, index) => {
            const values = [28, 32, 35, 38, 42];
            const value = values[index];
            const height = (value / Math.max(...values)) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full group">
                  <div
                    className="bg-red-500 hover:bg-red-600 transition-colors rounded-t cursor-pointer"
                    style={{ height: `${height * 2}px` }}
                  >
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {value} exits
                    </div>
                  </div>
                </div>
                <div className="text-xs text-center text-gray-600 mt-2">{quarter}</div>
                <div className="text-sm font-semibold text-gray-900 mt-1">{value}</div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 bg-orange-50 rounded-lg p-3 border border-orange-200">
          <p className="text-sm text-orange-800">
            <span className="font-semibold">Trend:</span> Exit rate increasing 12% YoY — immediate action required
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Retention Recommendations</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-600 mt-1">•</span>
            <span>Conduct compensation review for high-risk departments (Engineering, Sales)</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-600 mt-1">•</span>
            <span>Implement structured career development paths to address growth concerns</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-600 mt-1">•</span>
            <span>Provide management training focusing on employee engagement and retention</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-600 mt-1">•</span>
            <span>Review workload and overtime policies to improve work-life balance</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
