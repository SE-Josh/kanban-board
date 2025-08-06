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

import { Task, Status, defaultTasks, defaultStatuses } from "@/lib/types";
import TaskList from "@/components/TaskList";

// ===== Sortable 單一任務卡片 =====
const SortableItem = ({
  id,
  content,
}: {
  id: UniqueIdentifier;
  content: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab touch-none rounded-md border p-3 active:cursor-grabbing ${
        isDragging
          ? `border-2 border-dashed border-base-300 bg-base-200 text-neutral-content opacity-30`
          : `bg-base-200 border-base-300 hover:bg-base-100`
      }`}
    >
      <div className="flex items-center gap-3 text-base-content">
        <span>⋮</span>
        <span>{content}</span>
      </div>
    </li>
  );
};

// ===== Droppable 欄位 =====
const DroppableContainer = ({
  id,
  title,
  tasks,
  onAddTask,
}: {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask: (statusId: string, content: string) => void;
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
              <SortableItem key={task.id} id={task.id} content={task.content} />
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
          className="input input-ghost input-xs"
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
    <div className="cursor-grabbing rounded-md bg-base-100 text-base-content p-3 shadow-md">
      <div className="flex items-center gap-3">
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

  const getTasksByStatus = (statusId: string) =>
    tasks.filter((t) => t.statusId === statusId);

  return (
    <div className="mx-auto w-full">
      <h2 className="mb-4 text-xl font-bold text-base-content">Kanban Board</h2>
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
                onAddTask={handleAddTask} // 傳入新增功能
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

      <TaskList tasks={tasks} />
    </div>
  );
}
