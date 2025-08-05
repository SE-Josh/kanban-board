import { useState } from "react";
import {
  DndContext,
  closestCenter,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  UniqueIdentifier,
  DragCancelEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

interface Item {
  id: string;
  content: string;
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
        <span className="text-gray-500 dark:text-gray-400">⋮⋮</span>
        <span className="dark:text-gray-200">{content}</span>
      </div>
    </li>
  );
};

export default function SortableList() {
  const [items, setItems] = useState<Item[]>([
    { id: "1", content: "Item 1" },
    { id: "2", content: "Item 2" },
    { id: "3", content: "Item 3" },
    { id: "4", content: "Item 4" },
    { id: "5", content: "Item 5" },
  ]);
  void setItems;

  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragCancel = (event: DragCancelEvent) => {
    void event;
    setActiveId(null);
  };

  const getActiveItem = () =>
    items.find((item) => item.id === activeId)?.content;

  return (
    <div className="mx-auto w-full max-w-md rounded-lg border bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-bold dark:text-white">Sortable List</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-2">
            {items.map((item) => (
              <SortableItem key={item.id} id={item.id} content={item.content} />
            ))}
          </ul>
        </SortableContext>

        <DragOverlay
          adjustScale={true}
          dropAnimation={{
            duration: 150,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeId ? (
            <div className="cursor-grabbing rounded-md bg-base-100 p-3 shadow-md">
              <div className="flex items-center gap-3">
                <span className="text-gray-500">⋮⋮</span>
                <span className="text-gray-200">{getActiveItem()}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
