// TaskList.tsx

import { Task, Label, defaultStatuses } from "@/lib/types";
import { Fragment } from "react";

type TaskListProps = {
  tasks: Task[];
  labels: Label[];
  onEditTask: (
    taskId: string,
    newContent: string,
    newLabelId: string | null
  ) => void;
};

const TaskList = ({ tasks, labels, onEditTask }: TaskListProps) => {
  const taskOrder = ["brainstorm", "in-progress", "done", "archived"];
  return (
    <div className="overflow-x-auto mt-5 rounded bg-base-100">
      <table className="table">
        <thead>
          <tr>
            <th>內容</th>
            <th>計畫</th>
            <th>狀態</th>
            <th>建立時間</th>
          </tr>
        </thead>
        <tbody>
          {taskOrder.map((statusId) => {
            return (
              <Fragment key={statusId}>
                {tasks.map((task) => {
                  if (task.statusId === "archived") return null;
                  if (task.statusId === statusId) {
                    return (
                      <tr key={task.id}>
                        <td>{task.content}</td>
                        <td>
                          <select
                            className="select select-bordered select-sm w-full max-w-xs"
                            value={task.labelId ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              onEditTask(
                                task.id,
                                task.content,
                                v === "" ? null : v
                              );
                            }}
                          >
                            <option value="">未分類</option>
                            {labels.map((label) => (
                              <option
                                key={label.id}
                                value={label.id}
                                className={`${label.text}`}
                              >
                                {label.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          {
                            defaultStatuses.find(
                              (status) => status.id === task.statusId
                            )?.title
                          }
                        </td>
                        <td>{new Date(task.createdAt).toLocaleString()}</td>
                      </tr>
                    );
                  }
                })}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
