import { useEffect, useState } from 'react';
import { Users, Briefcase, DollarSign, TrendingUp, Filter } from 'lucide-react';
import MetricCard from './MetricCard';
import { supabase } from '../lib/supabase';

type DepartmentMetrics = {
  name: string;
  headcount: number;
  avgSalary: number;
  turnoverRate: number;
};

export default function WorkforceIntelligence() {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [fte, setFte] = useState(0);
  const [turnoverRate, setTurnoverRate] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [departments, setDepartments] = useState<DepartmentMetrics[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkforceData();
  }, [selectedDepartment]);

  async function fetchWorkforceData() {
    try {
      const { data: employees } = await supabase
        .from('employees')
        .select('*, department:departments(name)');

      const { data: depts } = await supabase
        .from('departments')
        .select('*');

      const { data: exits } = await supabase
        .from('exit_records')
        .select('*');

      if (!employees || !depts) return;

      const activeEmployees = employees.filter(e => e.status === 'Active');

      const filteredEmployees = selectedDepartment === 'all'
        ? activeEmployees
        : activeEmployees.filter(e => e.department?.name === selectedDepartment);

      const total = filteredEmployees.length;
      const fullTimeCount = filteredEmployees.filter(e => e.employment_type === 'Full-time').length;
      const partTimeCount = filteredEmployees.filter(e => e.employment_type === 'Part-time').length;
      const fteValue = fullTimeCount + (partTimeCount * 0.5);

      const totalSalary = filteredEmployees.reduce((sum, e) => sum + Number(e.salary), 0);

      const recentExits = exits?.filter(e => {
        const exitDate = new Date(e.exit_date);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        return exitDate >= oneYearAgo;
      }) || [];

      const turnover = total > 0 ? (recentExits.length / total) * 100 : 0;

      setTotalEmployees(total);
      setFte(fteValue);
      setTurnoverRate(turnover);
      setLaborCost(totalSalary);

      const deptMetrics: DepartmentMetrics[] = depts.map(dept => {
        const deptEmployees = activeEmployees.filter(e => e.department_id === dept.id);
        const deptExits = exits?.filter(ex => {
          const emp = employees.find(e => e.id === ex.employee_id);
          return emp && emp.department_id === dept.id;
        }) || [];

        return {
          name: dept.name,
          headcount: deptEmployees.length,
          avgSalary: deptEmployees.length > 0
            ? deptEmployees.reduce((sum, e) => sum + Number(e.salary), 0) / deptEmployees.length
            : 0,
          turnoverRate: deptEmployees.length > 0 ? (deptExits.length / deptEmployees.length) * 100 : 0
        };
      });

      setDepartments(deptMetrics.sort((a, b) => b.headcount - a.headcount));
    } catch (error) {
      console.error('Error fetching workforce data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading workforce data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Executive Workforce Intelligence</h2>
          <p className="text-gray-600 mt-1">
            Comprehensive organizational headcount, turnover, diversity, and cost analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept.name} value={dept.name}>{dept.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Headcount"
          value={totalEmployees.toLocaleString()}
          change={5.2}
          icon={Users}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="FTE Count"
          value={fte.toFixed(1)}
          change={4.8}
          icon={Briefcase}
          iconColor="text-green-600"
        />
        <MetricCard
          title="Turnover Rate"
          value={`${turnoverRate.toFixed(1)}%`}
          change={-2.3}
          icon={TrendingUp}
          iconColor="text-orange-600"
        />
        <MetricCard
          title="Total Labor Cost"
          value={`$${(laborCost / 1000000).toFixed(1)}M`}
          change={6.5}
          icon={DollarSign}
          iconColor="text-purple-600"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Department</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Headcount</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Salary</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Turnover</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={dept.name} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-3 px-4 text-sm text-gray-900">{dept.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">{dept.headcount}</td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">
                    ${(dept.avgSalary / 1000).toFixed(0)}K
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    <span className={`${dept.turnoverRate > 15 ? 'text-red-600' : 'text-green-600'}`}>
                      {dept.turnoverRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 text-right">
                    {((dept.headcount / totalEmployees) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">DEI & Pay Equity</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Gender Balance</span>
                <span className="text-gray-900 font-medium">52% / 48%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '52%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Pay Equity Index</span>
                <span className="text-green-600 font-medium">0.98</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: '98%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Diversity Score</span>
                <span className="text-blue-600 font-medium">68%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Efficiency Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Payroll-to-Revenue Ratio</span>
              <span className="text-sm font-semibold text-gray-900">42.3%</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Labor Cost per Employee</span>
              <span className="text-sm font-semibold text-gray-900">
                ${(laborCost / totalEmployees / 1000).toFixed(1)}K
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Benefits Cost Ratio</span>
              <span className="text-sm font-semibold text-gray-900">18.5%</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Overtime Percentage</span>
              <span className="text-sm font-semibold text-gray-900">3.2%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
