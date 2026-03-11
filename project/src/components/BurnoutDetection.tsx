import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import type { FilterState } from '../types';
import { supabase } from '../lib/supabase';

type BurnoutDetectionProps = {
  filters: FilterState;
};

type EmployeeRiskData = {
  name: string;
  overtime: number;
  performance: number;
  trend: 'declining' | 'stable' | 'improving';
};

export default function BurnoutDetection({ filters }: BurnoutDetectionProps) {
  const [scatterData, setScatterData] = useState<EmployeeRiskData[]>([]);
  const [burnoutRiskIndex, setBurnoutRiskIndex] = useState(62);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBurnoutData();
  }, [filters]);

  async function fetchBurnoutData() {
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select('id, first_name, last_name, employee_id')
        .eq('status', 'Active');

      const { data: attendanceRecords } = await supabase
        .from('attendance_records')
        .select('employee_id, overtime_hours, date');

      const { data: performanceReviews } = await supabase
        .from('performance_reviews')
        .select('employee_id, rating')
        .order('review_date', { ascending: false });

      if (!employees || !attendanceRecords || !performanceReviews) {
        setScatterData([]);
        setBurnoutRiskIndex(0);
        return;
      }

      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const overtimeByEmployee = new Map<string, number>();
      attendanceRecords
        .filter(record => new Date(record.date) >= threeMonthsAgo)
        .forEach(record => {
          const current = overtimeByEmployee.get(record.employee_id) || 0;
          overtimeByEmployee.set(record.employee_id, current + Number(record.overtime_hours));
        });

      const performanceByEmployee = new Map<string, number>();
      performanceReviews.forEach(review => {
        if (!performanceByEmployee.has(review.employee_id)) {
          performanceByEmployee.set(review.employee_id, Number(review.rating));
        }
      });

      const employeeData: EmployeeRiskData[] = employees
        .filter(emp => overtimeByEmployee.has(emp.id) && performanceByEmployee.has(emp.id))
        .map(emp => {
          const overtime = overtimeByEmployee.get(emp.id) || 0;
          const performance = performanceByEmployee.get(emp.id) || 3;

          let trend: 'declining' | 'stable' | 'improving' = 'stable';
          if (overtime > 40 && performance < 3.5) trend = 'declining';
          else if (overtime < 15 && performance > 4) trend = 'improving';

          return {
            name: `${emp.first_name} ${emp.last_name}`,
            overtime,
            performance,
            trend
          };
        });

      setScatterData(employeeData);

      const atRiskCount = employeeData.filter(e => e.overtime > 40 && e.performance < 3.5).length;
      const riskIndex = employeeData.length > 0 ? (atRiskCount / employeeData.length) * 100 : 0;
      setBurnoutRiskIndex(riskIndex);
    } catch (error) {
      console.error('Error fetching burnout data:', error);
      setScatterData([]);
      setBurnoutRiskIndex(0);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading burnout detection data...</div>;
  }

  const atRiskEmployees = scatterData.filter(e => e.overtime > 50 && e.performance < 3.5);
  const decliningEmployees = scatterData.filter(e => e.trend === 'declining');

  const gaugeRotation = (burnoutRiskIndex / 100) * 180 - 90;
  const gaugeColor = burnoutRiskIndex > 70 ? '#EF4444' : burnoutRiskIndex > 40 ? '#F59E0B' : '#10B981';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Burnout Detection</h2>
        <p className="text-gray-600 mt-1">Line Manager view of overtime patterns and performance decline indicators</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Overtime vs Performance Correlation</h3>

          <div className="h-96 relative bg-gray-50 rounded-lg p-6">
            <div className="absolute left-4 top-8 bottom-16 text-xs text-gray-500 flex flex-col justify-between">
              <span>5.0</span>
              <span>4.5</span>
              <span>4.0</span>
              <span>3.5</span>
              <span>3.0</span>
              <span>2.5</span>
            </div>

            <div className="absolute bottom-8 left-16 right-8 flex justify-between text-xs text-gray-500">
              <span>0h</span>
              <span>20h</span>
              <span>40h</span>
              <span>60h</span>
              <span>80h</span>
            </div>

            <div
              className="absolute border-l-2 border-b-2 border-gray-300"
              style={{ left: '64px', right: '32px', top: '32px', bottom: '64px' }}
            >
              <div
                className="absolute left-0 right-0 bg-red-50 border-t-2 border-red-300"
                style={{ top: '60%', bottom: 0 }}
              >
                <span className="absolute top-2 left-2 text-xs font-medium text-red-600">High Burnout Risk Zone</span>
              </div>

              <div
                className="absolute left-0 right-0 bg-green-50"
                style={{ top: 0, bottom: '40%' }}
              >
                <span className="absolute top-2 left-2 text-xs font-medium text-green-600">Healthy Zone</span>
              </div>

              {scatterData.map((employee, index) => {
                const x = (employee.overtime / 80) * 100;
                const y = 100 - ((employee.performance - 2.5) / 2.5) * 100;

                let color = '#10B981';
                if (employee.overtime > 50 && employee.performance < 3.5) color = '#EF4444';
                else if (employee.overtime > 30 && employee.performance < 4) color = '#F59E0B';

                let size = 'w-2.5 h-2.5';
                if (employee.trend === 'declining') size = 'w-3 h-3';

                return (
                  <div
                    key={index}
                    className={`absolute ${size} rounded-full opacity-70 hover:opacity-100 hover:scale-150 transition-all cursor-pointer`}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      backgroundColor: color
                    }}
                    title={`${employee.name}\nOvertime: ${employee.overtime.toFixed(0)}h\nPerformance: ${employee.performance.toFixed(1)}\nTrend: ${employee.trend}`}
                  >
                    {employee.trend === 'declining' && (
                      <TrendingDown className="absolute -top-1 -right-1 w-3 h-3 text-red-600" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700">
              Monthly Overtime Hours
            </div>
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-700 whitespace-nowrap">
              Performance Rating
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-sm text-gray-600">At Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">High Risk</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Burnout Risk Index</h3>

            <div className="relative h-48 flex items-end justify-center">
              <svg viewBox="0 0 200 100" className="w-full">
                <path
                  d="M 20 80 A 80 80 0 0 1 180 80"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="20"
                />
                <path
                  d="M 20 80 A 80 80 0 0 1 100 20"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="20"
                />
                <path
                  d="M 100 20 A 80 80 0 0 1 140 35"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="20"
                />
                <path
                  d="M 140 35 A 80 80 0 0 1 180 80"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="20"
                />

                <g transform={`rotate(${gaugeRotation} 100 80)`}>
                  <line x1="100" y1="80" x2="100" y2="30" stroke={gaugeColor} strokeWidth="3" strokeLinecap="round" />
                  <circle cx="100" cy="80" r="5" fill={gaugeColor} />
                </g>
              </svg>

              <div className="absolute bottom-8 text-center">
                <div className="text-4xl font-bold" style={{ color: gaugeColor }}>
                  {burnoutRiskIndex.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600 mt-1">Risk Level</div>
              </div>
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Alert Summary</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-800">High Risk</span>
                </div>
                <span className="text-lg font-bold text-red-900">{atRiskEmployees.length}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-800">Declining</span>
                </div>
                <span className="text-lg font-bold text-orange-900">{decliningEmployees.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Recommendations</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Review workload distribution for high overtime employees</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Schedule 1-on-1s with declining performers</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Consider hiring to reduce team overtime</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
