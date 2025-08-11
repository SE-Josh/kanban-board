"use client";

import { useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";

import { SortableContext, useSortable, sortableKeyboardCoordinates, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { FaCheck } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { FaBoxArchive } from "react-icons/fa6";

import { Task, Status, defaultTasks, defaultStatuses, Label, defaultLabels } from "@/lib/types";
import TaskList from "@/components/TaskList";

// —— LocalStorage Keys & Helpers ——
const LS_TASKS_KEY = "kanban.tasks.v1";
const LS_LABELS_KEY = "kanban.labels.v1";

type TasksPayload = { version: 1; updatedAt: string; items: Task[] };
type LabelsPayload = { version: 1; updatedAt: string; items: Label[] };

type ExportBundleV1 = {
  version: 1;
  exportedAt: string;
  tasks: TasksPayload;
  labels: LabelsPayload;
};

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn("Parse localStorage failed:", e);
    return null;
  }
}

// ===== 任務卡片的 LabelStatus  =====
const LabelPill = ({ labelId }: { labelId?: Label["id"] }) => {
  const label = defaultLabels.find((l) => l.id === labelId);
  return <div aria-label="status" className={`status ${label?.status}`} />;
};

// ===== Sortable 單一任務卡片 =====
const SortableItem = ({
  id,
  content,
  statusId,
  labelId,
  onDelete,
  onEdit,
  onArchive,
}: {
  id: UniqueIdentifier;
  content: string;
  statusId: string;
  labelId?: Label["id"];
  onDelete: (taskId: string) => void;
  onEdit: (taskId: string, newContent: string) => void;
  onArchive: (taskId: string) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleSave = () => {
    if (editValue.trim()) {
      onEdit(id as string, editValue.trim());
      setIsEditing(false);
    }
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-md border ${isDragging ? `border-2 border-dashed border-base-300 bg-base-200 text-neutral-content opacity-30` : `bg-base-200 border-base-300 hover:bg-base-100`}`}
    >
      <div className="flex items-center justify-between text-base-content">
        {/* 文字區 */}
        {isEditing ? (
          <input
            className="input input-sm w-full flex-1 p-3 pe-0 my-2 ms-1 border-0 focus:outline-none"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            autoFocus
          />
        ) : (
          <div {...attributes} {...listeners} className="flex items-center gap-2 flex-1 p-3 pe-0 select-none cursor-grab touch-none text-xs">
            <LabelPill labelId={labelId} />
            <span>{content}</span>
          </div>
        )}

        {/* 按鈕區 */}
        <div className="flex items-center gap-[0.5px] me-1">
          {isEditing ? (
            <button
              className="btn btn-sm btn-circle btn-ghost"
              title="儲存"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
            >
              <FaCheck className="text-success text-lg" />
            </button>
          ) : (
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              title="編輯"
            >
              <FaEdit className="text-warning text-lg" />
            </button>
          )}
          {statusId === "done" ? (
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onArchive(id as string);
              }}
              title="封存"
            >
              <FaBoxArchive className="text-info text-lg scale-95" />
            </button>
          ) : (
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id as string);
              }}
              title="刪除"
            >
              <MdCancel className="text-error text-lg" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

// ===== Droppable 欄位 =====
const DroppableContainer = ({
  id,
  title,
  tasks,
  labels,
  onAddTask,
  onDeleteTask,
  onEditTask,
  onArchiveTask,
}: {
  id: string;
  title: string;
  tasks: Task[];
  labels: Label[];
  onAddTask: (statusId: string, content: string) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (taskId: string, newContent: string) => void;
  onArchiveTask: (taskId: string) => void;
}) => {
  const { setNodeRef } = useDroppable({ id });
  const [newTask, setNewTask] = useState("");

  const handleAdd = () => {
    if (!newTask.trim()) return;
    onAddTask(id, newTask.trim());
    setNewTask("");
  };

  return (
    <div ref={setNodeRef} className="flex h-full min-h-40 flex-col rounded-md border p-3 bg-base-100 border-base-300 text-base-content">
      <h3 className="mb-2 font-medium">{title}</h3>
      <div className="flex-1">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <SortableItem key={task.id} id={task.id} content={task.content} statusId={task.statusId} labelId={task.labelId} onDelete={onDeleteTask} onEdit={onEditTask} onArchive={onArchiveTask} />
            ))}
          </ul>
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-md border border-dashed bg-base-100 text-base-content border-base-300">
            <p className="text-sm">目前沒有任務</p>
          </div>
        )}
      </div>

      {/* 新增任務輸入框 */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="新增任務..."
          className="input input-ghost input-xs border-0 focus:outline-none"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
      </div>
    </div>
  );
};

// ===== 拖拉時的 Overlay =====
const ItemOverlay = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="cursor-grabbing rounded-md bg-base-100 text-base-content text-xs p-3 shadow-md">
      <div className="flex items-center gap-2">
        <span>⋮</span>
        <span>{children}</span>
      </div>
    </div>
  );
};

// ===== 主 Kanban 元件 =====
export default function KanbanBoard() {
  const [statuses, setStatuses] = useState<Status[]>(defaultStatuses);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [labels, setLabels] = useState<Label[]>(defaultLabels);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const hydratedRef = useRef(false); // ✅ 防止重複 hydrate

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    if (typeof window === "undefined") return;

    // Tasks
    const t = safeParse<TasksPayload>(localStorage.getItem(LS_TASKS_KEY));
    if (t?.version === 1 && Array.isArray(t.items)) {
      setTasks(t.items);
    } else {
      // 無資料或壞資料 -> 用預設
      setTasks(defaultTasks);
    }

    // Labels
    const l = safeParse<LabelsPayload>(localStorage.getItem(LS_LABELS_KEY));
    if (l?.version === 1 && Array.isArray(l.items)) {
      setLabels(l.items);
    } else {
      setLabels(defaultLabels);
    }
  }, []);

  useEffect(() => {
    persistTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    persistLabels(labels);
  }, [labels]);

  const resetLocalData = () => {
    localStorage.removeItem(LS_TASKS_KEY);
    localStorage.removeItem(LS_LABELS_KEY);
    setTasks(defaultTasks);
    setLabels(defaultLabels);
  };

  // 感應器設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 50, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 找出任務的 statusId
  const findStatusIdByTaskId = (taskId: string): string | undefined => {
    return tasks.find((t) => t.id === taskId)?.statusId;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;

    const activeStatusId = findStatusIdByTaskId(activeTaskId) ?? activeTaskId;
    const overStatusId = findStatusIdByTaskId(overId) ?? overId;

    if (activeStatusId === overStatusId) return;

    setTasks((prev) => prev.map((task) => (task.id === activeTaskId ? { ...task, statusId: overStatusId } : task)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;

    const activeStatusId = findStatusIdByTaskId(activeTaskId) ?? activeTaskId;
    const overStatusId = findStatusIdByTaskId(overTaskId) ?? overTaskId;

    if (activeStatusId === overStatusId) {
      // 同一欄位內排序
      const currentTasks = tasks.filter((t) => t.statusId === activeStatusId);
      const activeIndex = currentTasks.findIndex((t) => t.id === activeTaskId);
      const overIndex = currentTasks.findIndex((t) => t.id === overTaskId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const newOrder = arrayMove(currentTasks, activeIndex, overIndex);
        setTasks((prev) => {
          const otherTasks = prev.filter((t) => t.statusId !== activeStatusId);
          return [...otherTasks, ...newOrder];
        });
      }
    }
    setActiveId(null);
  };

  const getActiveTask = () => tasks.find((t) => t.id === activeId) || null;

  const handleAddTask = (statusId: string, content: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      statusId,
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleEditTask = (taskId: string, newContent: string, newLabelId?: string | null) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              content: newContent ?? t.content,
              labelId: newLabelId === null ? undefined : newLabelId ?? t.labelId,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const handleArchiveTask = (taskId: string) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, statusId: "archived", updatedAt: new Date().toISOString() } : t)));
  };

  const getTasksByStatus = (statusId: string) => tasks.filter((t) => t.statusId === statusId);

  const [editLabelIndex, setEditLabelIndex] = useState<number | null>(null);
  const [editLabelValue, setEditLabelValue] = useState("");

  const handleSaveLabelName = (index: number) => {
    setLabels((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        name: editLabelValue.trim() || updated[index].id,
      };
      return updated;
    });
    setEditLabelIndex(null);
    setEditLabelValue("");
  };

  const copyDailyReport = (includeArchived = false) => {
    const getLabelName = (labelId?: string) => labels.find((l) => l.id === labelId)?.name ?? "未分類";

    const source = includeArchived ? tasks : tasks.filter((t) => t.statusId !== "archived");

    const text = source.map((t) => `${getLabelName(t.labelId)}－${t.content}`).join("\n");

    navigator.clipboard
      .writeText(text)
      .then(() => {
        console.log("✅ 日報已複製到剪貼簿");
      })
      .catch((err) => {
        console.error("❌ 複製失敗", err);
      });
  };

  // 取得封存清單
  const archivedTasks = tasks.filter((t) => t.statusId === "archived");

  // 還原單筆（預設還原到 todo，可改成 done 等）
  const handleUnarchiveTask = (taskId: string, toStatusId: string = "todo") => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, statusId: toStatusId, updatedAt: new Date().toISOString() } : t)));
  };

  // 刪除封存中的單筆
  const handleDeleteArchivedTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // 清空封存
  const handleClearArchive = () => {
    setTasks((prev) => prev.filter((t) => t.statusId !== "archived"));
  };

  function debounce<T extends (...args: any[]) => void>(func: T, delay: number) {
    let timer: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  }

  // 建議 300–500ms，拖曳/輸入都會順
  const persistTasks = debounce((items: Task[]) => {
    try {
      if (typeof window === "undefined") return;
      const payload: TasksPayload = {
        version: 1,
        updatedAt: new Date().toISOString(),
        items,
      };
      localStorage.setItem(LS_TASKS_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Save tasks failed:", e);
    }
  }, 400);

  const persistLabels = debounce((items: Label[]) => {
    try {
      if (typeof window === "undefined") return;
      const payload: LabelsPayload = {
        version: 1,
        updatedAt: new Date().toISOString(),
        items,
      };
      localStorage.setItem(LS_LABELS_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error("Save labels failed:", e);
    }
  }, 400);

  const importInputRef = useRef<HTMLInputElement>(null);

  const isExportBundleV1 = (data: any): data is ExportBundleV1 => {
    return data && data.version === 1 && data.tasks?.version === 1 && Array.isArray(data.tasks?.items) && data.labels?.version === 1 && Array.isArray(data.labels?.items);
  };

  // 匯出：把目前 state 打包下載
  const handleExport = () => {
    const bundle: ExportBundleV1 = {
      version: 1,
      exportedAt: new Date().toISOString(),
      tasks: { version: 1, updatedAt: new Date().toISOString(), items: tasks },
      labels: { version: 1, updatedAt: new Date().toISOString(), items: labels },
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kanban-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // 觸發選檔
  const triggerImport = () => importInputRef.current?.click();

  // 匯入：驗證版本與欄位，覆蓋目前資料並寫回 localStorage
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmReplace = window.confirm("匯入將覆蓋目前的任務與標籤，是否繼續？");
    if (!confirmReplace) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result));
        if (!isExportBundleV1(json)) {
          alert("檔案格式或版本不支援（需要 version: 1）。");
          return;
        }
        // 套用狀態
        setTasks(json.tasks.items);
        setLabels(json.labels.items);

        // 立即寫回 localStorage（避免等 debounce）
        localStorage.setItem(LS_TASKS_KEY, JSON.stringify(json.tasks));
        localStorage.setItem(LS_LABELS_KEY, JSON.stringify(json.labels));

        console.log("✅ 匯入成功");
      } catch (err) {
        console.error("匯入失敗：", err);
        alert("匯入失敗：無法解析 JSON。");
      } finally {
        e.target.value = ""; // 允許下次選同一檔
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto w-full">
      <div className="mb-3">
        <a className="btn btn-ghost text-xl text-primary rounded">康邦 • 博德！</a>
      </div>
      {/* 計畫標籤區 */}
      <div className="my-3">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
          {labels.map((label, index) => (
            <li key={label.id} className="flex items-center gap-2 bg-base-100 rounded p-3">
              <span className={`badge badge-xs ${label.badge} w-4 justify-center`} />

              {editLabelIndex === index ? (
                <>
                  <input
                    className="input input-xs input-bordered pe-0 border-0 "
                    value={editLabelValue}
                    onChange={(e) => setEditLabelValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveLabelName(index)}
                    autoFocus
                  />
                  <button className="btn btn-sm btn-circle btn-ghost" title="儲存" onClick={() => handleSaveLabelName(index)}>
                    <FaCheck className="text-success" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 truncate text-xs">{label.name}</span>
                  <button
                    className="btn btn-sm btn-circle btn-ghost"
                    title="編輯"
                    onClick={() => {
                      setEditLabelIndex(index);
                      setEditLabelValue(label.name);
                    }}
                  >
                    <FaEdit className="text-warning" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragCancel={handleDragCancel} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 md:grid-cols-3">
          {statuses.map((status) => {
            if (status.id === "archived") return null; // 忽略封存狀態
            return (
              <DroppableContainer
                key={status.id}
                id={status.id}
                title={status.title}
                tasks={getTasksByStatus(status.id)}
                labels={labels}
                onAddTask={handleAddTask} // 傳入新增功能
                onDeleteTask={handleDeleteTask} // 傳入刪除功能
                onEditTask={handleEditTask} // 傳入編輯功能
                onArchiveTask={handleArchiveTask} // 傳入封存功能
              />
            );
          })}
        </div>
        <DragOverlay
          dropAnimation={{
            duration: 150,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeId ? <ItemOverlay>{getActiveTask()?.content}</ItemOverlay> : null}
        </DragOverlay>
      </DndContext>

      <TaskList tasks={tasks} labels={labels} onEditTask={handleEditTask} />

      {/* 封存區按鈕以及 Modal */}
      <div className="flex justify-end mt-3 gap-1">
        <button className="btn btn-soft btn-primary rounded gap-2" onClick={handleExport}>
          匯出 JSON
        </button>

        <button className="btn btn-soft btn-secondary rounded gap-2" onClick={triggerImport}>
          匯入 JSON
        </button>

        <input ref={importInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />

        <button
          className="btn btn-soft btn-success rounded gap-2"
          onClick={() => {
            copyDailyReport();
          }}
        >
          產生日報
        </button>
        <button
          className="btn btn-soft btn-info rounded gap-2"
          onClick={() => {
            const modal = document.getElementById("archiveModal") as HTMLDialogElement | null;
            if (modal) modal.showModal();
          }}
        >
          <FaBoxArchive />
          <span className="badge">{archivedTasks.length}</span>
        </button>
        <button className="btn btn-soft btn-error rounded gap-2" onClick={resetLocalData}>
          重置 LocalStorage
        </button>

        <dialog id="archiveModal" className="modal">
          <div className="modal-box max-w-3xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">封存區（{archivedTasks.length}）</h3>
              <form method="dialog">
                <button className="btn btn-ghost btn-sm">✕</button>
              </form>
            </div>

            {archivedTasks.length === 0 ? (
              <div className="mt-4 alert">目前沒有封存的任務。</div>
            ) : (
              <div className="mt-4 overflow-x-auto rounded bg-base-100">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>計畫</th>
                      <th>內容</th>
                      <th>建立時間</th>
                      <th>還原到</th>
                      <th className="text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedTasks.map((task) => (
                      <tr key={task.id}>
                        <td className="w-24">
                          <LabelPill labelId={task.labelId} />
                        </td>
                        <td className="max-w-[320px]">
                          <div className="truncate">{task.content}</div>
                        </td>
                        <td className="whitespace-nowrap">{new Date(task.createdAt).toLocaleString()}</td>
                        <td className="w-40">
                          <select className="select select-bordered select-xs w-full" defaultValue="todo" id={`restore-select-${task.id}`}>
                            {statuses
                              .filter((s) => s.id !== "archived")
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.title}
                                </option>
                              ))}
                          </select>
                        </td>
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="btn btn-xs btn-soft btn-success rounded"
                              onClick={() => {
                                const sel = document.getElementById(`restore-select-${task.id}`) as HTMLSelectElement | null;
                                const to = sel?.value || "todo";
                                handleUnarchiveTask(task.id, to);
                              }}
                            >
                              還原
                            </button>
                            <button className="btn btn-xs btn-soft btn-error rounded" onClick={() => handleDeleteArchivedTask(task.id)}>
                              刪除
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 flex justify-between items-center">
                  <div className="text-xs opacity-70">提示：還原預設回「腦力激盪」，可在下拉選單選擇其他狀態。</div>
                  <button className="btn btn-sm btn-error btn-outline rounded" onClick={handleClearArchive}>
                    清空封存
                  </button>
                </div>
              </div>
            )}
          </div>

          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
}
