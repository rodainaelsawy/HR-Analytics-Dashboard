'use client';

import { BarChart3, TrendingUp, Users } from 'lucide-react';

type NavigationProps = {
  activeModule: string;
  onModuleChange: (module: string) => void;
};

export default function Navigation({ activeModule, onModuleChange }: NavigationProps) {
  const modules = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'workforce', name: 'Workforce Intelligence', icon: Users },
    { id: 'performance', name: 'Performance & Productivity', icon: TrendingUp },
    { id: 'talent', name: 'Talent Flow', icon: Users },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Workforce Insights</h1>
          </div>
          <div className="flex gap-1">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.id}
                  onClick={() => onModuleChange(module.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeModule === module.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{module.name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
