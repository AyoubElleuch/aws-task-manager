import { useEffect, useState } from "react";
import TaskCard from "./TaskCard";
import { createTask, deleteTask, fetchTasks, updateTask } from "./tasksApi";

type Task = { taskId: string; name: string };

export default function TaskList({ projectId, milestoneId }: { projectId: string; milestoneId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    fetchTasks({ projectId, milestoneId })
      .then(items => {
        if (active) setTasks(items);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load tasks.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [projectId, milestoneId]);

  let heading = "Tasks";
  if (loading) heading = "Loading tasks…";
  else if (!error) heading = tasks.length === 1 ? "1 task" : `${tasks.length} tasks`;

  return (
    <div className="task-section">
      <p className="eyebrow">{heading}</p>
      {error && <p role="alert">{error}</p>}
      {!loading && !error && tasks.length === 0 && <p className="muted">No tasks yet. Add your next step.</p>}
      <ul className="tasks-list" aria-label="Tasks">
        {tasks.map(task => (
          <li key={task.taskId}>
            <TaskCard
              name={task.name}
              onUpdate={name => {
                setError("");
                updateTask({ projectId, milestoneId, taskId: task.taskId, name })
                  .then(updated => setTasks(current => current.map(item => item.taskId === task.taskId ? updated : item)))
                  .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not update task."));
              }}
              onDelete={() => {
                setError("");
                void deleteTask({ projectId, milestoneId, taskId: task.taskId })
                  .then(() => setTasks(current => current.filter(item => item.taskId !== task.taskId)))
                  .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not delete task."));
              }}
            />
          </li>
        ))}
      </ul>
      <form className="task-form" onSubmit={async (event) => {
        event.preventDefault();
        if (loading || creating || !name.trim()) return;
        setCreating(true);
        setError("");
        try {
          const task = await createTask({ projectId, milestoneId, name: name.trim() });
          setTasks(current => current.concat(task));
          setName("");
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Could not create task.");
        } finally {
          setCreating(false);
        }
      }}>
        <input
          aria-label="New task"
          placeholder="Add a task…"
          value={name}
          onChange={event => setName(event.target.value)}
          required
          maxLength={200}
        />
        <button type="submit" disabled={loading || creating || !name.trim()}>{creating ? "Adding…" : "Add task"}</button>
      </form>
    </div>
  );
}
