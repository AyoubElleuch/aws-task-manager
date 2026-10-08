import { useEffect, useState } from "react";
import TaskCard from "./TaskCard";
import { createTask, deleteTask, fetchTasks, updateTask } from "./tasksApi";

type Task = { taskId: string; name: string };

export default function TaskList({ projectId, milestoneId }: { projectId: string; milestoneId: string }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchTasks({ projectId, milestoneId })
      .then(items => { if (active) setTasks(items); })
      .catch(console.error)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [projectId, milestoneId]);

  return (
    <div className="task-section">
      <p className="eyebrow">{loading ? "Loading tasks…" : `${tasks.length} tasks`}</p>
      {!loading && tasks.length === 0 && <p className="muted">No tasks yet. Add your next step.</p>}
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
      <form className="task-form" onSubmit={async (event) => {
        event.preventDefault();
        if (loading || creating || !name.trim()) return;
        setCreating(true);
        try {
          const task = await createTask({ projectId, milestoneId, name: name.trim() });
          setTasks(current => current.concat(task));
          setName("");
        } catch (cause) {
          console.error(cause);
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
