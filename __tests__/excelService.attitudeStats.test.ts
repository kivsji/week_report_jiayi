import { calculateAttitudeStats } from '../services/excelService';
import type { ExcelRow } from '../types';

const makeRow = (attitude: string): ExcelRow => ({
  "序号": 1,
  "拜访时间": "",
  "拜访组": "",
  "被拜访人": "",
  "被拜访人与业主关系": "",
  "被拜访人联系电话": "",
  "业主态度群诉态度": attitude,
  "反馈内容（含表扬）": "",
  "反馈内容跟进": "",
  "业主画像描述": "",
  "待跟进专项": "",
  "对客统一话术": "",
  "楼栋": "",
  "房号": "",
  "面积": 0,
  "业主姓名": "",
  "备注": ""
});

const rows: ExcelRow[] = [
  makeRow("支持"),
  makeRow("不支持"),
  makeRow("支持（群内）"),
  makeRow("不 支持"),
  makeRow("其他"),
  makeRow(""),
];

const stats = calculateAttitudeStats(rows);

console.log(JSON.stringify(stats));
