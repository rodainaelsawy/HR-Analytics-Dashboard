'use client';

import { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, UserCheck, UserX, Award } from 'lucide-react';
import MetricCard from './MetricCard';
import { supabase } from '../lib/supabase';

type OverviewMetrics = {
  totalEmployees: number;
  fullTime: number;
  partTime: number;
  contractors: number;
  avgSalary: number;
  turnoverRate: number;
  voluntaryTurnover: number;
  involuntaryTurnover: number;
  avgTenure: number;
  diversityScore: number;
  genderBalance: number;
  leadershipDiversity: number;
};

export default function Overview() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select('*');

      const { data: exitRecords } = await supabase
        .from('exit_records')
        .select('*, employee:employees(*)');

      if (!employees) return;

      const activeEmployees = employees.filter(e => e.status === 'Active');
      const totalEmployees = activeEmployees.length;
      const fullTime = activeEmployees.filter(e => e.employment_type === 'Full-time').length;
      const partTime = activeEmployees.filter(e => e.employment_type === 'Part-time').length;
      const contractors = activeEmployees.filter(e => e.employment_type === 'Contractor').length;

      const avgSalary = activeEmployees.reduce((sum, e) => sum + Number(e.salary), 0) / totalEmployees;

      const exits = exitRecords || [];
      const recentExits = exits.filter(e => {
        const exitDate = new Date(e.exit_date);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return exitDate >= oneYearAgo;
      });

      const turnoverRate = (recentExits.length / totalEmployees) * 100;
      const voluntaryTurnover = recentExits.filter(e => e.voluntary).length;
      const involuntaryTurnover = recentExits.filter(e => !e.voluntary).length;

      const tenures = activeEmployees.map(e => {
        const hireDate = new Date(e.hire_date);
        const now = new Date();
        return (now.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      });
      const avgTenure = tenures.reduce((sum, t) => sum + t, 0) / tenures.length;

      const females = activeEmployees.filter(e => e.gender === 'Female').length;
      const genderBalance = (females / totalEmployees) * 100;

      setMetrics({
        totalEmployees,
        fullTime,
        partTime,
        contractors,
        avgSalary,
        turnoverRate,
        voluntaryTurnover,
        involuntaryTurnover,
        avgTenure,
        diversityScore: 68,
        genderBalance,
        leadershipDiversity: 34
      });
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Workforce Analytics Hub</h2>
        <p className="text-blue-100">
          Get comprehensive insights into your organization's workforce metrics, diversity, and performance trends.
        </p>
        <p className="text-sm text-blue-200 mt-4">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Workforce Growth"
          value={`+${(12.3).toFixed(1)}%`}
          subtitle="Year over year"
          icon={TrendingUp}
          iconColor="text-green-600"
          change={12.3}
        />
        <MetricCard
          title="Employee Satisfaction"
          value="8.1/10"
          subtitle="Latest survey"
          icon={Award}
          iconColor="text-yellow-600"
        />
        <MetricCard
          title="Cost per Employee"
          value={`$${(metrics.avgSalary / 1000).toFixed(1)}K`}
          subtitle="Annual average"
          icon={DollarSign}
          iconColor="text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Headcount Analysis</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total employees</span>
              <span className="font-semibold text-gray-900">{metrics.totalEmployees}</span>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Full-time</span>
              <span className="font-semibold text-gray-900">{metrics.fullTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Part-time</span>
              <span className="font-semibold text-gray-900">{metrics.partTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Contractors</span>
              <span className="font-semibold text-gray-900">{metrics.contractors}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <span className="text-green-600 font-medium">↑ +5.2%</span> vs last quarter
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserX className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Turnover Insights</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Employee retention</span>
              <span className="font-semibold text-gray-900">{(100 - metrics.turnoverRate).toFixed(1)}%</span>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Voluntary</span>
              <span className="text-sm text-gray-900">{metrics.voluntaryTurnover}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Involuntary</span>
              <span className="text-sm text-gray-900">{metrics.involuntaryTurnover}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg. Tenure</span>
              <span className="text-sm text-gray-900">{metrics.avgTenure.toFixed(1)} yrs</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <span className="text-red-600 font-medium">↓ -0.8%</span> improvement
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">Diversity Metrics</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Workforce diversity</span>
              <span className="font-semibold text-gray-900">{metrics.diversityScore}%</span>
            </div>
            <div className="h-px bg-gray-200"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gender Balance</span>
              <span className="text-sm text-gray-900">{metrics.genderBalance.toFixed(0)}% F</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Leadership Diversity</span>
              <span className="text-sm text-gray-900">{metrics.leadershipDiversity}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Hire Diversity</span>
              <span className="text-sm text-gray-900">47%</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                <span className="text-green-600 font-medium">↑ +1.5%</span> vs last year
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
