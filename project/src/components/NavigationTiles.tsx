import {
  Users,
  TrendingUp,
  UserPlus,
  Scale,
  GraduationCap,
  UserX,
  ArrowRightLeft,
  BarChart3
} from 'lucide-react';

type NavigationTilesProps = {
  onNavigate: (view: string) => void;
};

export default function NavigationTiles({ onNavigate }: NavigationTilesProps) {
  const tiles = [
    {
      id: 'workforce',
      title: 'Workforce Stability',
      description: 'Headcount trends, turnover analysis, and organizational size metrics',
      icon: Users,
      color: 'blue'
    },
    {
      id: 'performance',
      title: 'Performance & Productivity',
      description: 'Performance ratings, 9-box analysis, and burnout detection',
      icon: TrendingUp,
      color: 'green'
    },
    {
      id: 'recruitment',
      title: 'Recruitment Analytics',
      description: 'Hiring funnel, time to hire, and cost per hire metrics',
      icon: UserPlus,
      color: 'purple'
    },
    {
      id: 'diversity',
      title: 'Diversity & Pay Equity',
      description: 'Workforce diversity composition and pay equity analysis',
      icon: Scale,
      color: 'pink'
    },
    {
      id: 'training',
      title: 'Talent Development',
      description: 'Training completion rates, ROI, and skill development tracking',
      icon: GraduationCap,
      color: 'yellow'
    },
    {
      id: 'attrition',
      title: 'Attrition & Exit Insights',
      description: 'Exit reasons, attrition patterns, and retention analysis',
      icon: UserX,
      color: 'red'
    },
    {
      id: 'talentflow',
      title: 'Talent Flow',
      description: 'Employee movement across departments and promotion tracking',
      icon: ArrowRightLeft,
      color: 'indigo'
    },
    {
      id: 'drilldown',
      title: 'Organizational Drilldown',
      description: 'Department-level analysis and team performance metrics',
      icon: BarChart3,
      color: 'gray'
    }
  ];

  const colorMap: Record<string, { bg: string; text: string; hover: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-900', hover: 'hover:bg-blue-100', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-900', hover: 'hover:bg-green-100', icon: 'text-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-900', hover: 'hover:bg-purple-100', icon: 'text-purple-600' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-900', hover: 'hover:bg-pink-100', icon: 'text-pink-600' },
    yellow: { bg: 'bg-amber-50', text: 'text-amber-900', hover: 'hover:bg-amber-100', icon: 'text-amber-600' },
    red: { bg: 'bg-red-50', text: 'text-red-900', hover: 'hover:bg-red-100', icon: 'text-red-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-900', hover: 'hover:bg-indigo-100', icon: 'text-indigo-600' },
    gray: { bg: 'bg-gray-50', text: 'text-gray-900', hover: 'hover:bg-gray-100', icon: 'text-gray-600' }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Detailed Analytics Dashboards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const colors = colorMap[tile.color];

          return (
            <button
              key={tile.id}
              onClick={() => onNavigate(tile.id)}
              className={`${colors.bg} ${colors.hover} border-2 border-transparent hover:border-${tile.color}-200 rounded-lg p-6 text-left transition-all group`}
            >
              <div className={`inline-flex p-3 ${colors.icon} bg-white rounded-lg mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className={`text-lg font-semibold ${colors.text} mb-2`}>{tile.title}</h3>
              <p className="text-sm text-gray-600">{tile.description}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
