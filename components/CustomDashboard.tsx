import React, { useMemo, useState } from 'react';
import { ChartConfig, CustomDashboardConfig } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { ChartRenderer } from './ChartRenderer';
import { Plus, Pencil, Trash2, Upload, Download, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { ChartEditor } from './ChartEditor';

interface CustomDashboardProps {
  onBack: () => void;
}

/**
 * CustomDashboard
 * 自定义报表页面：编辑头部标题/副标题/日期，添加与管理图表，持久化本地配置。
 */
export const CustomDashboard: React.FC<CustomDashboardProps> = ({ onBack }) => {
  const [config, setConfig] = useLocalStorage<CustomDashboardConfig>('customDashboardConfig', {
    header: { title: '自定义报表', subtitle: '可视化展示', date: '', format: 'YYYY-MM-DD', showDate: true },
    charts: []
  });

  const [editing, setEditing] = useState<ChartConfig | null>(null);

  const updateHeader = (updates: Partial<CustomDashboardConfig['header']>) => {
    setConfig({ ...config, header: { ...config.header, ...updates } });
  };

  const addChart = () => setEditing({ id: '', type: 'bar', title: '', data: [], options: { showLegend: true, showLabel: true } });

  const editChart = (id: string) => {
    const target = config.charts.find(c => c.id === id) || null;
    setEditing(target);
  };

  const deleteChart = (id: string) => {
    setConfig({ ...config, charts: config.charts.filter(c => c.id !== id) });
  };

  const moveChart = (id: string, dir: 'up' | 'down') => {
    const idx = config.charts.findIndex(c => c.id === id);
    if (idx < 0) return;
    const next = [...config.charts];
    const swapWith = dir === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    setConfig({ ...config, charts: next });
  };

  const saveEditing = (chart: ChartConfig) => {
    let charts = [...config.charts];
    const idx = charts.findIndex(c => c.id === chart.id);
    if (idx >= 0) charts[idx] = chart; else charts.push(chart);
    setConfig({ ...config, charts });
    setEditing(null);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'custom-dashboard.json'; a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || !Array.isArray(data.charts) || !data.header) throw new Error('结构不合法');
      setConfig(data);
    } catch (e) {
      alert('导入失败：JSON 格式或结构不正确');
    }
  };

  const clearAll = () => {
    setConfig({ header: { title: '', subtitle: '', date: '', format: 'YYYY-MM-DD', showDate: true }, charts: [] });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between mb-4">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100" onClick={onBack}><ArrowLeft size={18}/>返回</button>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 text-white" onClick={addChart}><Plus size={16}/>新增图表</button>
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 cursor-pointer">
              <Upload size={16}/>导入JSON
              <input type="file" accept="application/json" className="hidden" onChange={e => e.target.files?.[0] && importJSON(e.target.files[0])} />
            </label>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 text-gray-700" onClick={exportJSON}><Download size={16}/>导出JSON</button>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600" onClick={clearAll}><Trash2 size={16}/>清空</button>
          </div>
        </div>

        {/* 头部编辑区 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">标题</label>
              <input className="w-full border rounded-lg p-2" value={config.header.title} onChange={e => updateHeader({ title: e.target.value })} placeholder="请输入标题" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">副标题</label>
              <input className="w-full border rounded-lg p-2" value={config.header.subtitle || ''} onChange={e => updateHeader({ subtitle: e.target.value })} placeholder="请输入副标题" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">日期</label>
                <input type="date" className="w-full border rounded-lg p-2" value={config.header.date || ''} onChange={e => updateHeader({ date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">格式</label>
                <select className="w-full border rounded-lg p-2" value={config.header.format || 'YYYY-MM-DD'} onChange={e => updateHeader({ format: e.target.value })}>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="YYYY年MM月DD日">YYYY年MM月DD日</option>
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-sm mt-2"><input type="checkbox" checked={!!config.header.showDate} onChange={e => updateHeader({ showDate: e.target.checked })}/>显示日期</label>
            </div>
          </div>

          {/* 头部预览 */}
          <div className="mt-4">
            <h1 className="text-2xl font-bold">{config.header.title || '未命名标题'}</h1>
            <div className="text-gray-500">{config.header.subtitle}</div>
            {config.header.showDate && (
              <div className="text-sm text-gray-400 mt-1">{(config.header.format === 'YYYY年MM月DD日' && config.header.date) ? new Date(config.header.date).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '年').replace(/年(\d{2})年/, '年$1').replace(/年/g, '年').replace(/(\d{2})$/, '$1日') : (config.header.date || '')}</div>
            )}
          </div>
        </div>

        {/* 图表列表区 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {config.charts.map(chart => (
            <div key={chart.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">{chart.title || '未命名图表'}</h3>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded-lg" title="上移" onClick={() => moveChart(chart.id, 'up')}><ArrowUp size={16}/></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg" title="下移" onClick={() => moveChart(chart.id, 'down')}><ArrowDown size={16}/></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg" title="编辑" onClick={() => editChart(chart.id)}><Pencil size={16}/></button>
                  <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="删除" onClick={() => deleteChart(chart.id)}><Trash2 size={16}/></button>
                </div>
              </div>
              <ChartRenderer config={chart} />
            </div>
          ))}
        </div>

        {editing && (
          <ChartEditor initial={editing} onSave={saveEditing} onCancel={() => setEditing(null)} />
        )}
      </div>
    </div>
  );
};
