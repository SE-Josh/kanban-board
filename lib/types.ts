export type Status = {
  id: string;
  title: string;
  order: string; // Lexicographic 排序值，例如 "a", "b", "a1"
};

export type Task = {
  id: string;
  statusId: Status["id"]; // 明確關聯到 Status
  content: string; // 卡片標題
  description?: string; // 可選，部分任務可能沒有詳細描述
  tags?: string[]; // 可選
  createdAt: string; // ISO 時間字串
  updatedAt: string; // ISO 時間字串
  dueDate?: string; // 可選，到期日
  order: string; // Lexicographic 排序值
  archived: boolean; // 是否封存
};
