import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList,
  LineChart,
  Line
} from 'recharts';
import { ChartConfig, ChartType, PieDataItem, BarDataItem, LineSeries } from '../types';

const DEFAULT_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1'];

/**
 * ChartRenderer
 * 统一渲染不同类型的图表，根据 ChartConfig 输出对应的 Recharts 组件。
 */
export const ChartRenderer: React.FC<{ config: ChartConfig }> = ({ config }) => {
  const colors = config.options?.colors || DEFAULT_COLORS;

  if (config.type === 'pie') {
    const data = config.data as PieDataItem[];
    return (
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              label={config.options?.showPercent
                ? ({ percent }) => `${Math.round((percent || 0) * 100)}%`
                : (config.options?.showLabel ? ({ value }) => String(value) : undefined)
              }
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [String(value), name]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
            />
            {config.options?.showLegend && (
              <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (config.type === 'bar') {
    const data = config.data as BarDataItem[];
    return (
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis type="number" hide />
            <YAxis dataKey="category" type="category" width={40} tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'transparent' }} />
            <Bar dataKey="value" fill={colors[0]} radius={[0, 4, 4, 0]} barSize={24}>
              {config.options?.showLabel && (
                <LabelList dataKey="value" position="right" style={{ fontSize: '12px', fill: '#666' }} />
              )}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (config.type === 'line') {
    const series = config.data as LineSeries[];
    // 将多序列整合为以 x 为类目的数据，适配 Recharts 的 LineChart 简单用法
    const xValues = Array.from(new Set(series.flatMap(s => s.points.map(p => p.x))));
    const combined = xValues.map(x => {
      const row: any = { x };
      series.forEach(s => {
        const pt = s.points.find(p => p.x === x);
        row[s.name] = pt ? pt.y : 0;
      });
      return row;
    });

    return (
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combined} margin={{ left: 10, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="x" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            {series.map((s, idx) => (
              <Line key={s.name} type="monotone" dataKey={s.name} stroke={colors[idx % colors.length]} dot={false} />
            ))}
            {config.options?.showLegend && (
              <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
};
