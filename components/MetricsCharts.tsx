
import React from 'react';
import { 
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList, Tooltip 
} from 'recharts';
import { MetricSummary } from '../types';

interface MetricsChartsProps {
  metrics: MetricSummary;
}

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1'];

export const MetricsCharts: React.FC<MetricsChartsProps> = ({ metrics }) => {
  
  // Weekly Building Breakdown
  const weeklyData = [
    { name: 'A栋', count: metrics.weekly.breakdown['A栋'] },
    { name: 'C栋', count: metrics.weekly.breakdown['C栋'] },
    { name: '商业', count: metrics.weekly.breakdown['商业'] },
  ];

  // Cumulative Building Breakdown
  const cumulativeData = [
    { name: 'A栋', count: metrics.cumulative.breakdown['A栋'] },
    { name: 'C栋', count: metrics.cumulative.breakdown['C栋'] },
    { name: '商业', count: metrics.cumulative.breakdown['商业'] },
  ];

  // 移除客情面积占比饼图（周报仅保留拜访分布图表）

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Weekly Visits Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">本周拜访分布 ({metrics.weekly.weekLabel})</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={40} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24}>
                 <LabelList dataKey="count" position="right" style={{ fontSize: '12px', fill: '#666' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulative Visits Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">累计拜访分布</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cumulativeData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={40} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="count" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={24}>
                 <LabelList dataKey="count" position="right" style={{ fontSize: '12px', fill: '#666' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      
    </div>
  );
};
