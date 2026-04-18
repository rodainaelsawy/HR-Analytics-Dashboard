'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import SparklineChart from './SparklineChart';

type KPICardProps = {
  title: string;
  value: string | number;
  change?: number;
  sparklineData?: number[];
  color?: string;
};

export default function KPICard({ title, value, change, sparklineData, color = '#3B82F6' }: KPICardProps) {
  const isPositive = change !== undefined && change >= 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="flex items-baseline gap-3">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <SparklineChart data={sparklineData} color={color} />
      )}
    </div>
  );
}
