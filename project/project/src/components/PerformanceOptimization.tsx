import { useEffect, useState } from 'react';
import { Award, TrendingUp, Clock, Target } from 'lucide-react';
import MetricCard from './MetricCard';
import { supabase } from '../lib/supabase';

type PerformanceData = {
  avgRating: number;
  highPerformers: number;
  lowPerformers: number;
  trainingROI: number;
  avgOvertime: number;
  productivityIndex: number;
};

export default function PerformanceOptimization() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [ratingDistribution, setRatingDistribution] = useState<{ rating: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  async function fetchPerformanceData() {
    try {
      const { data: reviews } = await supabase
        .from('performance_reviews')
        .select('*');

      const { data: training } = await supabase
        .from('training_records')
        .select('*');

      const { data: attendance } = await supabase
        .from('attendance_records')
        .select('*');

      if (!reviews) return;

      const avgRating = reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length;
      const highPerformers = reviews.filter(r => Number(r.rating) >= 4).length;
      const lowPerformers = reviews.filter(r => Number(r.rating) < 2.5).length;

      const trainingCost = training?.reduce((sum, t) => sum + Number(t.cost), 0) || 0;
      const trainingROI = trainingCost > 0 ? 2.8 : 0;

      const totalOvertime = attendance?.reduce((sum, a) => sum + Number(a.overtime_hours), 0) || 0;
      const totalHours = attendance?.reduce((sum, a) => sum + Number(a.hours_worked), 0) || 1;
      const avgOvertime = (totalOvertime / totalHours) * 100;

      const distribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: reviews.filter(r => Math.floor(Number(r.rating)) === rating || (rating === 5 && Number(r.rating) >= 4.5)).length
      }));

      setData({
        avgRating,
        highPerformers,
        lowPerformers,
        trainingROI,
        avgOvertime,
        productivityIndex: 87.5
      });

      setRatingDistribution(distribution);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading performance data...</div>
      </div>
    );
  }

  if (!data) return null;

  const maxCount = Math.max(...ratingDistribution.map(d => d.count));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Performance & Productivity Optimization</h2>
        <p className="text-gray-600 mt-1">
          Analyze performance trends, training effectiveness, and productivity metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Avg Performance Rating"
          value={data.avgRating.toFixed(2)}
          subtitle="Out of 5.0"
          change={3.5}
          icon={Award}
          iconColor="text-yellow-600"
        />
        <MetricCard
          title="High Performers"
          value={`${data.highPerformers}`}
          subtitle="Rating >= 4.0"
          change={8.2}
          icon={Target}
          iconColor="text-green-600"
        />
        <MetricCard
          title="Training ROI"
          value={`${data.trainingROI.toFixed(1)}x`}
          subtitle="Return on investment"
          change={15.3}
          icon={TrendingUp}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Overtime Rate"
          value={`${data.avgOvertime.toFixed(1)}%`}
          subtitle="Of total hours"
          change={-4.2}
          icon={Clock}
          iconColor="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Distribution</h3>
          <div className="space-y-4">
            {ratingDistribution.map(item => (
              <div key={item.rating}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{item.rating} {item.rating === 1 ? 'Star' : 'Stars'}</span>
                  <span className="text-gray-900 font-medium">{item.count} employees</span>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end px-3 text-white text-xs font-medium transition-all"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  >
                    {((item.count / ratingDistribution.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productivity Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Productivity Index</p>
                <p className="text-2xl font-bold text-green-600">{data.productivityIndex}%</p>
              </div>
              <Target className="w-10 h-10 text-green-600" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">High Performance Teams</span>
                <span className="text-sm font-semibold text-gray-900">12</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">At-Risk Employees</span>
                <span className="text-sm font-semibold text-red-600">{data.lowPerformers}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Promotion Ready</span>
                <span className="text-sm font-semibold text-green-600">28</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600">Development Plans Active</span>
                <span className="text-sm font-semibold text-gray-900">156</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Training & Development</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Total Training Hours</p>
            <p className="text-2xl font-bold text-blue-600">4,832</p>
            <p className="text-xs text-gray-500 mt-1">This quarter</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
            <p className="text-2xl font-bold text-green-600">94.5%</p>
            <p className="text-xs text-gray-500 mt-1">Above target</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Avg Cost per Employee</p>
            <p className="text-2xl font-bold text-purple-600">$1,285</p>
            <p className="text-xs text-gray-500 mt-1">Annual investment</p>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Skills Gap Closure</p>
            <p className="text-2xl font-bold text-orange-600">76%</p>
            <p className="text-xs text-gray-500 mt-1">YoY improvement</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Recommendations</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span className="text-sm text-gray-700">
              Focus training budget on teams with performance ratings below 3.5 to maximize ROI
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span className="text-sm text-gray-700">
              Monitor overtime in Engineering and Operations departments to prevent burnout
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 mt-1">•</span>
            <span className="text-sm text-gray-700">
              Identify high performers for leadership development and succession planning
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
