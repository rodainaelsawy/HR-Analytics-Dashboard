import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

type TalentHealthSnapshotProps = {
  onNavigate: (view: string) => void;
};

type SnapshotData = {
  diversityScore: number;
  genderBalance: { male: number; female: number; other: number };
  performanceDistribution: number[];
  // firstYearAttrition: number;
};

export default function TalentHealthSnapshot({ onNavigate }: TalentHealthSnapshotProps) {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select('*');

      const { data: reviews } = await supabase
        .from('performance_reviews')
        .select('rating');

      // const { data: cohorts } = await supabase
      //   .from('cohort_tracking')
      //   .select('*, employee:employees!inner(status, hire_date, termination_date)');

      if (!employees) return;

      const activeEmployees = employees.filter(e => e.status === 'Active');
      const total = activeEmployees.length;

      const genderBalance = {
        male: activeEmployees.filter(e => e.gender === 'Male').length,
        female: activeEmployees.filter(e => e.gender === 'Female').length,
        other: activeEmployees.filter(e => e.gender !== 'Male' && e.gender !== 'Female').length
      };

      const ratings = reviews?.map(r => Number(r.rating)) || [];
      const performanceDistribution = [
        ratings.filter(r => r >= 1 && r < 2).length,
        ratings.filter(r => r >= 2 && r < 3).length,
        ratings.filter(r => r >= 3 && r < 4).length,
        ratings.filter(r => r >= 4 && r <= 5).length
      ];

      // const firstYearEmployees = cohorts?.filter(c => {
      //   const hireDate = new Date(c.employee.hire_date);
      //   const oneYearLater = new Date(hireDate);
      //   oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      //   return oneYearLater <= new Date();
      // }) || [];

      // const firstYearAttrited = firstYearEmployees.filter(c => {
      //   if (!c.employee.termination_date) return false;
      //   const hireDate = new Date(c.employee.hire_date);
      //   const termDate = new Date(c.employee.termination_date);
      //   const daysDiff = (termDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24);
      //   return daysDiff <= 365;
      // }).length;

      // const firstYearAttrition = firstYearEmployees.length > 0
      //   ? (firstYearAttrited / firstYearEmployees.length) * 100
      //   : 0;

      const minorityCount = activeEmployees.filter(
        e => e.ethnicity !== 'White' || e.gender !== 'Male'
      ).length;
      const diversityScore = (minorityCount / total) * 100;

      setData({
        diversityScore,
        genderBalance,
        performanceDistribution,
        // firstYearAttrition
      });
    } catch (error) {
      console.error('Error fetching talent health data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !data) {
    return null;
  }

  const maxPerf = Math.max(...data.performanceDistribution, 1);

  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Talent Health Snapshot</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Diversity Snapshot</h3>
            <button
              onClick={() => onNavigate('diversity')}
              className="text-blue-600 hover:text-blue-700"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden flex">
                <div
                  className="bg-blue-500"
                  style={{ width: `${(data.genderBalance.male / (data.genderBalance.male + data.genderBalance.female + data.genderBalance.other)) * 100}%` }}
                />
                <div
                  className="bg-pink-500"
                  style={{ width: `${(data.genderBalance.female / (data.genderBalance.male + data.genderBalance.female + data.genderBalance.other)) * 100}%` }}
                />
                <div
                  className="bg-purple-500"
                  style={{ width: `${(data.genderBalance.other / (data.genderBalance.male + data.genderBalance.female + data.genderBalance.other)) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Male</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-pink-500 rounded"></div>
                <span className="text-gray-600">Female</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-gray-600">Other</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Diversity Score</span>
                <span className="text-lg font-semibold text-gray-900">{data.diversityScore.toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Distribution</h3>
            <button
              onClick={() => onNavigate('performance')}
              className="text-blue-600 hover:text-blue-700"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="h-32 flex items-end gap-2">
              {data.performanceDistribution.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                    style={{ height: `${(count / maxPerf) * 100}%`, minHeight: count > 0 ? '8px' : '0' }}
                  />
                  <span className="text-xs text-gray-500">{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Rating</span>
                <span className="text-lg font-semibold text-gray-900">3.8</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">First-Year Attrition</h3>
            <button
              onClick={() => onNavigate('attrition')}
              className="text-blue-600 hover:text-blue-700"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="relative h-32 flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E5E7EB"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#EF4444"
                  strokeWidth="12"
                  fill="none"
                  // strokeDasharray={`${(data.firstYearAttrition / 100) * 351.86} 351.86`}
                />
              </svg>
              <div className="absolute text-center">
                {/* <div className="text-2xl font-bold text-gray-900">{data.firstYearAttrition.toFixed(1)}%</div> */}
              </div>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Industry Avg</span>
                <span className="text-sm text-gray-500">22%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
