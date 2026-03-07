import { useEffect, useState } from 'react';
import { Briefcase, Users, TrendingDown, Clock } from 'lucide-react';
import MetricCard from './MetricCard';
import { supabase } from '../lib/supabase';

type TalentFlowMetrics = {
  timeToHire: number;
  costPerHire: number;
  qualityOfHire: number;
  firstYearAttrition: number;
  totalRecruitments: number;
  activeRequisitions: number;
};

export default function TalentFlow() {
  const [metrics, setMetrics] = useState<TalentFlowMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTalentFlowData();
  }, []);

  async function fetchTalentFlowData() {
    try {
      const { data: recruitmentData } = await supabase
        .from('recruitment_records')
        .select('*');

      const { data: exitData } = await supabase
        .from('exit_records')
        .select('*');

      if (!recruitmentData) return;

      const avgTimeToHire = recruitmentData.reduce((sum, r) => sum + (r.time_to_hire_days || 0), 0) / (recruitmentData.length || 1);
      const avgCostPerHire = recruitmentData.reduce((sum, r) => sum + Number(r.cost_per_hire), 0) / (recruitmentData.length || 1);

      const hiredEmployees = recruitmentData.filter(r => r.hire_date).length;
      const firstYearExits = exitData?.filter(e => {
        const recruitment = recruitmentData.find(r => r.employee_id === e.employee_id);
        if (!recruitment?.hire_date) return false;
        const hireDate = new Date(recruitment.hire_date);
        const exitDate = new Date(e.exit_date);
        const daysDiff = (exitDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff < 365;
      }).length || 0;

      const firstYearAttritionRate = hiredEmployees > 0 ? (firstYearExits / hiredEmployees) * 100 : 0;

      setMetrics({
        timeToHire: avgTimeToHire,
        costPerHire: avgCostPerHire,
        qualityOfHire: 78,
        firstYearAttrition: firstYearAttritionRate,
        totalRecruitments: hiredEmployees,
        activeRequisitions: recruitmentData.filter(r => !r.hire_date).length
      });
    } catch (error) {
      console.error('Error fetching talent flow data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading talent flow data...</div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Talent Flow & Hiring Impact</h2>
        <p className="text-gray-600 mt-1">
          End-to-end recruitment pipeline analysis and new hire retention insights
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Avg Time-to-Hire"
          value={`${metrics.timeToHire.toFixed(0)}`}
          subtitle="Days"
          change={-8.5}
          icon={Clock}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Cost per Hire"
          value={`$${(metrics.costPerHire / 1000).toFixed(1)}K`}
          change={-12.3}
          icon={Briefcase}
          iconColor="text-green-600"
        />
        <MetricCard
          title="Quality of Hire"
          value={`${metrics.qualityOfHire}%`}
          change={5.2}
          icon={Users}
          iconColor="text-purple-600"
        />
        <MetricCard
          title="1st Year Attrition"
          value={`${metrics.firstYearAttrition.toFixed(1)}%`}
          change={-3.1}
          icon={TrendingDown}
          iconColor="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recruitment Pipeline</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Total Hired (YTD)</span>
                <span className="text-gray-900 font-medium">{metrics.totalRecruitments}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Active Requisitions</span>
                <span className="text-gray-900 font-medium">{metrics.activeRequisitions}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Top Recruitment Sources</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Referral</span>
                  <span className="text-gray-900 font-medium">38%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Job Board</span>
                  <span className="text-gray-900 font-medium">28%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">LinkedIn</span>
                  <span className="text-gray-900 font-medium">22%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Exit Analytics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Total Exits (12mo)</span>
              <span className="text-sm font-semibold text-gray-900">87</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Voluntary Exits</span>
              <span className="text-sm font-semibold text-orange-600">61</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Involuntary Exits</span>
              <span className="text-sm font-semibold text-red-600">26</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Avg Tenure at Exit</span>
              <span className="text-sm font-semibold text-gray-900">4.2 years</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Top Exit Reasons</p>
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Better Opportunity: 42%</p>
              <p className="text-xs text-gray-600">Career Change: 28%</p>
              <p className="text-xs text-gray-600">Relocation: 18%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Onboarding Effectiveness</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Onboarding Completion</p>
            <p className="text-2xl font-bold text-blue-600">92%</p>
            <p className="text-xs text-gray-500 mt-1">Within 30 days</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Time to Productivity</p>
            <p className="text-2xl font-bold text-green-600">45 days</p>
            <p className="text-xs text-gray-500 mt-1">Average</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">New Hire Satisfaction</p>
            <p className="text-2xl font-bold text-purple-600">8.4/10</p>
            <p className="text-xs text-gray-500 mt-1">Avg survey score</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Retention @ 6mo</p>
            <p className="text-2xl font-bold text-orange-600">96%</p>
            <p className="text-xs text-gray-500 mt-1">Success rate</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategic Recommendations</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span className="text-sm text-gray-700">
              Increase referral program incentives—referrals show highest quality and retention
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span className="text-sm text-gray-700">
              Optimize onboarding for higher-risk departments with above-average early attrition
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span className="text-sm text-gray-700">
              Reduce time-to-hire through structured interview process and candidate pipeline management
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
