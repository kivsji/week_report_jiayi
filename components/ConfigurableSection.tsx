import React from 'react';
import { SectionConfig } from '../types';

/**
 * ConfigurableSection
 * 通用模块渲染组件：根据 SectionConfig 显示标题、提示、状态标签计数与内容列表。
 */
export const ConfigurableSection: React.FC<{ config: SectionConfig }> = ({ config }) => {
  const counts = Object.fromEntries(
    config.tags.map(t => [t.key, config.items.filter(i => i.status === t.key).length])
  );

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{config.title}</h3>
          {config.hint && <div className="text-xs text-gray-500 mt-1">{config.hint}</div>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {config.tags.map(tag => (
          <span key={tag.key} className="px-2 py-1 rounded-full text-xs" style={{
            color: '#1f2937',
            backgroundColor: `${tag.color}20`
          }}>
            {tag.label}: {counts[tag.key] ?? 0}
          </span>
        ))}
      </div>

      <div className="space-y-2">
        {config.items.map(item => (
          <div key={item.id} className="border border-gray-100 rounded-lg p-3 flex items-start justify-between">
            <div className="text-sm text-gray-700">{item.content}</div>
            {item.status && (
              <span className="ml-3 px-2 py-1 rounded-full text-xs" style={{
                backgroundColor: `${(config.tags.find(t => t.key === item.status)?.color || '#9CA3AF')}20`,
                color: '#374151'
              }}>
                {config.tags.find(t => t.key === item.status)?.label || item.status}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
