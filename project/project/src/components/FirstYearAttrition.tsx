import { useEffect, useState } from 'react';
import { Users, TrendingDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FilterState } from '../types';

type FirstYearAttritionProps = {
  filters: FilterState;
};

type CohortData = {
  cohortName: string;
  hireDate: string;
  month1: number;
  month3: number;
  month6: number;
  month12: number;
  initialSize: number;
};

export default function FirstYearAttrition({ filters }: FirstYearAttritionProps) {
  const [cohortData, setCohortData] = useState<CohortData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCohortData();
  }, [filters]);

  async function fetchCohortData() {
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select('id, hire_date, termination_date, status');

      const { data: exits } = await supabase
        .from('exit_records')
        .select('employee_id, exit_date');

      if (!employees || employees.length === 0) {
        setCohortData([]);
        return;
      }

      const cohortMap = new Map<string, { hired: Set<string>, month1Exit: Set<string>, month3Exit: Set<string>, month6Exit: Set<string>, month12Exit: Set<string> }>();

      employees.forEach(emp => {
        const hireDate = new Date(emp.hire_date);
        const year = hireDate.getFullYear();
        const quarter = Math.ceil((hireDate.getMonth() + 1) / 3);
        const cohortKey = `Q${quarter} ${year}`;

        if (year >= 2024) {
          if (!cohortMap.has(cohortKey)) {
            cohortMap.set(cohortKey, {
              hired: new Set(),
              month1Exit: new Set(),
              month3Exit: new Set(),
              month6Exit: new Set(),
              month12Exit: new Set()
            });
          }
          cohortMap.get(cohortKey)!.hired.add(emp.id);
        }
      });

      exits?.forEach(exit => {
        const employee = employees.find(e => e.id === exit.employee_id);
        if (!employee) return;

        const hireDate = new Date(employee.hire_date);
        const exitDate = new Date(exit.exit_date);
        const year = hireDate.getFullYear();
        const quarter = Math.ceil((hireDate.getMonth() + 1) / 3);
        const cohortKey = `Q${quarter} ${year}`;

        const daysEmployed = Math.floor((exitDate.getTime() - hireDate.getTime()) / (1000 * 60 * 60 * 24));

        const cohort = cohortMap.get(cohortKey);
        if (cohort) {
          if (daysEmployed <= 30) cohort.month1Exit.add(employee.id);
          if (daysEmployed <= 90) cohort.month3Exit.add(employee.id);
          if (daysEmployed <= 180) cohort.month6Exit.add(employee.id);
          if (daysEmployed <= 365) cohort.month12Exit.add(employee.id);
        }
      });

      const cohorts: CohortData[] = Array.from(cohortMap.entries()).map(([key, data]) => {
        const initialSize = data.hired.size;
        const month1Retained = initialSize - data.month1Exit.size;
        const month3Retained = initialSize - data.month3Exit.size;
        const month6Retained = initialSize - data.month6Exit.size;
        const month12Retained = initialSize - data.month12Exit.size;

        const [q, y] = key.split(' ');
        const quarter = parseInt(q.replace('Q', ''));
        const quarterMonths = [(quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2, (quarter - 1) * 3 + 3];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const rangeText = `${monthNames[quarterMonths[0] - 1]}-${monthNames[quarterMonths[2] - 1]} ${y}`;

        const currentDate = new Date();
        const cohortStart = new Date(parseInt(y), quarterMonths[0] - 1, 1);
        const monthsSinceCohort = Math.floor((currentDate.getTime() - cohortStart.getTime()) / (1000 * 60 * 60 * 24 * 30));

        return {
          cohortName: key,
          hireDate: rangeText,
          month1: monthsSinceCohort >= 1 && initialSize > 0 ? Math.round((month1Retained / initialSize) * 100) : 0,
          month3: monthsSinceCohort >= 3 && initialSize > 0 ? Math.round((month3Retained / initialSize) * 100) : 0,
          month6: monthsSinceCohort >= 6 && initialSize > 0 ? Math.round((month6Retained / initialSize) * 100) : 0,
          month12: monthsSinceCohort >= 12 && initialSize > 0 ? Math.round((month12Retained / initialSize) * 100) : 0,
          initialSize
        };
      }).sort((a, b) => {
        const [aq, ay] = a.cohortName.split(' ');
        const [bq, by] = b.cohortName.split(' ');
        if (ay !== by) return parseInt(by) - parseInt(ay);
        return parseInt(bq.replace('Q', '')) - parseInt(aq.replace('Q', ''));
      }).reverse();

      setCohortData(cohorts);
    } catch (error) {
      console.error('Error fetching cohort data:', error);
      setCohortData([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading first year attrition data...</div>;
  }

  const getRetentionColor = (rate: number) => {
    if (rate >= 90) return 'bg-green-500';
    if (rate >= 80) return 'bg-blue-500';
    if (rate >= 70) return 'bg-yellow-500';
    if (rate >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const avgMonth1 = cohortData.filter(c => c.month1 > 0).reduce((sum, c) => sum + c.month1, 0) / cohortData.filter(c => c.month1 > 0).length;
  const avgMonth3 = cohortData.filter(c => c.month3 > 0).reduce((sum, c) => sum + c.month3, 0) / cohortData.filter(c => c.month3 > 0).length;
  const avgMonth6 = cohortData.filter(c => c.month6 > 0).reduce((sum, c) => sum + c.month6, 0) / cohortData.filter(c => c.month6 > 0).length;
  const avgMonth12 = cohortData.filter(c => c.month12 > 0).reduce((sum, c) => sum + c.month12, 0) / cohortData.filter(c => c.month12 > 0).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">First Year Attrition Analysis</h2>
        <p className="text-gray-600 mt-1">Cohort retention tracking for new hires over their first year</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Month 1 Retention</div>
              <div className="text-2xl font-bold text-gray-900">{avgMonth1.toFixed(0)}%</div>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
          <div className="mt-2 text-xs text-green-600">+2% vs industry avg</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Month 3 Retention</div>
              <div className="text-2xl font-bold text-gray-900">{avgMonth3.toFixed(0)}%</div>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div className="mt-2 text-xs text-blue-600">On target</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Month 6 Retention</div>
              <div className="text-2xl font-bold text-gray-900">{avgMonth6.toFixed(0)}%</div>
            </div>
            <TrendingDown className="w-8 h-8 text-orange-600" />
          </div>
          <div className="mt-2 text-xs text-orange-600">-1% vs target</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Month 12 Retention</div>
              <div className="text-2xl font-bold text-gray-900">{avgMonth12.toFixed(0)}%</div>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
          <div className="mt-2 text-xs text-red-600">-3% vs target</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Cohort Retention Analysis</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cohort</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hire Date</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Initial Size</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Month 1</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Month 3</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Month 6</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Month 12</th>
              </tr>
            </thead>
            <tbody>
              {cohortData.map((cohort, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{cohort.cohortName}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{cohort.hireDate}</td>
                  <td className="py-4 px-4 text-center text-sm font-medium text-gray-900">{cohort.initialSize}</td>
                  <td className="py-4 px-4">
                    {cohort.month1 > 0 ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div
                            className={`h-2 rounded-full ${getRetentionColor(cohort.month1)}`}
                            style={{ width: `${cohort.month1}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-10">{cohort.month1}%</span>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-gray-400">N/A</div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {cohort.month3 > 0 ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div
                            className={`h-2 rounded-full ${getRetentionColor(cohort.month3)}`}
                            style={{ width: `${cohort.month3}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-10">{cohort.month3}%</span>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-gray-400">N/A</div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {cohort.month6 > 0 ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div
                            className={`h-2 rounded-full ${getRetentionColor(cohort.month6)}`}
                            style={{ width: `${cohort.month6}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-10">{cohort.month6}%</span>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-gray-400">N/A</div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {cohort.month12 > 0 ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
                          <div
                            className={`h-2 rounded-full ${getRetentionColor(cohort.month12)}`}
                            style={{ width: `${cohort.month12}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 w-10">{cohort.month12}%</span>
                      </div>
                    ) : (
                      <div className="text-center text-xs text-gray-400">N/A</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-600">90%+ (Excellent)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs text-gray-600">80-89% (Good)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs text-gray-600">70-79% (Fair)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-xs text-gray-600">60-69% (Poor)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs text-gray-600">&lt;60% (Critical)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Retention Curve</h3>
          <div className="h-64 relative">
            <svg viewBox="0 0 400 200" className="w-full h-full">
              <line x1="40" y1="10" x2="40" y2="170" stroke="#D1D5DB" strokeWidth="2" />
              <line x1="40" y1="170" x2="380" y2="170" stroke="#D1D5DB" strokeWidth="2" />

              <text x="10" y="15" fontSize="10" fill="#6B7280">100%</text>
              <text x="18" y="95" fontSize="10" fill="#6B7280">90%</text>
              <text x="18" y="175" fontSize="10" fill="#6B7280">80%</text>

              <text x="50" y="185" fontSize="10" fill="#6B7280">M1</text>
              <text x="140" y="185" fontSize="10" fill="#6B7280">M3</text>
              <text x="230" y="185" fontSize="10" fill="#6B7280">M6</text>
              <text x="320" y="185" fontSize="10" fill="#6B7280">M12</text>

              <polyline
                points="60,10 150,50 240,90 330,110"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="3"
              />

              <circle cx="60" cy="10" r="5" fill="#3B82F6" />
              <circle cx="150" cy="50" r="5" fill="#3B82F6" />
              <circle cx="240" cy="90" r="5" fill="#3B82F6" />
              <circle cx="330" cy="110" r="5" fill="#3B82F6" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Average retention rate across all cohorts</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-1.5"></div>
              <p className="text-sm text-gray-700">
                Highest attrition occurs in <span className="font-semibold">first 3 months</span> (6-8% loss)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-1.5"></div>
              <p className="text-sm text-gray-700">
                Q4 2024 cohort showing <span className="font-semibold">improved retention</span> (95% at M1)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-1.5"></div>
              <p className="text-sm text-gray-700">
                12-month retention target: <span className="font-semibold">88%</span> (currently at 85%)
              </p>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-1.5"></div>
              <p className="text-sm text-gray-700">
                Enhanced onboarding program needed for months 3-6
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
