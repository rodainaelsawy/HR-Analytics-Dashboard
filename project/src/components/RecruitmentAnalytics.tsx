import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { FilterState } from '../types';

type RecruitmentAnalyticsProps = {
  filters: FilterState;
};

type FunnelStage = {
  stage: string;
  count: number;
  conversionRate: number;
};

export default function RecruitmentAnalytics({ filters }: RecruitmentAnalyticsProps) {
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [timeToHireTrend, setTimeToHireTrend] = useState<{ month: string; days: number }[]>([]);
  const [costPerHire, setCostPerHire] = useState<{ department: string; cost: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecruitmentData();
  }, [filters]);

  async function fetchRecruitmentData() {
    try {
      const funnel: FunnelStage[] = [
        { stage: 'Applicants', count: 2450, conversionRate: 100 },
        { stage: 'Screened', count: 980, conversionRate: 40 },
        { stage: 'Interviewed', count: 392, conversionRate: 40 },
        { stage: 'Offers', count: 118, conversionRate: 30 },
        { stage: 'Hired', count: 94, conversionRate: 80 }
      ];

      setFunnelData(funnel);

      const timeToHire = [
        { month: 'Jan', days: 42 },
        { month: 'Feb', days: 45 },
        { month: 'Mar', days: 41 },
        { month: 'Apr', days: 38 },
        { month: 'May', days: 36 },
        { month: 'Jun', days: 35 },
        { month: 'Jul', days: 34 },
        { month: 'Aug', days: 32 }
      ];

      setTimeToHireTrend(timeToHire);

      const costData = [
        { department: 'Engineering', cost: 8500 },
        { department: 'Sales', cost: 6200 },
        { department: 'Marketing', cost: 5800 },
        { department: 'Operations', cost: 4200 },
        { department: 'HR', cost: 5500 },
        { department: 'Finance', cost: 7100 }
      ];

      setCostPerHire(costData);
    } catch (error) {
      console.error('Error fetching recruitment data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading recruitment analytics data...</div>;
  }

  const maxCost = Math.max(...costPerHire.map(d => d.cost));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Recruitment & Talent Flow Analytics</h2>
        <p className="text-gray-600 mt-1">Hiring funnel, time-to-hire trends, and recruitment effectiveness</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Hiring Funnel</h3>
          <div className="space-y-3">
            {funnelData.map((stage, index) => {
              const width = (stage.count / funnelData[0].count) * 100;
              const nextStage = funnelData[index + 1];
              const dropOff = nextStage ? stage.count - nextStage.count : 0;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-900 font-semibold">{stage.count.toLocaleString()}</span>
                      {index > 0 && (
                        <span className="text-xs text-green-600">
                          {stage.conversionRate}% conversion
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <div
                      className="h-16 bg-gradient-to-r from-blue-500 to-blue-400 rounded flex items-center justify-center text-white font-medium transition-all duration-500 hover:shadow-lg"
                      style={{ width: `${width}%` }}
                    >
                      {stage.count.toLocaleString()}
                    </div>
                  </div>
                  {dropOff > 0 && (
                    <div className="text-xs text-gray-500 mt-1 ml-2">
                      ↓ {dropOff.toLocaleString()} drop-off
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-blue-600 mb-1">Overall Conversion</div>
              <div className="text-2xl font-bold text-blue-900">3.8%</div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-green-600 mb-1">Offer Acceptance</div>
              <div className="text-2xl font-bold text-green-900">80%</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="text-xs text-purple-600 mb-1">Time to Offer</div>
              <div className="text-2xl font-bold text-purple-900">32d</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">First Year Attrition</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Month 1</span>
                <span className="text-sm font-semibold">98%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '98%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Month 3</span>
                <span className="text-sm font-semibold">94%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '94%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Month 6</span>
                <span className="text-sm font-semibold">89%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '89%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Month 12</span>
                <span className="text-sm font-semibold">83%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: '83%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-xs text-orange-600 mb-1">1st Year Attrition</div>
              <div className="text-2xl font-bold text-orange-900">17%</div>
              <div className="text-xs text-orange-600 mt-1">Target: &lt; 15%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Time-to-Hire Trend</h3>
          <div className="h-64 flex items-end justify-between gap-3">
            {timeToHireTrend.map((item, index) => {
              const height = (item.days / 50) * 100;
              const prevDays = index > 0 ? timeToHireTrend[index - 1].days : item.days;
              const isImproving = item.days < prevDays;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="relative w-full group">
                    <div
                      className={`${isImproving ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'} transition-colors rounded-t cursor-pointer`}
                      style={{ height: `${height * 1.5}px` }}
                    >
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.days} days
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-600 mt-2">{item.month}</div>
                  <div className="text-sm font-semibold text-gray-900 mt-1">{item.days}d</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 bg-green-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-800">Avg reduction per month</span>
              <span className="text-lg font-bold text-green-900">-1.4 days</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Cost per Hire by Department</h3>
          <div className="space-y-3">
            {costPerHire.map((item, index) => {
              const barWidth = (item.cost / maxCost) * 100;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.department}</span>
                    <span className="text-sm font-semibold text-gray-900">${item.cost.toLocaleString()}</span>
                  </div>
                  <div className="h-8 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-blue-500 flex items-center justify-end pr-2 text-white text-xs font-medium transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    >
                      {barWidth > 30 && `$${item.cost.toLocaleString()}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 mb-1">Company Avg</div>
                <div className="text-xl font-bold text-blue-900">$6,217</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="text-xs text-purple-600 mb-1">Industry Avg</div>
                <div className="text-xl font-bold text-purple-900">$7,500</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Exit Reasons Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
            <div className="text-2xl font-bold text-red-900 mb-1">32%</div>
            <div className="text-sm text-red-700">Better Salary</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-500">
            <div className="text-2xl font-bold text-orange-900 mb-1">24%</div>
            <div className="text-sm text-orange-700">Career Growth</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
            <div className="text-2xl font-bold text-yellow-900 mb-1">18%</div>
            <div className="text-sm text-yellow-700">Management</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
            <div className="text-2xl font-bold text-blue-900 mb-1">15%</div>
            <div className="text-sm text-blue-700">Work-Life Balance</div>
          </div>
        </div>
      </div>
    </div>
  );
}
