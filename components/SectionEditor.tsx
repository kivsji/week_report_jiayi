import React, { useState } from 'react';
import { SectionConfig, SectionItem, SectionTag } from '../types';
import { X, ArrowUp, ArrowDown, Trash2, Plus } from 'lucide-react';

interface SectionEditorProps {
  initial?: SectionConfig;
  onSave: (config: SectionConfig) => void;
  onCancel: () => void;
}

/**
 * SectionEditor
 * 自定义报表模块编辑器：编辑标题、提示、标签（标题与颜色）与内容项，支持排序与删除。
 */
export const SectionEditor: React.FC<SectionEditorProps> = ({ initial, onSave, onCancel }) => {
  const [title, setTitle] = useState(initial?.title || '');
  const [hint, setHint] = useState(initial?.hint || '');
  const [tags, setTags] = useState<SectionTag[]>(initial?.tags || [
    { key: 'total', label: '总计', color: '#6366F1' },
    { key: 'done', label: '已完成', color: '#10B981' },
    { key: 'pending', label: '待解决', color: '#EF4444' }
  ]);
  const [items, setItems] = useState<SectionItem[]>(initial?.items || []);

  const addTag = () => setTags([...tags, { key: `tag${tags.length+1}`, label: '新标签', color: '#9CA3AF' }]);
  const removeTag = (idx: number) => { const next = [...tags]; next.splice(idx, 1); setTags(next); };
  const moveTag = (idx: number, dir: 'up'|'down') => {
    const swap = dir === 'up' ? idx - 1 : idx + 1; if (swap < 0 || swap >= tags.length) return;
    const next = [...tags]; [next[idx], next[swap]] = [next[swap], next[idx]]; setTags(next);
  };

  const addItem = () => setItems([...items, { id: `${Date.now()}-${Math.random()}`, content: '', status: undefined }]);
  const removeItem = (idx: number) => { const next = [...items]; next.splice(idx, 1); setItems(next); };
  const moveItem = (idx: number, dir: 'up'|'down') => {
    const swap = dir === 'up' ? idx - 1 : idx + 1; if (swap < 0 || swap >= items.length) return;
    const next = [...items]; [next[idx], next[swap]] = [next[swap], next[idx]]; setItems(next);
  };

  const isHexColor = (v: string) => /^#([0-9A-Fa-f]{6})$/.test(v);
  const keysUnique = () => new Set(tags.map(t => t.key)).size === tags.length;

  const save = () => {
    if (!keysUnique()) { alert('标签 key 必须唯一'); return; }
    if (tags.some(t => !isHexColor(t.color))) { alert('颜色必须是 #RRGGBB 格式'); return; }
    const id = initial?.id || `${Date.now()}`;
    onSave({ id, title, hint, tags, items });
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">编辑模块</h2>
          <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={onCancel}><X size={18}/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">标题</label>
            <input className="w-full border rounded-lg p-2" value={title} onChange={e=>setTitle(e.target.value)} placeholder="请输入模块标题"/>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">提示文案</label>
            <input className="w-full border rounded-lg p-2" value={hint} onChange={e=>setHint(e.target.value)} placeholder="请输入提示文案"/>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">状态标签</h3>
            <button className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm" onClick={addTag}><Plus size={16}/>新增标签</button>
          </div>
          <div className="space-y-2">
            {tags.map((t, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                <input className="border rounded-lg p-2" value={t.key} onChange={e=>{const next=[...tags]; next[idx].key=e.target.value; setTags(next);}} placeholder="key（唯一）"/>
                <input className="border rounded-lg p-2" value={t.label} onChange={e=>{const next=[...tags]; next[idx].label=e.target.value; setTags(next);}} placeholder="显示标题"/>
                <div className="flex items-center gap-2">
                  <input className="border rounded-lg p-2 w-28" value={t.color} onChange={e=>{const next=[...tags]; next[idx].color=e.target.value; setTags(next);}} placeholder="#RRGGBB 颜色"/>
                  <input type="color" className="w-8 h-8 border rounded" value={t.color} onChange={e=>{const next=[...tags]; next[idx].color=e.target.value; setTags(next);}} />
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={()=>moveTag(idx,'up')}><ArrowUp size={16}/></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={()=>moveTag(idx,'down')}><ArrowDown size={16}/></button>
                </div>
                <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg" onClick={()=>removeTag(idx)}><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold">内容项</h3>
            <button className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm" onClick={addItem}><Plus size={16}/>新增内容</button>
          </div>
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={it.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                <textarea className="border rounded-lg p-2 md:col-span-3" rows={2} value={it.content} onChange={e=>{const next=[...items]; next[idx].content=e.target.value; setItems(next);}} placeholder="请输入内容"/>
                <select className="border rounded-lg p-2" value={it.status || ''} onChange={e=>{const next=[...items]; next[idx].status=e.target.value || undefined; setItems(next);}}>
                  <option value="">无状态</option>
                  {tags.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                </select>
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={()=>moveItem(idx,'up')}><ArrowUp size={16}/></button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg" onClick={()=>moveItem(idx,'down')}><ArrowDown size={16}/></button>
                </div>
                <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg" onClick={()=>removeItem(idx)}><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button className="px-4 py-2 rounded-lg border" onClick={onCancel}>取消</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white" onClick={save}>保存</button>
        </div>
      </div>
    </div>
  );
};
