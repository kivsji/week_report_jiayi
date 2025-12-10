
export interface ExcelRow {
  "序号": number | string;
  "拜访时间": string;
  "拜访组": string;
  "被拜访人": string;
  "被拜访人与业主关系": string;
  "被拜访人联系电话": string;
  "业主态度群诉态度": string;
  "反馈内容（含表扬）": string;
  "反馈内容跟进": string;
  "业主画像描述": string; // Shortened key for easier usage
  "待跟进专项": string;
  "对客统一话术": string;
  "楼栋": string;
  "房号": string | number;
  "面积": number;
  "业主姓名": string;
  "备注": string;
  [key: string]: any; // Allow loose indexing for processing
}

export interface BuildingStats {
  count: number;
  percentage: number; // Percentage of the specific sample (weekly or cumulative)
}

export interface AreaStats {
  category: string;
  area: number;
  percentage: number; // Percentage of total area (136130.51)
}

export interface FeedbackStats {
  total: number;
  completed: number;
  pending: number;
  items: Array<{
    id: number | string;
    content: string;
    status: '已完成' | '待跟进';
    followUp: string;
    building: string;
    room: string;
  }>;
}

export interface WeeklyStats {
  total: number;
  percentage: number; // vs 456
  breakdown: {
    "A栋": number;
    "C栋": number;
    "商业": number;
  };
  weekLabel: string;
}

export interface MetricSummary {
  totalTarget: number; // 456
  totalAreaTarget: number; // 136130.51
  
  // Requirement 3: Cumulative Visits
  cumulative: {
    total: number;
    percentage: number; // vs 456
    breakdown: {
      "A栋": number;
      "C栋": number;
      "商业": number;
    };
  };

  // Requirement 2: Weekly Visits
  weekly: WeeklyStats;

  // Requirement 3: Area Stats by Attitude
  areaStats: AreaStats[];

  // Requirement 4: Feedback
  feedbackStats: FeedbackStats;
}

export interface DashboardData {
  metrics: MetricSummary;
  rows: ExcelRow[];
  weeklyWorkSummary?: string;
  feedbackSummary?: string;
  geminiAnalysis?: string;
}

// 图表类型与自定义报表数据结构定义
export type ChartType = 'bar' | 'pie' | 'line';

export interface PieDataItem {
  name: string;
  value: number;
}

export interface BarDataItem {
  category: string;
  value: number;
}

export interface LinePoint {
  x: string | number;
  y: number;
}

export interface LineSeries {
  name: string;
  points: LinePoint[];
}

export interface ChartOptions {
  colors?: string[];
  showLegend?: boolean;
  showLabel?: boolean;
  showPercent?: boolean;
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  data: PieDataItem[] | BarDataItem[] | LineSeries[];
  options?: ChartOptions;
}

export interface CustomHeaderConfig {
  title: string;
  subtitle?: string;
  date?: string;
  format?: string; // 如 YYYY-MM-DD 或 YYYY年MM月DD日
  showDate?: boolean;
}

export interface CustomDashboardConfig {
  header: CustomHeaderConfig;
  charts: ChartConfig[];
  sections?: SectionConfig[];
}

export interface SectionTag {
  key: string;
  label: string;
  color: string;
}

export interface SectionItem {
  id: string;
  content: string;
  status?: string;
  meta?: { [k: string]: string };
}

export interface SectionConfig {
  id: string;
  title: string;
  hint?: string;
  tags: SectionTag[];
  items: SectionItem[];
}
