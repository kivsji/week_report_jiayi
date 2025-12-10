
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
