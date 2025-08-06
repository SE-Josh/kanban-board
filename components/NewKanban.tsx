import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragCancelEvent,
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
          ? `border-2 border-dashed border-gray-300 bg-gray-50 opacity-30 dark:border-gray-600 dark:bg-gray-800/30`
          : `bg-white dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50`
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500 dark:text-gray-400">⋮</span>
        <span className="dark:text-gray-200">{content}</span>
      </div>
    </li>
  );
};

// ===== Droppable 欄位 =====
const DroppableContainer = ({
  id,
  title,
  tasks,
}: {
  id: string;
  title: string;
  tasks: Task[];
}) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="flex h-full min-h-40 flex-col rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
    >
      <h3 className="mb-2 font-medium text-gray-700 dark:text-gray-200">
        {title}
      </h3>
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
          <div className="flex h-20 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800/30">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drop items here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ===== 拖拉時的 Overlay =====
const ItemOverlay = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="cursor-grabbing rounded-md bg-base-100 p-3 shadow-md">
      <div className="flex items-center gap-3">
        <span className="text-gray-500">⋮</span>
        <span className="text-gray-200">{children}</span>
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

  const getTasksByStatus = (statusId: string) =>
    tasks.filter((t) => t.statusId === statusId);

  return (
    <div className="mx-auto w-full">
      <h2 className="mb-4 text-xl font-bold dark:text-white">Kanban Board</h2>
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
      <div className="overflow-x-auto mt-5">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              {/* <th>編號</th> */}
              <th>內容</th>
              <th>描述</th>
              <th>狀態</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                {/* <th>{task.id}</th> */}
                <td>{task.content}</td>
                <td>{task.description || "No description"}</td>
                <td>{defaultStatuses.find((status) => status.id === task.statusId)?.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
