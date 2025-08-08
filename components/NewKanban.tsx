"use client";

import { useState } from "react";
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

import {
  SortableContext,
  useSortable,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import { FaCheck } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import { FaBoxArchive } from "react-icons/fa6";

import {
  Task,
  Status,
  defaultTasks,
  defaultStatuses,
  Label,
  defaultLabels,
} from "@/lib/types";
import TaskList from "@/components/TaskList";

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

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
      className={`rounded-md border ${
        isDragging
          ? `border-2 border-dashed border-base-300 bg-base-200 text-neutral-content opacity-30`
          : `bg-base-200 border-base-300 hover:bg-base-100`
      }`}
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
          <div
            {...attributes}
            {...listeners}
            className="flex items-center gap-2 flex-1 p-3 pe-0 select-none cursor-grab touch-none text-xs"
          >
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
    <div
      ref={setNodeRef}
      className="flex h-full min-h-40 flex-col rounded-md border p-3 bg-base-100 border-base-300 text-base-content"
    >
      <h3 className="mb-2 font-medium">{title}</h3>
      <div className="flex-1">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2">
            {tasks.map((task) => (
              <SortableItem
                key={task.id}
                id={task.id}
                content={task.content}
                statusId={task.statusId}
                labelId={task.labelId}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                onArchive={onArchiveTask}
              />
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

    setTasks((prev) =>
      prev.map((task) =>
        task.id === activeTaskId ? { ...task, statusId: overStatusId } : task
      )
    );
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

  const handleEditTask = (
    taskId: string,
    newContent: string,
    newLabelId?: string | null
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              content: newContent ?? t.content,
              labelId:
                newLabelId === null ? undefined : newLabelId ?? t.labelId,
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const handleArchiveTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, statusId: "archived", updatedAt: new Date().toISOString() }
          : t
      )
    );
  };

  const getTasksByStatus = (statusId: string) =>
    tasks.filter((t) => t.statusId === statusId);

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
  return (
    <div className="mx-auto w-full">
      <div className="mb-3">
        <a className="btn btn-ghost text-xl text-primary rounded">
          康邦 • 博德！
        </a>
      </div>
      <div className="my-3">
        <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
          {labels.map((label, index) => (
            <li
              key={label.id}
              className="flex items-center gap-2 bg-base-100 rounded p-3"
            >
              <span
                className={`badge badge-xs ${label.badge} w-4 justify-center`}
              />

              {editLabelIndex === index ? (
                <>
                  <input
                    className="input input-sm input-bordered w-full max-w-xs"
                    value={editLabelValue}
                    onChange={(e) => setEditLabelValue(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSaveLabelName(index)
                    }
                    autoFocus
                  />
                  <button
                    className="btn btn-sm btn-circle btn-ghost"
                    title="儲存"
                    onClick={() => handleSaveLabelName(index)}
                  >
                    <FaCheck className="text-success" />
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1 truncate">{label.name}</span>
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragCancel={handleDragCancel}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
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
          {activeId ? (
            <ItemOverlay>{getActiveTask()?.content}</ItemOverlay>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskList tasks={tasks} labels={labels} onEditTask={handleEditTask} />
    </div>
  );
}
