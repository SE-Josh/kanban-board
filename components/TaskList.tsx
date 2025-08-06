import { defaultStatuses, Task } from "@/lib/types";

const TaskList = ({ tasks }: { tasks: Task[] }) => {
  return (
    <div className="overflow-x-auto mt-5 rounded border border-base-content bg-base-100">
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
              <td>
                {
                  defaultStatuses.find((status) => status.id === task.statusId)
                    ?.title
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
