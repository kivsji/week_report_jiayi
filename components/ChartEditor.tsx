import React, { useMemo, useState } from 'react';
import { ChartConfig, ChartType, PieDataItem, BarDataItem, LineSeries } from '../types';
import { X } from 'lucide-react';

interface ChartEditorProps {
  initial?: ChartConfig;
  onSave: (config: ChartConfig) => void;
  onCancel: () => void;
}

/**
 * ChartEditor
 * 图表编辑器：根据图表类型提供不同的动态录入表单，支持新增/编辑。
 */
export const ChartEditor: React.FC<ChartEditorProps> = ({ initial, onSave, onCancel }) => {
  const [type, setType] = useState<ChartType>(initial?.type || 'bar');
  const [title, setTitle] = useState<string>(initial?.title || '');
  const [options, setOptions] = useState(initial?.options || { showLegend: true, showLabel: true, showPercent: true });

  const [barData, setBarData] = useState<BarDataItem[]>(() => (initial?.type === 'bar' ? (initial?.data as BarDataItem[]) : []));
  const [pieData, setPieData] = useState<PieDataItem[]>(() => (initial?.type === 'pie' ? (initial?.data as PieDataItem[]) : []));
  const [lineSeries, setLineSeries] = useState<LineSeries[]>(() => (initial?.type === 'line' ? (initial?.data as LineSeries[]) : [{ name: '系列1', points: [] }]));

  const addBarRow = () => setBarData([...barData, { category: '', value: 0 }]);
  const addPieRow = () => setPieData([...pieData, { name: '', value: 0 }]);
  const addLineSeries = () => setLineSeries([...lineSeries, { name: `系列${lineSeries.length + 1}`, points: [] }]);

  const addLinePoint = (seriesIdx: number) => {
    const next = [...lineSeries];
    next[seriesIdx].points.push({ x: '', y: 0 });
    setLineSeries(next);
  };

  const removeLinePoint = (seriesIdx: number, pointIdx: number) => {
    const next = [...lineSeries];
    next[seriesIdx].points.splice(pointIdx, 1);
    setLineSeries(next);
  };

  const removeLineSeries = (seriesIdx: number) => {
    const next = [...lineSeries];
    next.splice(seriesIdx, 1);
    setLineSeries(next);
  };

  const save = () => {
    const id = initial?.id || `${Date.now()}`;
    const data = type === 'bar' ? barData : type === 'pie' ? pieData : lineSeries;
    onSave({ id, type, title, data, options });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">编辑图表</h2>
          <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={onCancel}><X size={18} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">图表类型</label>
            <select className="w-full border rounded-lg p-2" value={type} onChange={e => setType(e.target.value as ChartType)}>
              <option value="bar">柱状图</option>
              <option value="pie">饼状图</option>
              <option value="line">折线图</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">图表标题</label>
            <input className="w-full border rounded-lg p-2" value={title} onChange={e => setTitle(e.target.value)} placeholder="请输入图表标题" />
          </div>
        </div>

        {/* 选项 */}
        <div className="flex items-center gap-4 mb-4">
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!options.showLegend} onChange={e => setOptions({ ...options, showLegend: e.target.checked })} />显示图例</label>
          <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!options.showLabel} onChange={e => setOptions({ ...options, showLabel: e.target.checked })} />显示标签</label>
          {type === 'pie' && (
            <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!options.showPercent} onChange={e => setOptions({ ...options, showPercent: e.target.checked })} />显示百分比标签</label>
          )}
        </div>

        {/* 柱状图录入 */}
        {type === 'bar' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">数据点</h3>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm" onClick={addBarRow}>新增一行</button>
            </div>
            {barData.map((row, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-3">
                <input className="border rounded-lg p-2" placeholder="类别" value={row.category} onChange={e => {
                  const next = [...barData]; next[idx].category = e.target.value; setBarData(next);
                }} />
                <input className="border rounded-lg p-2" type="number" placeholder="值" value={row.value} onChange={e => {
                  const next = [...barData]; next[idx].value = Number(e.target.value); setBarData(next);
                }} />
              </div>
            ))}
          </div>
        )}

        {/* 饼状图录入 */}
        {type === 'pie' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">分片数据</h3>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm" onClick={addPieRow}>新增分片</button>
            </div>
            {pieData.map((row, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-3">
                <input className="border rounded-lg p-2" placeholder="名称" value={row.name} onChange={e => {
                  const next = [...pieData]; next[idx].name = e.target.value; setPieData(next);
                }} />
                <input className="border rounded-lg p-2" type="number" placeholder="值" value={row.value} onChange={e => {
                  const next = [...pieData]; next[idx].value = Number(e.target.value); setPieData(next);
                }} />
              </div>
            ))}
          </div>
        )}

        {/* 折线图录入 */}
        {type === 'line' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">序列</h3>
              <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm" onClick={addLineSeries}>新增序列</button>
            </div>
            {lineSeries.map((s, sIdx) => (
              <div key={sIdx} className="border rounded-lg p-3">
                <div className="flex items-center gap-3 mb-3">
                  <input className="border rounded-lg p-2 flex-1" placeholder="序列名称" value={s.name} onChange={e => {
                    const next = [...lineSeries]; next[sIdx].name = e.target.value; setLineSeries(next);
                  }} />
                  <button className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm" onClick={() => removeLineSeries(sIdx)}>删除序列</button>
                  <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm" onClick={() => addLinePoint(sIdx)}>新增点</button>
                </div>
                <div className="space-y-2">
                  {s.points.map((p, pIdx) => (
                    <div key={pIdx} className="grid grid-cols-2 gap-3">
                      <input className="border rounded-lg p-2" placeholder="x" value={p.x} onChange={e => {
                        const next = [...lineSeries]; next[sIdx].points[pIdx].x = e.target.value; setLineSeries(next);
                      }} />
                      <div className="flex items-center gap-2">
                        <input className="border rounded-lg p-2 flex-1" type="number" placeholder="y" value={p.y} onChange={e => {
                          const next = [...lineSeries]; next[sIdx].points[pIdx].y = Number(e.target.value); setLineSeries(next);
                        }} />
                        <button className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm" onClick={() => removeLinePoint(sIdx, pIdx)}>删除</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button className="px-4 py-2 rounded-lg border" onClick={onCancel}>取消</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white" onClick={save}>保存</button>
        </div>
      </div>
    </div>
  );
};
