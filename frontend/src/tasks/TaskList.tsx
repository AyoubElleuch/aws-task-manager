import { useEffect, useState } from "react";
import TaskCard from "./TaskCard";
import { deleteTask, fetchTasks, updateTask } from "./tasksApi";

type Task = { taskId: string; name: string };

export default function TaskList({ projectId, milestoneId }: { projectId: string; milestoneId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetchTasks({ projectId, milestoneId }).then(setTasks).catch(console.error);
  }, [projectId, milestoneId]);

  return (
    <ul className="tasks-list" aria-label="Tasks">
      {tasks.map(task => (
        <li key={task.taskId}>
          <TaskCard
            name={task.name}
            onUpdate={name => {
              if (!name.trim()) return;
              updateTask({ projectId, milestoneId, taskId: task.taskId, name: name.trim() })
                .then(updated => setTasks(current => current.map(item => item.taskId === task.taskId ? updated : item)))
                .catch(console.error);
            }}
            onDelete={() => deleteTask({ projectId, milestoneId, taskId: task.taskId })
              .then(() => setTasks(current => current.filter(item => item.taskId !== task.taskId)))
              .catch(console.error)}
          />
        </li>
      ))}
    </ul>
  );
}
