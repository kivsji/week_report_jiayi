
import * as XLSX from 'xlsx';
import { ExcelRow, MetricSummary, FeedbackStats, AreaStats, WeeklyStats, AttitudeStats } from '../types';

const TOTAL_AREA = 136130.51;

// Helper to clean date strings like "2025.11.20 14:30" or "2025.12.2 10：00"
const parseDate = (dateStr: string | number): Date | null => {
  if (!dateStr) return null;
  if (typeof dateStr === 'number') {
    // Excel serial date
    return new Date(Math.round((dateStr - 25569) * 86400 * 1000));
  }
  
  try {
    const cleaned = dateStr.toString()
      .replace(/：/g, ':')
      .replace(/\./g, '-')
      .trim();
    const d = new Date(cleaned);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

export const getWeekNumber = (d: Date): number => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
};

export const parseExcel = async (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse with raw keys first to handle the specific structure
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        const cleanedData: ExcelRow[] = json
          .filter(row => {
             return row["业主拜访记录表 "] !== "序号"; 
          })
          .map((row) => {
            return {
              "序号": row["业主拜访记录表 "] || row["序号"],
              "拜访时间": row["__EMPTY"] || row["拜访时间"] || "",
              "拜访组": row["__EMPTY_1"] || row["拜访组"] || "",
              "被拜访人": row["__EMPTY_2"] || row["被拜访人"] || "",
              "被拜访人与业主关系": row["__EMPTY_3"] || row["被拜访人与业主关系"] || "",
              "被拜访人联系电话": row["__EMPTY_4"] || row["被拜访人联系电话"] || "",
              "业主态度群诉态度": row["__EMPTY_5"] || row["业主态度群诉态度"] || "未记录",
              "反馈内容（含表扬）": row["__EMPTY_6"] || row["反馈内容（含表扬）"] || "",
              "反馈内容跟进": row["__EMPTY_7"] || row["反馈内容跟进"] || "",
              "业主画像描述": row["__EMPTY_8"] || row["业主画像描述"] || "",
              "待跟进专项": row["__EMPTY_9"] || row["待跟进专项"] || "",
              "对客统一话术": row["__EMPTY_10"] || row["对客统一话术"] || "",
              "楼栋": row["__EMPTY_11"] || row["楼栋"] || "未知",
              "房号": row["__EMPTY_12"] || row["房号"] || "",
              "面积": parseFloat(row["__EMPTY_13"] || row["面积"] || 0),
              "业主姓名": row["__EMPTY_14"] || row["业主姓名"] || "",
              "备注": row["__EMPTY_15"] || row["备注"] || ""
            };
        });

        resolve(cleanedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const calculateWeeklyMetrics = (rows: ExcelRow[], targetDate: Date, totalHouseholds: number): WeeklyStats => {
  const currentWeekNum = getWeekNumber(targetDate);
  const currentYear = targetDate.getFullYear();

  const weekly: WeeklyStats = {
    total: 0,
    percentage: 0,
    breakdown: { "A栋": 0, "C栋": 0, "商业": 0 },
    areaBreakdown: { "A栋": 0, "C栋": 0, "商业": 0 },
    weekLabel: `${currentYear}年第${currentWeekNum}周`
  };

  rows.forEach(row => {
    const d = parseDate(row["拜访时间"]);
    if (d) {
      const w = getWeekNumber(d);
      const y = d.getFullYear();
      if (w === currentWeekNum && y === currentYear) {
        // Building Logic
        let bldg = "其他";
        const rawBldg = (row["楼栋"] || "").toString().toUpperCase();
        if (rawBldg.includes("A")) bldg = "A栋";
        else if (rawBldg.includes("C")) bldg = "C栋";
        else if (rawBldg.includes("商")) bldg = "商业";

        const area = parseFloat(String(row["面积"] || 0));

        weekly.total++;
        if (weekly.breakdown[bldg as keyof typeof weekly.breakdown] !== undefined) {
          weekly.breakdown[bldg as keyof typeof weekly.breakdown]++;
          weekly.areaBreakdown[bldg as keyof typeof weekly.areaBreakdown] += area;
        }
      }
    }
  });

  // Round area stats to 2 decimals
  weekly.areaBreakdown["A栋"] = parseFloat(weekly.areaBreakdown["A栋"].toFixed(2));
  weekly.areaBreakdown["C栋"] = parseFloat(weekly.areaBreakdown["C栋"].toFixed(2));
  weekly.areaBreakdown["商业"] = parseFloat(weekly.areaBreakdown["商业"].toFixed(2));

  weekly.percentage = parseFloat(((weekly.total / totalHouseholds) * 100).toFixed(1));

  return weekly;
};

export const calculateAttitudeStats = (rows: ExcelRow[]): AttitudeStats => {
  const total = rows.length;
  let support = 0;
  let notSupport = 0;
  const normalize = (s: string): string => {
    return (s || '').toString()
      .replace(/[（）\(\)]/g, '')
      .replace(/\s+/g, '')
      .trim();
  };
  for (const r of rows) {
    const raw = r["业主态度群诉态度"] || '';
    const n = normalize(raw);
    if (!n) continue;
    if (n.includes('不支持')) {
      notSupport++;
    } else if (n.includes('支持')) {
      support++;
    }
  }
  const supportPct = total ? parseFloat(((support / total) * 100).toFixed(1)) : 0;
  const notSupportPct = total ? parseFloat(((notSupport / total) * 100).toFixed(1)) : 0;
  return {
    supportCount: support,
    notSupportCount: notSupport,
    totalCount: total,
    supportPct,
    notSupportPct
  };
};

export const calculateMetrics = (rows: ExcelRow[], totalHouseholds: number = 456): MetricSummary => {
  // 1. Determine "Current Week" based on the latest date in the file for initial load
  let latestDate: Date | null = null;
  const rowsWithDate = rows.map(r => {
    const d = parseDate(r["拜访时间"]);
    if (d && (!latestDate || d > latestDate)) latestDate = d;
    return { ...r, parsedDate: d };
  });

  // Default to today if no dates found, or the latest date found
  const initialDate = latestDate || new Date();

  // Initialize Data Structures
  const metrics: MetricSummary = {
    totalTarget: totalHouseholds,
    totalAreaTarget: TOTAL_AREA,
    cumulative: {
      total: 0,
      percentage: 0,
      breakdown: { "A栋": 0, "C栋": 0, "商业": 0 },
      areaBreakdown: { "A栋": 0, "C栋": 0, "商业": 0 }
    },
    weekly: calculateWeeklyMetrics(rows, initialDate, totalHouseholds),
    areaStats: [],
    feedbackStats: {
      total: 0,
      completed: 0,
      pending: 0,
      items: []
    }
  };

  rowsWithDate.forEach(row => {
    // --- Building Logic ---
    let bldg = "其他";
    const rawBldg = (row["楼栋"] || "").toString().toUpperCase();
    if (rawBldg.includes("A")) bldg = "A栋";
    else if (rawBldg.includes("C")) bldg = "C栋";
    else if (rawBldg.includes("商")) bldg = "商业";

    const area = parseFloat(String(row["面积"] || 0));

    // --- Cumulative Stats ---
    metrics.cumulative.total++;
    if (metrics.cumulative.breakdown[bldg as keyof typeof metrics.cumulative.breakdown] !== undefined) {
      metrics.cumulative.breakdown[bldg as keyof typeof metrics.cumulative.breakdown]++;
      metrics.cumulative.areaBreakdown[bldg as keyof typeof metrics.cumulative.areaBreakdown] += area;
    }

    // --- Feedback Stats ---
    const content = row["反馈内容（含表扬）"];
    if (content && content.trim()) {
      metrics.feedbackStats.total++;
      
      const followUp = row["反馈内容跟进"] || "";
      // Check for completion keywords
      const isCompleted = ["已完成", "已解决", "完结", "关闭"].some(k => followUp.includes(k));
      
      if (isCompleted) {
        metrics.feedbackStats.completed++;
      } else {
        metrics.feedbackStats.pending++;
      }

      metrics.feedbackStats.items.push({
        id: row["序号"],
        content: content,
        followUp: followUp,
        status: isCompleted ? '已完成' : '待跟进',
        building: bldg,
        room: row["房号"].toString()
      });
    }
  });

  // Round area stats to 2 decimals for cumulative
  metrics.cumulative.areaBreakdown["A栋"] = parseFloat(metrics.cumulative.areaBreakdown["A栋"].toFixed(2));
  metrics.cumulative.areaBreakdown["C栋"] = parseFloat(metrics.cumulative.areaBreakdown["C栋"].toFixed(2));
  metrics.cumulative.areaBreakdown["商业"] = parseFloat(metrics.cumulative.areaBreakdown["商业"].toFixed(2));

  // Calculate Percentages
  metrics.cumulative.percentage = parseFloat(((metrics.cumulative.total / totalHouseholds) * 100).toFixed(1));

  return metrics;
};
