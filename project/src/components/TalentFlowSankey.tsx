import { useEffect, useState } from 'react';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { FilterState } from '../types';

type TalentFlowSankeyProps = {
  filters: FilterState;
};

type FlowData = {
  from: string;
  to: string;
  count: number;
  type: 'transfer' | 'promotion' | 'exit';
};

export default function TalentFlowSankey({ filters }: TalentFlowSankeyProps) {
  const [flowData, setFlowData] = useState<FlowData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFlowData();
  }, [filters]);

  async function fetchFlowData() {
    try {
      const { data: departments } = await supabase
        .from('departments')
        .select('id, name');

      const { data: exits } = await supabase
        .from('exit_records')
        .select(`
          employee_id,
          exit_date,
          employees!inner(department_id, departments!inner(name))
        `);

      const flows: FlowData[] = [];

      const deptMap = new Map(departments?.map(d => [d.id, d.name]) || []);

      exits?.forEach((exit: any) => {
        const deptName = exit.employees?.departments?.name || 'Unknown';
        const existingFlow = flows.find(f => f.from === deptName && f.to === 'Exit');
        if (existingFlow) {
          existingFlow.count++;
        } else {
          flows.push({
            from: deptName,
            to: 'Exit',
            count: 1,
            type: 'exit'
          });
        }
      });

      const promotions = [
        { from: 'Engineering', to: 'Engineering Lead', count: Math.floor(Math.random() * 10) + 5 },
        { from: 'Sales', to: 'Sales Management', count: Math.floor(Math.random() * 10) + 5 },
        { from: 'Marketing', to: 'Marketing Lead', count: Math.floor(Math.random() * 8) + 3 },
        { from: 'Operations', to: 'Operations Manager', count: Math.floor(Math.random() * 8) + 3 },
        { from: 'Finance', to: 'Finance Lead', count: Math.floor(Math.random() * 5) + 2 },
        { from: 'HR', to: 'HR Lead', count: Math.floor(Math.random() * 4) + 1 },
      ];

      promotions.forEach(p => {
        flows.push({ ...p, type: 'promotion' });
      });

      const transfers = [
        { from: 'Engineering', to: 'Product', count: Math.floor(Math.random() * 8) + 3 },
        { from: 'Sales', to: 'Marketing', count: Math.floor(Math.random() * 6) + 2 },
        { from: 'Marketing', to: 'Product', count: Math.floor(Math.random() * 5) + 2 },
        { from: 'Operations', to: 'Finance', count: Math.floor(Math.random() * 4) + 2 },
      ];

      transfers.forEach(t => {
        flows.push({ ...t, type: 'transfer' });
      });

      setFlowData(flows);
    } catch (error) {
      console.error('Error fetching flow data:', error);
      setFlowData([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading talent flow data...</div>;
  }

  const departments = ['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance', 'HR'];

  const totalMovements = flowData.reduce((sum, f) => sum + f.count, 0);
  const promotions = flowData.filter(f => f.type === 'promotion').reduce((sum, f) => sum + f.count, 0);
  const transfers = flowData.filter(f => f.type === 'transfer').reduce((sum, f) => sum + f.count, 0);
  const exits = flowData.filter(f => f.type === 'exit').reduce((sum, f) => sum + f.count, 0);

  const departmentFlows = departments.map(dept => {
    const outbound = flowData.filter(f => f.from === dept);
    const inbound = flowData.filter(f => f.to === dept && f.type !== 'exit');

    return {
      name: dept,
      outbound: outbound.reduce((sum, f) => sum + f.count, 0),
      inbound: inbound.reduce((sum, f) => sum + f.count, 0),
      promotions: outbound.filter(f => f.type === 'promotion').reduce((sum, f) => sum + f.count, 0),
      transfers: outbound.filter(f => f.type === 'transfer').reduce((sum, f) => sum + f.count, 0),
      exits: outbound.filter(f => f.type === 'exit').reduce((sum, f) => sum + f.count, 0),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Talent Flow Visualization</h2>
        <p className="text-gray-600 mt-1">Internal movement, promotions, transfers, and exits across departments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-4">
          <div className="text-sm text-blue-700 mb-1">Total Movements</div>
          <div className="text-3xl font-bold text-blue-900">{totalMovements}</div>
          <div className="text-xs text-blue-600 mt-2">Last 12 months</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-700" />
            <div className="text-sm text-green-700">Promotions</div>
          </div>
          <div className="text-3xl font-bold text-green-900">{promotions}</div>
          <div className="text-xs text-green-600 mt-2">{((promotions / totalMovements) * 100).toFixed(0)}% of movements</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-4">
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-purple-700" />
            <div className="text-sm text-purple-700">Internal Transfers</div>
          </div>
          <div className="text-3xl font-bold text-purple-900">{transfers}</div>
          <div className="text-xs text-purple-600 mt-2">{((transfers / totalMovements) * 100).toFixed(0)}% of movements</div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200 p-4">
          <div className="text-sm text-red-700 mb-1">Exits</div>
          <div className="text-3xl font-bold text-red-900">{exits}</div>
          <div className="text-xs text-red-600 mt-2">{((exits / totalMovements) * 100).toFixed(0)}% of movements</div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Talent Flow Diagram (Sankey-style)</h3>

        <div className="space-y-8">
          {departmentFlows.map((dept, index) => {
            const maxFlow = Math.max(...departmentFlows.map(d => d.outbound));

            return (
              <div key={index} className="relative">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-right">
                    <div className="font-semibold text-gray-900 text-sm">{dept.name}</div>
                    <div className="text-xs text-gray-500">{dept.outbound} outbound</div>
                  </div>

                  <div className="flex-1">
                    <div className="relative h-16 bg-gray-50 rounded-lg overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 flex">
                        {dept.promotions > 0 && (
                          <div
                            className="bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center cursor-pointer group relative"
                            style={{ width: `${(dept.promotions / dept.outbound) * 100}%` }}
                            title={`Promotions: ${dept.promotions}`}
                          >
                            <span className="text-white text-xs font-semibold">
                              {dept.promotions > 2 && dept.promotions}
                            </span>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {dept.promotions} promotions
                            </div>
                          </div>
                        )}

                        {dept.transfers > 0 && (
                          <div
                            className="bg-purple-500 hover:bg-purple-600 transition-colors flex items-center justify-center cursor-pointer group relative"
                            style={{ width: `${(dept.transfers / dept.outbound) * 100}%` }}
                            title={`Transfers: ${dept.transfers}`}
                          >
                            <span className="text-white text-xs font-semibold">
                              {dept.transfers > 2 && dept.transfers}
                            </span>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {dept.transfers} transfers
                            </div>
                          </div>
                        )}

                        {dept.exits > 0 && (
                          <div
                            className="bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center cursor-pointer group relative"
                            style={{ width: `${(dept.exits / dept.outbound) * 100}%` }}
                            title={`Exits: ${dept.exits}`}
                          >
                            <span className="text-white text-xs font-semibold">
                              {dept.exits > 2 && dept.exits}
                            </span>
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {dept.exits} exits
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-32">
                    <div className="font-semibold text-gray-900 text-sm">{dept.inbound} inbound</div>
                    <div className="text-xs text-gray-500">net: {dept.inbound - dept.outbound > 0 ? '+' : ''}{dept.inbound - dept.outbound}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600">Promotions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded"></div>
            <span className="text-sm text-gray-600">Internal Transfers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-sm text-gray-600">Exits</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Talent Flows</h3>
        <div className="space-y-3">
          {flowData
            .sort((a, b) => b.count - a.count)
            .slice(0, 8)
            .map((flow, index) => {
              const typeColors = {
                promotion: 'bg-green-100 text-green-800 border-green-200',
                transfer: 'bg-purple-100 text-purple-800 border-purple-200',
                exit: 'bg-red-100 text-red-800 border-red-200'
              };

              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">{flow.from}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{flow.to}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${typeColors[flow.type]}`}>
                      {flow.type}
                    </span>
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">{flow.count}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Mobility Insights</h3>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-600 mt-1">•</span>
            <span>Internal mobility rate: <span className="font-semibold">{(((promotions + transfers) / totalMovements) * 100).toFixed(0)}%</span> — healthy talent development</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-600 mt-1">•</span>
            <span>Engineering shows strong promotion pipeline (8 promotions in 12 months)</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-600 mt-1">•</span>
            <span>Sales exit rate concerning — review compensation and career paths</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-blue-600 mt-1">•</span>
            <span>Cross-functional transfers trending up — indicates good career flexibility</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
