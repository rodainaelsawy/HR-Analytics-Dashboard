import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { FilterState } from '../types';

type HRFinancialAlignmentProps = {
  filters: FilterState;
};

type PayrollData = {
  month: string;
  payroll: number;
  revenue: number;
  ratio: number;
};

type LaborCostData = {
  month: string;
  salary: number;
  overtime: number;
  benefits: number;
  training: number;
};

export default function HRFinancialAlignment({ filters }: HRFinancialAlignmentProps) {
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [laborCostData, setLaborCostData] = useState<LaborCostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, [filters]);

  async function fetchFinancialData() {
    try {
      const payroll: PayrollData[] = [
        { month: 'Jan', payroll: 4200000, revenue: 12000000, ratio: 35 },
        { month: 'Feb', payroll: 4300000, revenue: 12500000, ratio: 34.4 },
        { month: 'Mar', payroll: 4400000, revenue: 13000000, ratio: 33.8 },
        { month: 'Apr', payroll: 4500000, revenue: 13200000, ratio: 34.1 },
        { month: 'May', payroll: 4600000, revenue: 13800000, ratio: 33.3 },
        { month: 'Jun', payroll: 4700000, revenue: 14200000, ratio: 33.1 },
        { month: 'Jul', payroll: 4800000, revenue: 14500000, ratio: 33.1 },
        { month: 'Aug', payroll: 4900000, revenue: 15000000, ratio: 32.7 },
      ];

      const laborCost: LaborCostData[] = [
        { month: 'Jan', salary: 3800000, overtime: 180000, benefits: 150000, training: 70000 },
        { month: 'Feb', salary: 3900000, overtime: 190000, benefits: 140000, training: 70000 },
        { month: 'Mar', salary: 4000000, overtime: 200000, benefits: 130000, training: 70000 },
        { month: 'Apr', salary: 4100000, overtime: 190000, benefits: 140000, training: 70000 },
        { month: 'May', salary: 4200000, overtime: 180000, benefits: 150000, training: 70000 },
        { month: 'Jun', salary: 4300000, overtime: 175000, benefits: 155000, training: 70000 },
        { month: 'Jul', salary: 4400000, overtime: 170000, benefits: 160000, training: 70000 },
        { month: 'Aug', salary: 4500000, overtime: 165000, benefits: 165000, training: 70000 },
      ];

      setPayrollData(payroll);
      setLaborCostData(laborCost);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading HR financial data...</div>;
  }

  const maxPayroll = Math.max(...payrollData.map(d => d.payroll));
  const maxTotal = Math.max(...laborCostData.map(d => d.salary + d.overtime + d.benefits + d.training));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">HR Financial Alignment</h2>
        <p className="text-gray-600 mt-1">Payroll costs, revenue efficiency, and labor spending breakdown</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Payroll vs Revenue</h3>
        <div className="h-80 flex items-end justify-between gap-3">
          {payrollData.map((item, index) => {
            const barHeight = (item.payroll / maxPayroll) * 70;
            const lineHeight = (item.ratio / 40) * 100;

            return (
              <div key={index} className="flex-1 relative flex flex-col justify-end">
                <div
                  className="absolute left-1/2 transform -translate-x-1/2 text-xs font-semibold text-orange-600"
                  style={{ bottom: `${lineHeight}%` }}
                >
                  {item.ratio.toFixed(1)}%
                </div>
                <div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2"
                  style={{ bottom: `${lineHeight}%` }}
                >
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
                <div className="relative group">
                  <div
                    className="bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${barHeight}%` }}
                  >
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Payroll: ${(item.payroll / 1000000).toFixed(1)}M<br />
                      Revenue: ${(item.revenue / 1000000).toFixed(1)}M<br />
                      Ratio: {item.ratio.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="text-xs text-center text-gray-600 mt-2">{item.month}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-center gap-8 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Payroll Cost</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Payroll-to-Revenue %</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Labor Cost Trend</h3>
        <div className="h-80 flex items-end justify-between gap-3">
          {laborCostData.map((item, index) => {
            const total = item.salary + item.overtime + item.benefits + item.training;
            const salaryHeight = (item.salary / maxTotal) * 100;
            const overtimeHeight = (item.overtime / maxTotal) * 100;
            const benefitsHeight = (item.benefits / maxTotal) * 100;
            const trainingHeight = (item.training / maxTotal) * 100;

            return (
              <div key={index} className="flex-1 flex flex-col justify-end group cursor-pointer">
                <div className="relative">
                  <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    Salary: ${(item.salary / 1000000).toFixed(2)}M<br />
                    Overtime: ${(item.overtime / 1000).toFixed(0)}K<br />
                    Benefits: ${(item.benefits / 1000).toFixed(0)}K<br />
                    Training: ${(item.training / 1000).toFixed(0)}K<br />
                    Total: ${(total / 1000000).toFixed(2)}M
                  </div>
                </div>
                <div
                  className="bg-purple-500 hover:bg-purple-600 transition-colors"
                  style={{ height: `${trainingHeight}%` }}
                ></div>
                <div
                  className="bg-green-500 hover:bg-green-600 transition-colors"
                  style={{ height: `${benefitsHeight}%` }}
                ></div>
                <div
                  className="bg-orange-500 hover:bg-orange-600 transition-colors"
                  style={{ height: `${overtimeHeight}%` }}
                ></div>
                <div
                  className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-b"
                  style={{ height: `${salaryHeight}%` }}
                ></div>
                <div className="text-xs text-center text-gray-600 mt-2">{item.month}</div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600">Salary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded"></div>
            <span className="text-sm text-gray-600">Overtime</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Benefits</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600">Training</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="text-sm text-blue-800 font-medium mb-2">Payroll Efficiency</div>
          <div className="text-3xl font-bold text-blue-900">32.7%</div>
          <div className="text-xs text-blue-700 mt-1">Payroll-to-Revenue Ratio</div>
          <div className="mt-3 text-xs text-blue-600">↓ 2.3% vs last year</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="text-sm text-green-800 font-medium mb-2">Cost per FTE</div>
          <div className="text-3xl font-bold text-green-900">$6,200</div>
          <div className="text-xs text-green-700 mt-1">Monthly average</div>
          <div className="mt-3 text-xs text-green-600">↓ 1.8% vs last year</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="text-sm text-purple-800 font-medium mb-2">Overtime Rate</div>
          <div className="text-3xl font-bold text-purple-900">3.4%</div>
          <div className="text-xs text-purple-700 mt-1">Of total labor costs</div>
          <div className="mt-3 text-xs text-purple-600">↓ 0.6% vs last year</div>
        </div>
      </div>
    </div>
  );
}
