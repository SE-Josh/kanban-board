"use client";

import React, { useState } from "react";
import BasicDragDrop from "@/components/BasicDragDrop";
import SortableList from "@/components/SortableList";
import Kanban from "@/components/Kanban";
import NewKanban from "@/components/NewKanban";

export default function Home() {
  // const [activeTab, setActiveTab] = useState<"newKanban" | "basic" | "sortable" | "multiple">("newKanban");

  return (
    <div className="mx-auto max-w-4xl p-4">
      {/* <div className="mb-6">
        <div className="flex border-b dark:border-gray-700">
          <button
            className={`px-4 py-2 ${
              activeTab === "newKanban" ? "border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("newKanban")}
          >
            康邦 博德
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "basic" ? "border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("basic")}
          >
            Basic Drag & Drop
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "sortable" ? "border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("sortable")}
          >
            Sortable List
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "multiple" ? "border-b-2 border-blue-500 font-medium text-blue-600 dark:text-blue-400" : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
            onClick={() => setActiveTab("multiple")}
          >
            Multiple Containers
          </button>
        </div>
      </div> */}

      <div className="rounded-lg p-6 pb-3 bg-base-200">
        <NewKanban />
      </div>

      {/* <div className="rounded-lg p-6 bg-base-200">
        {activeTab === "newKanban" && <NewKanban />}

        {activeTab === "basic" && (
          <div>
            <h2 className="mb-4 text-xl font-bold dark:text-white">Basic Drag & Drop</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">A simple example of dragging an item to a drop area. This demonstrates the core functionality of @dnd-kit.</p>
            <BasicDragDrop />
          </div>
        )}

        {activeTab === "sortable" && (
          <div>
            <h2 className="mb-4 text-xl font-bold dark:text-white">Sortable List</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">A list where items can be reordered by dragging. Uses the @dnd-kit/sortable extension to enable intuitive sorting.</p>
            <SortableList />
          </div>
        )}

        {activeTab === "multiple" && (
          <div>
            <h2 className="mb-4 text-xl font-bold dark:text-white">Multiple Containers</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">A Kanban-style board where items can be dragged between containers and sorted within each container.</p>
            <Kanban />
          </div>
        )}
      </div> */}
    </div>
  );
}
