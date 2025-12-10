
import React, { useState, useMemo } from 'react';
import { DashboardData } from '../types';
import { MetricsCharts } from './MetricsCharts';
import { CheckCircle, AlertCircle, TrendingUp, Building2, ClipboardList, Calendar, ArrowLeft } from 'lucide-react';
import { calculateWeeklyMetrics } from '../services/excelService';

interface DashboardProps {
  data: DashboardData;
  setData: React.Dispatch<React.SetStateAction<DashboardData | null>>;
  onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, setData, onBack }) => {
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // State for manual inputs
  // Initialize from data if exists, otherwise empty
  const [feedbackInput, setFeedbackInput] = useState(data.feedbackSummary || '');
  const [workInput, setWorkInput] = useState(data.weeklyWorkSummary || '');

  // Inline edit state for feedback counts
  const [editingCountKey, setEditingCountKey] = useState<null | 'total' | 'completed' | 'pending'>(null);
  const [tempCountValue, setTempCountValue] = useState<string>('');

  const { metrics, rows } = data;

  // Recalculate weekly metrics when date or rows change
  const weeklyMetrics = useMemo(() => {
    const date = new Date(selectedDateStr);
    if (isNaN(date.getTime())) return metrics.weekly;
    return calculateWeeklyMetrics(rows, date);
  }, [rows, selectedDateStr, metrics.weekly]);

  // Merge static metrics with dynamic weekly metrics
  const displayMetrics = {
    ...metrics,
    weekly: weeklyMetrics
  };

  /**
   * 计算所选日期所在周的起止范围，并格式化为 “YYYY年-MM月-DD日 到 YYYY年-MM月-DD日”
   */
  const weekRangeLabel = useMemo(() => {
    const d = new Date(selectedDateStr);
    if (isNaN(d.getTime())) return '';
    const day = d.getDay();
    const diffToMonday = (day + 6) % 7;
    const start = new Date(d);
    start.setDate(d.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fmt = (dt: Date) => `${dt.getFullYear()}年-${pad(dt.getMonth()+1)}月-${pad(dt.getDate())}日`;
    return `${fmt(start)} 到 ${fmt(end)}`;
  }, [selectedDateStr]);

  const handleWorkChange = (val: string) => {
    setWorkInput(val);
    setData(prev => prev ? ({ ...prev, weeklyWorkSummary: val }) : null);
  };

  const handleFeedbackChange = (val: string) => {
    setFeedbackInput(val);
    setData(prev => prev ? ({ ...prev, feedbackSummary: val }) : null);
  };

  /**
   * 启动数量编辑（总计/已完成/待解决）
   */
  const startEditCount = (key: 'total' | 'completed' | 'pending', currentValue: number) => {
    setEditingCountKey(key);
    setTempCountValue(String(currentValue ?? 0));
  };

  /**
   * 提交数量编辑并隐藏输入框（失焦或回车）
   */
  const commitEditCount = () => {
    if (!editingCountKey) return;
    const parsed = Number.parseInt(tempCountValue, 10);
    const safeValue = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    setData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        metrics: {
          ...prev.metrics,
          feedbackStats: {
            ...prev.metrics.feedbackStats,
            [editingCountKey]: safeValue,
          }
        }
      };
    });
    setEditingCountKey(null);
  };

  /**
   * 取消编辑（例如按下 Escape），仅隐藏输入框不修改数值
   */
  const cancelEditCount = () => {
    setEditingCountKey(null);
  };

  /**
   * 计算“今日已拜访”数据（取所选日期当天），包含总数与 A/C/商业 分布
   */
  const todayMetrics = useMemo(() => {
    const target = new Date(selectedDateStr);
    if (isNaN(target.getTime())) {
      return { total: 0, breakdown: { "A栋": 0, "C栋": 0, "商业": 0 } } as const;
    }
    const isSameDay = (a: Date, b: Date) => (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
    const parseRowDate = (dateStr: string): Date | null => {
      try {
        const cleaned = dateStr?.toString().replace(/：/g, ':').replace(/\./g, '-').trim();
        const d = new Date(cleaned);
        return isNaN(d.getTime()) ? null : d;
      } catch {
        return null;
      }
    };
    let total = 0;
    const counts: Record<'A栋'|'C栋'|'商业', number> = { 'A栋': 0, 'C栋': 0, '商业': 0 };
    rows.forEach(row => {
      const d = parseRowDate(row['拜访时间']);
      if (d && isSameDay(d, target)) {
        let bldg = '其他';
        const rawBldg = (row['楼栋'] || '').toString().toUpperCase();
        if (rawBldg.includes('A')) bldg = 'A栋';
        else if (rawBldg.includes('C')) bldg = 'C栋';
        else if (rawBldg.includes('商')) bldg = '商业';
        total++;
        if (bldg in counts) counts[bldg as 'A栋'|'C栋'|'商业']++;
      }
    });
    return { total, breakdown: counts } as const;
  }, [rows, selectedDateStr]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-20">
      <div className="flex items-center justify-between mb-4">
        <button className="px-3 py-2 rounded-lg hover:bg-gray-100 text-sm inline-flex items-center gap-1" onClick={onBack}><ArrowLeft className="h-4 w-4"/>返回</button>
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <Calendar className="h-5 w-5 text-gray-400" />
          <input 
            type="date" 
            value={selectedDateStr}
            onChange={(e) => setSelectedDateStr(e.target.value)}
            className="text-sm border-none focus:ring-0 text-gray-700 font-medium bg-transparent"
          />
        </div>
      </div>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-gray-900">物业拜访数据看板</h1>
          </div>
          <p className="text-gray-500 mt-1">本周工作汇报与数据汇总</p>
        </div>
        <div className="flex items-center">
          <span className="text-xs text-gray-400 mr-2">统计周期:</span>
          <span className="text-lg font-bold text-indigo-600">{weekRangeLabel}</span>
        </div>
      </div>

      {/* Row 1: Visit Metrics (含今日与本周统计) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Metric 1: Total Sample Base */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">总样本量</h3>
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-gray-900">{displayMetrics.totalTarget}</span>
              <span className="text-sm text-gray-500">户</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
             <p className="text-xs text-gray-400">总计包含 A栋、C栋 及 商业样本</p>
          </div>
        </div>

        {/* Metric 2: Today Visits */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1 bg-orange-500"></div>
          <div>
             <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">今日已拜访</h3>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-gray-900">{todayMetrics.total}</span>
              <span className="text-sm text-gray-500">户</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-gray-50">
             <div className="text-center">
               <span className="block text-xs text-gray-400">A栋</span>
               <span className="font-semibold text-gray-800">{todayMetrics.breakdown['A栋']}</span>
             </div>
             <div className="text-center border-l border-gray-100">
               <span className="block text-xs text-gray-400">C栋</span>
               <span className="font-semibold text-gray-800">{todayMetrics.breakdown['C栋']}</span>
             </div>
             <div className="text-center border-l border-gray-100">
               <span className="block text-xs text-gray-400">商业</span>
               <span className="font-semibold text-gray-800">{todayMetrics.breakdown['商业']}</span>
             </div>
          </div>
        </div>

        {/* Metric 3: Weekly Visits */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1 bg-green-500"></div>
          <div>
             <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">本周已拜访</h3>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-gray-900">{displayMetrics.weekly.total}</span>
              <span className="text-sm text-gray-500">户</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-gray-50">
             <div className="text-center">
               <span className="block text-xs text-gray-400">A栋</span>
               <span className="font-semibold text-gray-800">{displayMetrics.weekly.breakdown['A栋']}</span>
             </div>
             <div className="text-center border-l border-gray-100">
               <span className="block text-xs text-gray-400">C栋</span>
               <span className="font-semibold text-gray-800">{displayMetrics.weekly.breakdown['C栋']}</span>
             </div>
             <div className="text-center border-l border-gray-100">
               <span className="block text-xs text-gray-400">商业</span>
               <span className="font-semibold text-gray-800">{displayMetrics.weekly.breakdown['商业']}</span>
             </div>
          </div>
          <div className="mt-2 text-right">
             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
               占比 {displayMetrics.weekly.percentage}%
             </span>
          </div>
        </div>

        {/* Metric 3: Cumulative Visits */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
           <div className="absolute right-0 top-0 h-full w-1 bg-indigo-500"></div>
           <div>
             <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-500 font-medium text-sm uppercase tracking-wider">累计已拜访</h3>
              <CheckCircle className="h-5 w-5 text-indigo-500" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-gray-900">{displayMetrics.cumulative.total}</span>
              <span className="text-sm text-gray-500">户</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 pt-4 border-t border-gray-50">
             <div className="text-center">
               <span className="block text-xs text-gray-400">A栋</span>
               <span className="font-semibold text-gray-800">{displayMetrics.cumulative.breakdown['A栋']}</span>
             </div>
             <div className="text-center border-l border-gray-100">
               <span className="block text-xs text-gray-400">C栋</span>
               <span className="font-semibold text-gray-800">{displayMetrics.cumulative.breakdown['C栋']}</span>
             </div>
             <div className="text-center border-l border-gray-100">
               <span className="block text-xs text-gray-400">商业</span>
               <span className="font-semibold text-gray-800">{displayMetrics.cumulative.breakdown['商业']}</span>
             </div>
          </div>
           <div className="mt-2 text-right">
             <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
               占比 {displayMetrics.cumulative.percentage}%
             </span>
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Visualization) */}
      <MetricsCharts metrics={displayMetrics} />

      {/* Row 3: Detailed Area Analysis (Req 3 Table) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
           <h3 className="font-bold text-gray-900">各类客情面积统计详情</h3>
           <span className="text-xs text-gray-500">总面积样本: {displayMetrics.totalAreaTarget.toLocaleString()} ㎡</span>
         </div>
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">客情类别 (业主态度)</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">统计面积 (㎡)</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">占比总面积</th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">可视化</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {displayMetrics.areaStats.map((stat, idx) => (
                 <tr key={idx}>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{stat.category}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.area.toLocaleString()}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{stat.percentage}%</td>
                   <td className="px-6 py-4 whitespace-nowrap w-1/3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${stat.percentage}%` }}></div>
                      </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>

      {/* Row 4: Manual Inputs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Feedback / Major Issues (Manual Input) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-orange-50">
             <h3 className="font-bold text-orange-900 flex items-center gap-2">
               <AlertCircle className="h-5 w-5" />
               反馈内容主要事项
             </h3>
             <div className="flex gap-2">
              <span className="px-2 py-1 bg-white text-gray-600 border border-gray-200 text-xs rounded-full">
                总计: {
                  editingCountKey === 'total' ? (
                    <input
                      type="number"
                      value={tempCountValue}
                      autoFocus
                      onChange={(e) => setTempCountValue(e.target.value)}
                      onBlur={commitEditCount}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEditCount();
                        if (e.key === 'Escape') cancelEditCount();
                      }}
                      className="w-16 ml-1 text-gray-800 border border-gray-300 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <button
                      type="button"
                      className="ml-1 underline decoration-dashed decoration-gray-400 hover:text-orange-700"
                      onClick={() => startEditCount('total', displayMetrics.feedbackStats.total)}
                      title="点击编辑总计"
                    >
                      {displayMetrics.feedbackStats.total}
                    </button>
                  )
                }
              </span>
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                已完成: {
                  editingCountKey === 'completed' ? (
                    <input
                      type="number"
                      value={tempCountValue}
                      autoFocus
                      onChange={(e) => setTempCountValue(e.target.value)}
                      onBlur={commitEditCount}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEditCount();
                        if (e.key === 'Escape') cancelEditCount();
                      }}
                      className="w-16 ml-1 text-green-900 border border-green-300 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-green-500 focus:border-green-500"
                    />
                  ) : (
                    <button
                      type="button"
                      className="ml-1 underline decoration-dashed decoration-green-400 hover:text-green-800"
                      onClick={() => startEditCount('completed', displayMetrics.feedbackStats.completed)}
                      title="点击编辑已完成"
                    >
                      {displayMetrics.feedbackStats.completed}
                    </button>
                  )
                }
              </span>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                待解决: {
                  editingCountKey === 'pending' ? (
                    <input
                      type="number"
                      value={tempCountValue}
                      autoFocus
                      onChange={(e) => setTempCountValue(e.target.value)}
                      onBlur={commitEditCount}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitEditCount();
                        if (e.key === 'Escape') cancelEditCount();
                      }}
                      className="w-16 ml-1 text-orange-900 border border-orange-300 rounded px-1 py-0.5 text-xs focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                    />
                  ) : (
                    <button
                      type="button"
                      className="ml-1 underline decoration-dashed decoration-orange-400 hover:text-orange-800"
                      onClick={() => startEditCount('pending', displayMetrics.feedbackStats.pending)}
                      title="点击编辑待解决"
                    >
                      {displayMetrics.feedbackStats.pending}
                    </button>
                  )
                }
              </span>
              </div>
          </div>
          <div className="flex-1 p-6 flex flex-col">
             <p className="text-xs text-gray-500 mb-2">
               请根据上方统计数据，手动录入本周主要反馈事项总结。
             </p>
             <textarea
               className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm min-h-[300px]"
               placeholder="在此输入主要事项内容..."
               value={feedbackInput}
               onChange={(e) => handleFeedbackChange(e.target.value)}
             ></textarea>
          </div>
        </div>

        {/* Work Summary (Manual Input) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
           <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50">
             <h3 className="font-bold text-indigo-900 flex items-center gap-2">
               <ClipboardList className="h-5 w-5" />
               本周工作与提升方案
             </h3>
           </div>
           
           <div className="flex-1 p-6 flex flex-col">
             <p className="text-xs text-gray-500 mb-2">
               请输入本周提升方案专项、已完成工作及待跟进情况。
             </p>
             <textarea
               className="flex-1 w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm min-h-[300px]"
               placeholder="1. 提升方案A - 已完成&#10;2. 专项工作B - 待跟进..."
               value={workInput}
               onChange={(e) => handleWorkChange(e.target.value)}
             ></textarea>
           </div>
        </div>
      </div>

    </div>
  );
};
