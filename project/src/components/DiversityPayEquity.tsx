import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { FilterState } from '../types';

type DiversityPayEquityProps = {
  filters: FilterState;
};

type DiversityData = {
  department: string;
  male: number;
  female: number;
  other: number;
};

type PayEquityData = {
  gender: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
};

export default function DiversityPayEquity({ filters }: DiversityPayEquityProps) {
  const [diversityData, setDiversityData] = useState<DiversityData[]>([]);
  const [payEquityData, setPayEquityData] = useState<PayEquityData[]>([]);
  const [payGap, setPayGap] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [totalGenderRatio, setTotalGenderRatio] = useState<DiversityData>();

  useEffect(() => {
    fetchDiversityData();
  }, [filters]);

  async function fetchDiversityData() {
    try {
      const employee_count = (await supabase.from('employees').select('first_name', { count: 'exact', head: true }).eq('status', 'Active')).count;
      if(!employee_count) return;
      const range = Math.ceil(employee_count/500)
      const employees = []
      for (let index = 0; index < range; index++) {
      const { data: fraction } = await supabase
        .from('employees')
        .select('*, departments(name)')
        .eq('status', 'Active')
        .range(index * 500, (index + 1)*500 - 1);
        employees.push(...(fraction ?? []));
      }

      if (!employees) return;

      const deptMap = new Map<string, { male: number; female: number; other: number }>();
      const overallStats: DiversityData = { department: "Overall", male: 0, female: 0, other: 0 }

      employees.forEach(emp => {
        const deptName = emp.departments?.name || 'Unknown';
        if (!deptMap.has(deptName)) {
          deptMap.set(deptName, { male: 0, female: 0, other: 0 });
        }
        const dept = deptMap.get(deptName)!;
        if (emp.gender === 'Male') {dept.male++; overallStats.male++}
        else if (emp.gender === 'Female') {dept.female++; overallStats.female++}
        else {dept.other++; overallStats.other++}; 
      });

      const maleRatio = overallStats.male/employee_count * 100;
      const femaleRatio = overallStats.female/employee_count * 100;
      const otherRatio = overallStats.other/employee_count * 100;
      overallStats.male = maleRatio;
      overallStats.female = femaleRatio;
      overallStats.other = otherRatio;
      setTotalGenderRatio(overallStats);

      const diversity = Array.from(deptMap.entries()).map(([department, counts]) => ({
        department,
        ...counts
      }));

      setDiversityData(diversity);

      const maleSalaries = employees.filter(e => e.gender === 'Male').map(e => Number(e.salary)).sort((a, b) => a - b);
      const femaleSalaries = employees.filter(e => e.gender === 'Female').map(e => Number(e.salary)).sort((a, b) => a - b);

      const getQuartile = (arr: number[], q: number) => {
        const pos = (arr.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        return arr[base + 1] !== undefined ? arr[base] + rest * (arr[base + 1] - arr[base]) : arr[base];
      };

      const maleMedian = maleSalaries.length > 0 ? getQuartile(maleSalaries, 0.5) : 0;
      const femaleMedian = femaleSalaries.length > 0 ? getQuartile(femaleSalaries, 0.5) : 0;
      const gap = maleMedian > 0 ? ((maleMedian - femaleMedian) / maleMedian) * 100 : 0;

      setPayGap(gap);

      const payEquity: PayEquityData[] = [
        {
          gender: 'Male',
          min: maleSalaries[0] || 0,
          q1: getQuartile(maleSalaries, 0.25) || 0,
          median: maleMedian,
          q3: getQuartile(maleSalaries, 0.75) || 0,
          max: maleSalaries[maleSalaries.length - 1] || 0
        },
        {
          gender: 'Female',
          min: femaleSalaries[0] || 0,
          q1: getQuartile(femaleSalaries, 0.25) || 0,
          median: femaleMedian,
          q3: getQuartile(femaleSalaries, 0.75) || 0,
          max: femaleSalaries[femaleSalaries.length - 1] || 0
        }
      ];

      setPayEquityData(payEquity);
    } catch (error) {
      console.error('Error fetching diversity data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading diversity & pay equity data...</div>;
  }

  const maxCount = Math.max(...diversityData.flatMap(d => [d.male, d.female, d.other]));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Diversity & Pay Equity</h2>
        <p className="text-gray-600 mt-1">HR Manager view of workforce composition and compensation fairness</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Diversity Composition by Department</h3>
          <div className="space-y-4">
            {diversityData.slice(0, 6).map((dept, index) => {
              const total = dept.male + dept.female + dept.other;
              const malePercent = (dept.male / maxCount) * 100;
              const femalePercent = (dept.female / maxCount) * 100;
              const otherPercent = (dept.other / maxCount) * 100;

              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{dept.department}</span>
                    <span className="text-xs text-gray-500">{total} employees</span>
                  </div>
                  <div className="flex gap-1 h-8">
                    <div
                      className="bg-blue-500 rounded-l flex items-center justify-center text-white text-xs font-medium hover:bg-blue-600 transition-colors"
                      style={{ width: `${malePercent}%` }}
                      title={`Male: ${dept.male}`}
                    >
                      {dept.male > 0 && dept.male}
                    </div>
                    <div
                      className="bg-pink-500 flex items-center justify-center text-white text-xs font-medium hover:bg-pink-600 transition-colors"
                      style={{ width: `${femalePercent}%` }}
                      title={`Female: ${dept.female}`}
                    >
                      {dept.female > 0 && dept.female}
                    </div>
                    {dept.other > 0 && (
                      <div
                        className="bg-purple-500 rounded-r flex items-center justify-center text-white text-xs font-medium hover:bg-purple-600 transition-colors"
                        style={{ width: `${otherPercent}%` }}
                        title={`Other: ${dept.other}`}
                      >
                        {dept.other}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Male</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-pink-500 rounded"></div>
              <span className="text-sm text-gray-600">Female</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-600">Other</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pay Gap Indicator</h3>
          <div className="flex flex-col items-center justify-center py-8">
            <div className={`text-6xl font-bold mb-4 ${payGap < 5 ? 'text-green-600' : 'text-orange-600'}`}>
              {payGap.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 mb-6">Gender Pay Gap</p>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${payGap < 5 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
              {payGap < 5 ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">
                {payGap < 5 ? 'Compliant' : 'Needs Attention'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-4">Target: &lt; 5%</p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gender Balance</span>
              <span className="font-medium">{ totalGenderRatio?.male.toFixed(1) }% / { totalGenderRatio?.female.toFixed(1) }% / { totalGenderRatio?.other.toFixed(1) }%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Leadership Diversity</span>
              <span className="font-medium">N/A</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">New Hire Diversity</span>
              <span className="font-medium">N/A</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Pay Equity Analysis</h3>
        <div className="h-64 flex items-center gap-8 px-8">
          {payEquityData.map((item, index) => {
            const range = 200000;
            const bottom = 40000;

            const minPos = ((item.min - bottom) / range) * 100;
            const q1Pos = ((item.q1 - bottom) / range) * 100;
            const medianPos = ((item.median - bottom) / range) * 100;
            const q3Pos = ((item.q3 - bottom) / range) * 100;
            const maxPos = ((item.max - bottom) / range) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="text-sm font-medium text-gray-700 mb-4">{item.gender}</div>
                <div className="relative w-24 h-48 bg-gray-100 rounded">
                  <div
                    className="absolute left-0 right-0 bg-gray-300 rounded"
                    style={{ bottom: `${minPos}%`, top: `${100 - maxPos}%` }}
                  ></div>
                  <div
                    className={`absolute left-2 right-2 ${index === 0 ? 'bg-blue-400' : 'bg-pink-400'} rounded`}
                    style={{ bottom: `${q1Pos}%`, top: `${100 - q3Pos}%` }}
                  ></div>
                  <div
                    className="absolute left-0 right-0 h-0.5 bg-gray-900"
                    style={{ bottom: `${medianPos}%` }}
                  ></div>
                </div>
                <div className="mt-4 text-center space-y-1">
                  <div className="text-xs text-gray-500">Median</div>
                  <div className="text-sm font-semibold">${(item.median / 1000).toFixed(0)}K</div>
                  {index === 1 && payGap > 0 && (
                    <div className="text-xs text-orange-600">-{payGap.toFixed(1)}%</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          Box plot showing salary distribution. Box represents middle 50%, line shows median, whiskers show min/max.
        </p>
      </div>
    </div>
  );
}
