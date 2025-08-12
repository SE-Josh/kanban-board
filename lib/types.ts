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
    id: "565a2883-8b76-4bfd-a5bf-282fb5df5fd7",
    statusId: "brainstorm",
    content: "關閉訂單與結帳",
    createdAt: "2025-08-12T02:35:24.226Z",
    updatedAt: "2025-08-12T02:35:24.226Z",
  },
  {
    id: "fe4734cc-d9da-4be8-969f-9777e81484ee",
    statusId: "brainstorm",
    content: "取得外送餐點",
    createdAt: "2025-08-12T02:35:48.800Z",
    updatedAt: "2025-08-12T02:35:48.800Z",
  },
  {
    id: "9c3cf7c0-434a-44dc-9979-9ad22ba45af0",
    statusId: "done",
    content: "選擇飲料店",
    createdAt: "2025-08-12T02:34:39.836Z",
    updatedAt: "2025-08-12T02:34:39.836Z",
  },
  {
    id: "617e8b0a-e3d5-48df-b050-1e614bb50e4a",
    statusId: "in-progress",
    content: "分享團購訂單",
    createdAt: "2025-08-12T02:34:47.340Z",
    updatedAt: "2025-08-12T02:34:47.340Z",
  },
  {
    id: "a58e6891-1ce0-4a70-99a1-d5aa7e1bcd70",
    statusId: "in-progress",
    content: "將品項加入購物車",
    createdAt: "2025-08-12T02:35:02.867Z",
    updatedAt: "2025-08-12T02:35:02.867Z",
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
  {
    id: "A",
    name: "A 計畫",
    badge: "badge-primary",
    status: "status-primary",
    text: "text-primary",
  },
  {
    id: "B",
    name: "B 計畫",
    badge: "badge-secondary",
    status: "status-secondary",
    text: "text-secondary",
  },
  {
    id: "C",
    name: "C 計畫",
    badge: "badge-accent",
    status: "status-accent",
    text: "text-accent",
  },
  {
    id: "D",
    name: "D 計畫",
    badge: "badge-info",
    status: "status-info",
    text: "text-info",
  },
  {
    id: "E",
    name: "E 計畫",
    badge: "badge-success",
    status: "status-success",
    text: "text-success",
  },
];
