
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
  
  // Weekly Building Breakdown (Area)
  const weeklyData = [
    { name: 'A栋', area: metrics.weekly.areaBreakdown['A栋'] },
    { name: 'C栋', area: metrics.weekly.areaBreakdown['C栋'] },
    { name: '商业', area: metrics.weekly.areaBreakdown['商业'] },
  ];

  // Cumulative Building Breakdown (Area)
  const cumulativeData = [
    { name: 'A栋', area: metrics.cumulative.areaBreakdown['A栋'] },
    { name: 'C栋', area: metrics.cumulative.areaBreakdown['C栋'] },
    { name: '商业', area: metrics.cumulative.areaBreakdown['商业'] },
  ];

  // Calculate totals and percentages
  const weeklyTotalAreaNum = weeklyData.reduce((sum, item) => sum + item.area, 0);
  const cumulativeTotalAreaNum = cumulativeData.reduce((sum, item) => sum + item.area, 0);

  const weeklyTotalArea = weeklyTotalAreaNum.toLocaleString();
  const cumulativeTotalArea = cumulativeTotalAreaNum.toLocaleString();

  const weeklyPct = metrics.totalAreaTarget ? ((weeklyTotalAreaNum / metrics.totalAreaTarget) * 100).toFixed(1) : '0.0';
  const cumulativePct = metrics.totalAreaTarget ? ((cumulativeTotalAreaNum / metrics.totalAreaTarget) * 100).toFixed(1) : '0.0';

  const totalAreaTargetStr = metrics.totalAreaTarget.toLocaleString();

  // 移除客情面积占比饼图（周报仅保留拜访分布图表）

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Weekly Visits Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col mb-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">本周拜访分布 (面积㎡)</h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">占比: {weeklyPct}%</span>
          </div>
          <div className="text-right">
             <span className="text-[10px] text-gray-400">计算公式: {weeklyTotalArea} / {totalAreaTargetStr} (总面积)</span>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={40} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => [`${value} ㎡`, '面积']} />
              <Bar dataKey="area" fill="#10B981" radius={[0, 4, 4, 0]} barSize={24}>
                 <LabelList dataKey="area" position="right" style={{ fontSize: '12px', fill: '#666' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cumulative Visits Chart */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col mb-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">累计拜访分布 (面积㎡)</h3>
            <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-full">占比: {cumulativePct}%</span>
          </div>
          <div className="text-right">
             <span className="text-[10px] text-gray-400">计算公式: {cumulativeTotalArea} / {totalAreaTargetStr} (总面积)</span>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cumulativeData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={40} tick={{fontSize: 12}} />
              <Tooltip cursor={{fill: 'transparent'}} formatter={(value) => [`${value} ㎡`, '面积']} />
              <Bar dataKey="area" fill="#4F46E5" radius={[0, 4, 4, 0]} barSize={24}>
                 <LabelList dataKey="area" position="right" style={{ fontSize: '12px', fill: '#666' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      
    </div>
  );
};
