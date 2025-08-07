// ===== 型別定義 =====
export type Status = {
  id: string;
  title: string;
};

export type Task = {
  id: string;
  statusId: Status["id"]; // 關聯到 Status
  labelId?: string; // 關連到 Label（可選）
  content: string; // 卡片標題
  description?: string; // 詳細描述（可選）
  createdAt: string; // ISO 時間字串
  updatedAt: string; // ISO 時間字串
  dueDate?: string; // 到期日（可選）
};

// ===== 初始資料 =====
export const defaultStatuses: Status[] = [
  { id: "brainstorm", title: "腦力激盪" },
  { id: "in-progress", title: "如火如荼" },
  { id: "done", title: "修成正果" },
  { id: "archived", title: "蛋雕區" },
];

export const defaultTasks: Task[] = [
  {
    id: "task-1",
    statusId: "brainstorm",
    content: "研究 @dnd-kit",
    createdAt: "2025-08-07T00:21:37.300Z",
    updatedAt: "2025-08-07T00:21:37.300Z",
  },
  {
    id: "task-2",
    statusId: "brainstorm",
    content: "製作基本範例",
    createdAt: "2025-08-07T00:21:37.300Z",
    updatedAt: "2025-08-07T00:21:37.300Z",
  },
  {
    id: "task-3",
    statusId: "in-progress",
    content: "撰寫教學文檔",
    createdAt: "2025-08-07T00:21:37.300Z",
    updatedAt: "2025-08-07T00:21:37.300Z",
  },
  {
    id: "task-4",
    statusId: "done",
    content: "初始化專案",
    createdAt: "2025-08-07T00:21:37.300Z",
    updatedAt: "2025-08-07T00:21:37.300Z",
  },
];

export type Label = {
  id: string;
  name: string;
  badge: string;
  status: string;
  text: string;
};

export const defaultLabels: Label[] = [
  { id: "A", name: "A 計畫", badge: "badge-primary", status: "status-primary", text: "text-primary" },
  { id: "B", name: "B 計畫", badge: "badge-secondary", status: "status-secondary", text: "text-secondary" },
  { id: "C", name: "C 計畫", badge: "badge-accent", status: "status-accent", text: "text-accent" },
  { id: "D", name: "D 計畫", badge: "badge-info", status: "status-info", text: "text-info" },
  { id: "E", name: "E 計畫", badge: "badge-success", status: "status-success", text: "text-success" },
];
