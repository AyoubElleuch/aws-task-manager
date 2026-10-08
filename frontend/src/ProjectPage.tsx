import { useEffect, useState } from "react";
import { fetchMilestones, createMilestone, deleteMilestone, updateMilestone } from "./milestones/milestonesApi";

import MilestoneCard from "./milestones/MilestoneCard";
import TaskList from "./tasks/TaskList";

type Milestone = { projectId: string; milestoneId: string; name: string };

export default function ProjectPage({ project }: { project: { projectId: string; name: string } }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newMilestoneName, setNewMilestoneName] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchMilestones({ projectId: project.projectId })
      .then((items: Milestone[]) => {
        if (!cancelled) setMilestones(items);
      })
      .catch((cause: unknown) => {
        if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load milestones.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [project.projectId]);

  async function handleUpdate(milestoneId: string, name: string) {
    setError(null);
    try {
      const updated = await updateMilestone({ projectId: project.projectId, milestoneId, name });
      setMilestones((current) => current.map((milestone) => milestone.milestoneId === milestoneId ? updated : milestone));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update milestone.");
    }
  }

  async function handleDelete(milestoneId: string) {
    setError(null);
    try {
      await deleteMilestone({ projectId: project.projectId, milestoneId });
      setMilestones((current) => current.filter((milestone) => milestone.milestoneId !== milestoneId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete milestone.");
    }
  }

  return (
    <div className="project-page">
      <p className="eyebrow">Project workspace</p>
      <h1>{project.name}</h1>
      <p className="muted">Break it down into milestones. Keep the next step close.</p>
      <div className="stats" aria-label="Milestone statistics">
        <div>
          <span className="eyebrow">Milestones</span>
          <strong>{loading || error ? "—" : milestones.length}</strong>
          <span className="muted">In this project</span>
        </div>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && milestones.length === 0 && (
        <div className="empty-state">
          <h2>Start with a milestone.</h2>
          <p className="muted">Give your project its first step below.</p>
        </div>
      )}
      <form className="create-milestone create-form" onSubmit={async (event) => {
        event.preventDefault();
        if (loading || creating || !newMilestoneName.trim()) return;
        setCreating(true);
        setError(null);
        try {
          const newMilestone = await createMilestone({ projectId: project.projectId, name: newMilestoneName.trim() });
          setMilestones((current) => current.concat(newMilestone));
          setNewMilestoneName("");
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "Could not create milestone.");
        } finally {
          setCreating(false);
        }
      }}>
        <label htmlFor="new-milestone-name">New milestone</label>
        <input
          id="new-milestone-name"
          placeholder="e.g. First release"
          maxLength={200}
          required
          value={newMilestoneName}
          onChange={(event) => setNewMilestoneName(event.target.value)}
        />
        <button type="submit" disabled={loading || creating || !newMilestoneName.trim()}>{creating ? "Creating…" : "Create milestone"}</button>
      </form>

      <ul className="milestones-list">
        {!loading && milestones.map((milestone) => (
          <li key={milestone.milestoneId}>
            <MilestoneCard
              name={milestone.name}
              onUpdate={name => void handleUpdate(milestone.milestoneId, name)}
              onDelete={() => void handleDelete(milestone.milestoneId)}
            />
            <TaskList
              key={`${project.projectId}:${milestone.milestoneId}`}
              projectId={project.projectId}
              milestoneId={milestone.milestoneId}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
