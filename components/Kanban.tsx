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
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

interface Item {
  id: string;
  content: string;
}

interface Container {
  id: string;
  title: string;
  items: Item[];
}

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
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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

const DroppableContainer = ({
  id,
  title,
  items,
}: {
  id: string;
  title: string;
  items: Item[];
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
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id} content={item.content} />
            ))}
          </ul>
        </SortableContext>

        {items.length === 0 && (
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

export default function MultipleContainers() {
  const [containers, setContainers] = useState<Container[]>([
    {
      id: "todo",
      title: "To Do",
      items: [
        { id: "task-1", content: "Research @dnd-kit" },
        { id: "task-2", content: "Create basic example" },
        { id: "task-3", content: "Write tutorial" },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      items: [{ id: "task-4", content: "Record demo video" }],
    },
    {
      id: "done",
      title: "Done",
      items: [{ id: "task-5", content: "Setup project" }],
    },
  ]);
  void setContainers;

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  void activeId;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const findContainerId = (
    itemId: UniqueIdentifier
  ): UniqueIdentifier | undefined => {
    if (containers.some((container) => container.id === itemId)) {
      return itemId;
    }

    return containers.find((container) =>
      container.items.some((item) => item.id === itemId)
    )?.id;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainerId = findContainerId(activeId);
    const overContainerId = findContainerId(overId);

    if (!activeContainerId || !overContainerId) return;

    if (activeContainerId === overContainerId && activeId !== overId) {
      return;
    }

    if (activeContainerId === overContainerId) return;

    setContainers((prev) => {
      const activeContainer = prev.find((c) => c.id === activeContainerId);
      if (!activeContainer) return prev;

      const activeItem = activeContainer.items.find(
        (item) => item.id === activeId
      );

      if (!activeItem) return prev;

      const newContainers = prev.map((container) => {
        if (container.id === activeContainerId) {
          return {
            ...container,
            items: container.items.filter((item) => item.id !== activeId),
          };
        }

        if (container.id === overContainerId) {
          if (overId === overContainerId) {
            return {
              ...container,
              items: [...container.items, activeItem],
            };
          }
        }

        const overItemIndex = container.items.findIndex(
          (item) => item.id === overId
        );
        if (overItemIndex !== -1) {
          return {
            ...container,
            items: [
              ...container.items.slice(0, overItemIndex + 1),
              activeItem,
              ...container.items.slice(overItemIndex + 1),
            ],
          };
        }
        return container;
      });

      return newContainers;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeContainerId = findContainerId(active.id);
    const overContainerId = findContainerId(over.id);

    if (!activeContainerId || !overContainerId) {
      setActiveId(null);
      return;
    }

    if (activeContainerId === overContainerId && active.id !== over.id) {
      const containerIndex = containers.findIndex(
        (c) => c.id === activeContainerId
      );

      if (containerIndex === -1) {
        setActiveId(null);
        return;
      }

      const container = containers[containerIndex];
      const activeIndex = container.items.findIndex(
        (item) => item.id === active.id
      );
      const overIndex = container.items.findIndex(
        (item) => item.id === over.id
      );

      if (activeIndex !== -1 && overIndex !== -1) {
        const newItems = arrayMove(container.items, activeIndex, overIndex);

        setContainers((containers) => {
          return containers.map((c, i) => {
            if (i === containerIndex) {
              return { ...c, items: newItems };
            }
            return c;
          });
        });
      }
    }
    // 0805 做到這邊，overlay 還沒加上去
    setActiveId(null);
  };

  return (
    <div className="mx-auto w-full">
      <h2 className="mb-4 text-xl font-bold dark:text-white">Kanban Board</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {containers.map((container) => (
            <DroppableContainer
              key={container.id}
              id={container.id}
              title={container.title}
              items={container.items}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
