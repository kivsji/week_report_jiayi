import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CustomDashboard } from './components/CustomDashboard';
import { parseExcel, calculateMetrics } from './services/excelService';
import { DashboardData } from './types';

const App: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [mode, setMode] = useState<'upload' | 'dashboard' | 'custom'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const rows = await parseExcel(file);
      if (rows.length === 0) {
        throw new Error("表格为空或格式不正确");
      }
      const metrics = calculateMetrics(rows);
      
      setDashboardData({
        metrics,
        rows
      });
      setMode('dashboard');
    } catch (err) {
      setError("解析Excel失败，请确保文件格式正确 (Excel)。");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {mode === 'upload' ? (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
           <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
              <div className="mx-auto h-16 w-16 bg-indigo-100 rounded-full flex items-center justify-center">
                <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">物业拜访数据看板</h1>
              <p className="text-gray-500">请上传本周拜访记录 Excel 表格以生成汇报看板</p>
              
              <div className="relative group">
                <label 
                  htmlFor="file-upload" 
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                    ${loading ? 'bg-gray-50 border-gray-300' : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-indigo-400'}
                  `}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {loading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">点击上传</span> 或拖拽文件</p>
                        <p className="text-xs text-gray-400">支持 .xlsx, .xls 格式</p>
                      </>
                    )}
                  </div>
                  <input 
                    id="file-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    disabled={loading}
                  />
                </label>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="text-left text-xs text-gray-400 mt-4 space-y-1">
                <p>表格必须包含: 序号, 拜访时间, 楼栋, 面积, 业主态度..., 反馈内容... 等标准列。</p>
              </div>

              <div className="pt-2">
                <button className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => setMode('custom')}>或进入自定义报表页面</button>
              </div>
           </div>
        </div>
      ) : mode === 'dashboard' && dashboardData ? (
        <Dashboard data={dashboardData} setData={setDashboardData} onBack={() => { setDashboardData(null); setMode('upload'); }} />
      ) : (
        <CustomDashboard onBack={() => setMode(dashboardData ? 'dashboard' : 'upload')} />
      )}
    </div>
  );
};

export default App;
